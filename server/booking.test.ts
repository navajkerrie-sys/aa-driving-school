import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  createBooking: vi.fn().mockResolvedValue({ insertId: 42 }),
  getBookingById: vi.fn().mockResolvedValue({
    id: 42,
    customerName: "Test User",
    customerEmail: "test@example.com",
    customerPhone: "0712345678",
    courseType: "beginner",
    preferredDate: "2026-06-01",
    preferredTime: "09:00",
    notes: null,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getAllBookings: vi.fn().mockResolvedValue([]),
  updateBookingStatus: vi.fn().mockResolvedValue(undefined),
  updateBookingPaymentStatus: vi.fn().mockResolvedValue(undefined),
  createPayment: vi.fn().mockResolvedValue({ insertId: 1 }),
  getPaymentByBookingId: vi.fn().mockResolvedValue(null),
  getPaymentByCheckoutRequestId: vi.fn().mockResolvedValue(null),
  updatePayment: vi.fn().mockResolvedValue(undefined),
  getAllPayments: vi.fn().mockResolvedValue([]),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@aadrivingschool.co.ke",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("booking.create", () => {
  it("creates a booking and returns bookingId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.booking.create({
      customerName: "John Kamau",
      customerEmail: "john@example.com",
      customerPhone: "0712345678",
      courseType: "beginner",
      preferredDate: "2026-06-01",
      preferredTime: "09:00",
    });

    expect(result.success).toBe(true);
    expect(result.bookingId).toBe(42);
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.booking.create({
        customerName: "John",
        customerEmail: "not-an-email",
        customerPhone: "0712345678",
        courseType: "beginner",
        preferredDate: "2026-06-01",
        preferredTime: "09:00",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid date format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.booking.create({
        customerName: "John",
        customerEmail: "john@example.com",
        customerPhone: "0712345678",
        courseType: "beginner",
        preferredDate: "01/06/2026", // wrong format
        preferredTime: "09:00",
      })
    ).rejects.toThrow();
  });
});

describe("booking.getById", () => {
  it("returns a booking by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.booking.getById({ id: 42 });
    expect(result.id).toBe(42);
    expect(result.customerName).toBe("Test User");
  });
});

describe("admin.getBookings", () => {
  it("allows admin to get all bookings", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getBookings();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getBookings()).rejects.toThrow();
  });
});

describe("admin.updateBookingStatus", () => {
  it("allows admin to update booking status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateBookingStatus({ id: 42, status: "confirmed" });
    expect(result.success).toBe(true);
  });
});
