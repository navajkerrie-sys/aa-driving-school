import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  // Guest or logged-in user
  customerName: varchar("customerName", { length: 128 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  courseType: mysqlEnum("courseType", [
    "beginner",
    "intermediate",
    "advanced",
    "defensive",
    "refresher",
  ]).notNull(),
  preferredDate: varchar("preferredDate", { length: 20 }).notNull(), // YYYY-MM-DD
  preferredTime: varchar("preferredTime", { length: 10 }).notNull(), // HH:MM
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"])
    .default("pending")
    .notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "failed"])
    .default("unpaid")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── Payments ────────────────────────────────────────────────────────────────

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  mpesaPhone: varchar("mpesaPhone", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  checkoutRequestId: varchar("checkoutRequestId", { length: 128 }),
  merchantRequestId: varchar("merchantRequestId", { length: 128 }),
  mpesaReceiptNumber: varchar("mpesaReceiptNumber", { length: 64 }),
  status: mysqlEnum("status", ["initiated", "pending", "completed", "failed", "cancelled"])
    .default("initiated")
    .notNull(),
  resultCode: varchar("resultCode", { length: 10 }),
  resultDesc: text("resultDesc"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
