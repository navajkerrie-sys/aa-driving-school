# AA Driving School — Project TODO

## Database & Backend
- [x] Extend drizzle schema with bookings and payments tables
- [x] Generate and apply DB migration SQL
- [x] Add DB query helpers in server/db.ts
- [x] Add tRPC routers: bookings, payments, admin
- [x] M-Pesa STK Push server-side integration
- [x] M-Pesa payment status polling endpoint
- [x] Owner notification on new booking
- [x] Owner notification on payment confirmation
- [x] Admin-only procedures for managing bookings/payments

## Landing Page
- [x] Global theme, fonts, and CSS variables (teal/burnt-orange cinematic palette)
- [x] Navbar with logo and navigation links
- [x] Hero section with 3D animated background and mouse-tracking parallax
- [x] Services overview section
- [x] Instructor profiles section
- [x] Testimonials section
- [x] Contact information section
- [x] Footer

## Booking Flow
- [x] Booking page with course type selection
- [x] Calendar date/time picker
- [x] Booking summary and confirmation screen
- [x] Booking success state with payment prompt

## Payment Flow
- [x] M-Pesa STK Push trigger UI (phone number input)
- [x] Real-time payment status polling UI
- [x] Payment confirmed screen
- [x] Payment failed/retry screen

## Admin Dashboard
- [x] Admin route guard (owner/admin only)
- [x] Bookings list with status management
- [x] Payment records view
- [x] Booking detail modal/drawer

## Testing & Polish
- [x] Vitest unit tests for booking and payment procedures
- [x] Mobile-first responsive review
- [x] Performance and animation polish
- [x] Checkpoint and delivery
