import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import {
  createBooking,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
  updateBookingPaymentStatus,
  createPayment,
  getPaymentByBookingId,
  getPaymentByCheckoutRequestId,
  updatePayment,
  getAllPayments,
} from "./db";

// ─── Admin guard ─────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

// ─── M-Pesa helpers ──────────────────────────────────────────────────────────
async function getMpesaToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || "";
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || "";
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const isSandbox = process.env.MPESA_SANDBOX === "true";
  const url = isSandbox
    ? "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    : "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const res = await fetch(url, { headers: { Authorization: `Basic ${credentials}` } });
  if (!res.ok) throw new Error(`M-Pesa auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

function getMpesaTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

function getMpesaPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

async function initiateStkPush(phone: string, amount: number, bookingId: number, accountRef: string) {
  const isSandbox = process.env.MPESA_SANDBOX === "true";
  const shortcode = process.env.MPESA_SHORTCODE || "174379";
  const passkey = process.env.MPESA_PASSKEY || "";
  const callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.APP_URL || "https://localhost:3000"}/api/mpesa/callback`;

  const token = await getMpesaToken();
  const timestamp = getMpesaTimestamp();
  const password = getMpesaPassword(shortcode, passkey, timestamp);

  // Normalize phone: strip leading 0 or +254 and prepend 254
  let normalizedPhone = phone.replace(/\s+/g, "");
  if (normalizedPhone.startsWith("+")) normalizedPhone = normalizedPhone.slice(1);
  if (normalizedPhone.startsWith("0")) normalizedPhone = "254" + normalizedPhone.slice(1);
  if (!normalizedPhone.startsWith("254")) normalizedPhone = "254" + normalizedPhone;

  const url = isSandbox
    ? "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    : "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(amount),
    PartyA: normalizedPhone,
    PartyB: shortcode,
    PhoneNumber: normalizedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountRef,
    TransactionDesc: `AA Driving School Booking #${bookingId}`,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`STK Push failed: ${errText}`);
  }
  return (await res.json()) as {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  };
}

// ─── Routers ─────────────────────────────────────────────────────────────────

const bookingRouter = router({
  create: publicProcedure
    .input(
      z.object({
        customerName: z.string().min(2).max(128),
        customerEmail: z.string().email(),
        customerPhone: z.string().min(9).max(20),
        courseType: z.enum(["beginner", "intermediate", "advanced", "defensive", "refresher"]),
        preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        preferredTime: z.string().regex(/^\d{2}:\d{2}$/),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await createBooking(input);
      const insertId = (result as unknown as { insertId: number }).insertId;

      // Notify owner
      await notifyOwner({
        title: "New Booking — AA Driving School",
        content: `A new appointment has been booked!\n\nName: ${input.customerName}\nEmail: ${input.customerEmail}\nPhone: ${input.customerPhone}\nCourse: ${input.courseType}\nDate: ${input.preferredDate} at ${input.preferredTime}`,
      }).catch(console.error);

      return { success: true, bookingId: insertId };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const booking = await getBookingById(input.id);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      return booking;
    }),
});

const paymentRouter = router({
  initiate: publicProcedure
    .input(
      z.object({
        bookingId: z.number(),
        mpesaPhone: z.string().min(9).max(20),
        amount: z.number().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const booking = await getBookingById(input.bookingId);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });

      // Create payment record first
      const paymentResult = await createPayment({
        bookingId: input.bookingId,
        mpesaPhone: input.mpesaPhone,
        amount: String(input.amount),
        status: "initiated",
      });
      const paymentId = (paymentResult as unknown as { insertId: number }).insertId;

      // Update booking payment status
      await updateBookingPaymentStatus(input.bookingId, "pending");

      // Check if M-Pesa credentials are configured
      const hasCredentials = !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_PASSKEY);

      if (!hasCredentials) {
        // Demo mode: simulate STK push
        await updatePayment(paymentId, { status: "pending", checkoutRequestId: `DEMO-${Date.now()}`, merchantRequestId: `DEMO-MR-${Date.now()}` });
        return { success: true, paymentId, checkoutRequestId: `DEMO-${Date.now()}`, demo: true };
      }

      try {
        const stkResponse = await initiateStkPush(
          input.mpesaPhone,
          input.amount,
          input.bookingId,
          `AADS-${input.bookingId}`
        );

        await updatePayment(paymentId, {
          status: "pending",
          checkoutRequestId: stkResponse.CheckoutRequestID,
          merchantRequestId: stkResponse.MerchantRequestID,
        });

        return { success: true, paymentId, checkoutRequestId: stkResponse.CheckoutRequestID, demo: false };
      } catch (err) {
        await updatePayment(paymentId, { status: "failed", resultDesc: String(err) });
        await updateBookingPaymentStatus(input.bookingId, "failed");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to initiate M-Pesa payment" });
      }
    }),

  checkStatus: publicProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      const payment = await getPaymentByBookingId(input.bookingId);
      if (!payment) return { status: "not_found" as const };
      return {
        status: payment.status,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        resultDesc: payment.resultDesc,
        amount: payment.amount,
      };
    }),

  // Simulate payment completion in demo mode
  simulateSuccess: publicProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input }) => {
      const payment = await getPaymentByBookingId(input.bookingId);
      if (!payment) throw new TRPCError({ code: "NOT_FOUND" });

      const receiptNo = `DEMO${Date.now().toString().slice(-8)}`;
      await updatePayment(payment.id, {
        status: "completed",
        mpesaReceiptNumber: receiptNo,
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
      });
      await updateBookingPaymentStatus(input.bookingId, "paid");
      await updateBookingStatus(input.bookingId, "confirmed");

      const booking = await getBookingById(input.bookingId);
      if (booking) {
        await notifyOwner({
          title: "Payment Confirmed — AA Driving School",
          content: `M-Pesa payment confirmed!\n\nBooking #${input.bookingId}\nName: ${booking.customerName}\nPhone: ${booking.customerPhone}\nReceipt: ${receiptNo}\nAmount: KES ${payment.amount}`,
        }).catch(console.error);
      }

      return { success: true, receiptNumber: receiptNo };
    }),
});

// M-Pesa callback handler (registered as express route)
const mpesaCallbackRouter = router({
  callback: publicProcedure
    .input(z.object({
      Body: z.object({
        stkCallback: z.object({
          MerchantRequestID: z.string(),
          CheckoutRequestID: z.string(),
          ResultCode: z.number(),
          ResultDesc: z.string(),
          CallbackMetadata: z.object({
            Item: z.array(z.object({ Name: z.string(), Value: z.unknown().optional() })),
          }).optional(),
        }),
      }),
    }))
    .mutation(async ({ input }) => {
      const cb = input.Body.stkCallback;
      const payment = await getPaymentByCheckoutRequestId(cb.CheckoutRequestID);
      if (!payment) return { success: false };

      if (cb.ResultCode === 0) {
        const items = cb.CallbackMetadata?.Item ?? [];
        const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value as string | undefined;
        await updatePayment(payment.id, {
          status: "completed",
          mpesaReceiptNumber: receipt,
          resultCode: String(cb.ResultCode),
          resultDesc: cb.ResultDesc,
        });
        await updateBookingPaymentStatus(payment.bookingId, "paid");
        await updateBookingStatus(payment.bookingId, "confirmed");

        const booking = await getBookingById(payment.bookingId);
        if (booking) {
          await notifyOwner({
            title: "Payment Confirmed — AA Driving School",
            content: `M-Pesa payment confirmed!\n\nBooking #${payment.bookingId}\nName: ${booking.customerName}\nReceipt: ${receipt}\nAmount: KES ${payment.amount}`,
          }).catch(console.error);
        }
      } else {
        await updatePayment(payment.id, {
          status: cb.ResultCode === 1032 ? "cancelled" : "failed",
          resultCode: String(cb.ResultCode),
          resultDesc: cb.ResultDesc,
        });
        await updateBookingPaymentStatus(payment.bookingId, "failed");
      }

      return { success: true };
    }),
});

const adminRouter = router({
  getBookings: adminProcedure.query(async () => {
    return getAllBookings();
  }),

  getPayments: adminProcedure.query(async () => {
    return getAllPayments();
  }),

  updateBookingStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
    }))
    .mutation(async ({ input }) => {
      await updateBookingStatus(input.id, input.status);
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  booking: bookingRouter,
  payment: paymentRouter,
  mpesa: mpesaCallbackRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
