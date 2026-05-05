import type { Express, Request, Response } from "express";
import { notifyOwner } from "./_core/notification";
import {
  getPaymentByCheckoutRequestId,
  updatePayment,
  updateBookingPaymentStatus,
  updateBookingStatus,
  getBookingById,
} from "./db";

/**
 * Registers the M-Pesa STK Push callback route.
 * Safaricom will POST to this endpoint after a payment attempt.
 */
export function registerMpesaCallback(app: Express) {
  app.post("/api/mpesa/callback", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const cb = body?.Body?.stkCallback;

      if (!cb) {
        console.warn("[M-Pesa] Invalid callback body received");
        res.json({ ResultCode: 0, ResultDesc: "Accepted" });
        return;
      }

      const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = cb;

      const payment = await getPaymentByCheckoutRequestId(CheckoutRequestID);
      if (!payment) {
        console.warn(`[M-Pesa] No payment found for CheckoutRequestID: ${CheckoutRequestID}`);
        res.json({ ResultCode: 0, ResultDesc: "Accepted" });
        return;
      }

      if (ResultCode === 0) {
        // Payment successful
        const items: Array<{ Name: string; Value?: unknown }> = CallbackMetadata?.Item ?? [];
        const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value as string | undefined;
        const amount = items.find((i) => i.Name === "Amount")?.Value as number | undefined;

        await updatePayment(payment.id, {
          status: "completed",
          mpesaReceiptNumber: receipt,
          resultCode: String(ResultCode),
          resultDesc: ResultDesc,
        });
        await updateBookingPaymentStatus(payment.bookingId, "paid");
        await updateBookingStatus(payment.bookingId, "confirmed");

        const booking = await getBookingById(payment.bookingId);
        if (booking) {
          await notifyOwner({
            title: "✅ Payment Confirmed — AA Driving School",
            content: [
              `M-Pesa payment confirmed for Booking #${payment.bookingId}`,
              ``,
              `Customer: ${booking.customerName}`,
              `Phone: ${booking.customerPhone}`,
              `Course: ${booking.courseType}`,
              `Date: ${booking.preferredDate} at ${booking.preferredTime}`,
              `Receipt: ${receipt ?? "N/A"}`,
              `Amount: KES ${amount ?? payment.amount}`,
            ].join("\n"),
          }).catch(console.error);
        }

        console.log(`[M-Pesa] Payment completed for booking #${payment.bookingId}, receipt: ${receipt}`);
      } else {
        // Payment failed or cancelled
        const isCancelled = ResultCode === 1032;
        await updatePayment(payment.id, {
          status: isCancelled ? "cancelled" : "failed",
          resultCode: String(ResultCode),
          resultDesc: ResultDesc,
        });
        await updateBookingPaymentStatus(payment.bookingId, "failed");
        console.log(`[M-Pesa] Payment ${isCancelled ? "cancelled" : "failed"} for booking #${payment.bookingId}: ${ResultDesc}`);
      }

      // Always respond with success to Safaricom
      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (err) {
      console.error("[M-Pesa] Callback error:", err);
      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
  });
}
