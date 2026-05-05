import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  ArrowLeft,
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Status badge helpers ─────────────────────────────────────────────────────
function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ElementType }> = {
    pending: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Clock },
    confirmed: { color: "bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border-[oklch(0.72_0.18_185/0.3)]", icon: CheckCircle2 },
    cancelled: { color: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
    completed: { color: "bg-green-500/15 text-green-400 border-green-500/30", icon: CheckCircle2 },
  };
  const s = map[status] ?? map.pending;
  return (
    <Badge className={`${s.color} font-sub text-xs flex items-center gap-1 w-fit`}>
      <s.icon className="w-3 h-3" /> {status}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    unpaid: "bg-[oklch(0.60_0.01_210/0.3)] text-[oklch(0.60_0.01_210)] border-[oklch(0.60_0.01_210/0.3)]",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    paid: "bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border-[oklch(0.72_0.18_185/0.3)]",
    failed: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <Badge className={`${map[status] ?? map.unpaid} font-sub text-xs`}>
      {status}
    </Badge>
  );
}

// ─── Booking row ──────────────────────────────────────────────────────────────
function BookingRow({ booking, onStatusChange }: {
  booking: {
    id: number; customerName: string; customerEmail: string; customerPhone: string;
    courseType: string; preferredDate: string; preferredTime: string;
    status: string; paymentStatus: string; notes: string | null; createdAt: Date;
  };
  onStatusChange: (id: number, status: "pending" | "confirmed" | "cancelled" | "completed") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [changing, setChanging] = useState(false);

  const handleStatus = async (status: "pending" | "confirmed" | "cancelled" | "completed") => {
    setChanging(true);
    onStatusChange(booking.id, status);
    setTimeout(() => setChanging(false), 800);
  };

  return (
    <div className="rounded-xl border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.8)] overflow-hidden">
      <div
        className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-[oklch(0.15_0.02_210/0.5)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-sub font-bold text-[oklch(0.72_0.18_185)] text-sm w-10">#{booking.id}</span>
        <span className="font-sub font-semibold text-white flex-1 min-w-[120px]">{booking.customerName}</span>
        <Badge className="bg-[oklch(0.65_0.18_45/0.15)] text-[oklch(0.65_0.18_45)] border-[oklch(0.65_0.18_45/0.3)] font-sub text-xs capitalize">
          {booking.courseType}
        </Badge>
        <span className="font-sub text-xs text-[oklch(0.65_0.01_210)] flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {booking.preferredDate} {booking.preferredTime}
        </span>
        <BookingStatusBadge status={booking.status} />
        <PaymentStatusBadge status={booking.paymentStatus} />
        {expanded ? <ChevronUp className="w-4 h-4 text-[oklch(0.60_0.01_210)]" /> : <ChevronDown className="w-4 h-4 text-[oklch(0.60_0.01_210)]" />}
      </div>

      {expanded && (
        <div className="border-t border-[oklch(0.22_0.018_210)] p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="font-sub text-xs text-[oklch(0.55_0.01_210)] mb-0.5">Email</div>
              <div className="font-sub text-[oklch(0.80_0.01_210)]">{booking.customerEmail}</div>
            </div>
            <div>
              <div className="font-sub text-xs text-[oklch(0.55_0.01_210)] mb-0.5">Phone</div>
              <div className="font-sub text-[oklch(0.80_0.01_210)]">{booking.customerPhone}</div>
            </div>
            <div>
              <div className="font-sub text-xs text-[oklch(0.55_0.01_210)] mb-0.5">Booked On</div>
              <div className="font-sub text-[oklch(0.80_0.01_210)]">{new Date(booking.createdAt).toLocaleDateString()}</div>
            </div>
            {booking.notes && (
              <div className="col-span-full">
                <div className="font-sub text-xs text-[oklch(0.55_0.01_210)] mb-0.5">Notes</div>
                <div className="font-sub text-[oklch(0.80_0.01_210)]">{booking.notes}</div>
              </div>
            )}
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="font-sub text-xs text-[oklch(0.55_0.01_210)] self-center">Update status:</span>
            {(["pending", "confirmed", "cancelled", "completed"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant="ghost"
                disabled={booking.status === s || changing}
                onClick={() => handleStatus(s)}
                className={`font-sub text-xs capitalize ${booking.status === s ? "text-[oklch(0.72_0.18_185)] bg-[oklch(0.72_0.18_185/0.1)]" : "text-[oklch(0.65_0.01_210)] hover:text-white"}`}
              >
                {changing ? <Loader2 className="w-3 h-3 animate-spin" /> : s}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "payments">("bookings");

  const bookingsQuery = trpc.admin.getBookings.useQuery(undefined, { enabled: user?.role === "admin" });
  const paymentsQuery = trpc.admin.getPayments.useQuery(undefined, { enabled: user?.role === "admin" });
  const updateStatusMutation = trpc.admin.updateBookingStatus.useMutation();
  const utils = trpc.useUtils();

  const handleStatusChange = async (id: number, status: "pending" | "confirmed" | "cancelled" | "completed") => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      await utils.admin.getBookings.invalidate();
      toast.success(`Booking #${id} status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[oklch(0.10_0.015_210)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[oklch(0.72_0.18_185)] animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[oklch(0.10_0.015_210)] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[oklch(0.65_0.22_25)] mx-auto mb-4" />
          <h2 className="font-display text-4xl text-white mb-2">ACCESS DENIED</h2>
          <p className="font-sub text-[oklch(0.65_0.01_210)] mb-6">You must be an admin to access this page.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const bookings = bookingsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  // Stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const paidPayments = payments.filter((p) => p.status === "completed").length;
  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.015_210)]">
      {/* Fixed background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.72_0.18_185/0.03)] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.65_0.18_45/0.03)] blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[oklch(0.10_0.015_210/0.95)] backdrop-blur-xl border-b border-[oklch(0.72_0.18_185/0.2)]">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg text-white tracking-wider hidden sm:block">AA DRIVING SCHOOL</span>
            </Link>
            <Badge className="bg-[oklch(0.65_0.18_45/0.15)] text-[oklch(0.65_0.18_45)] border-[oklch(0.65_0.18_45/0.3)] font-sub text-xs">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-sub text-xs text-[oklch(0.60_0.01_210)] hidden sm:block">{user.name}</span>
            <Link href="/">
              <Button variant="ghost" size="sm" className="font-sub text-[oklch(0.70_0.01_210)] hover:text-white gap-2">
                <ArrowLeft className="w-4 h-4" /> Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-5xl text-white mb-1">ADMIN DASHBOARD</h1>
          <p className="font-sub text-[oklch(0.65_0.01_210)]">Manage bookings and payment records for AA Driving School</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: totalBookings, icon: Users, color: "teal" },
            { label: "Confirmed", value: confirmedBookings, icon: CheckCircle2, color: "green" },
            { label: "Pending", value: pendingBookings, icon: Clock, color: "orange" },
            { label: "Revenue", value: `KES ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "teal" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.8)] p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color === "teal" ? "bg-[oklch(0.72_0.18_185/0.15)]" : stat.color === "orange" ? "bg-[oklch(0.65_0.18_45/0.15)]" : "bg-green-500/15"}`}>
                <stat.icon className={`w-4 h-4 ${stat.color === "teal" ? "text-[oklch(0.72_0.18_185)]" : stat.color === "orange" ? "text-[oklch(0.65_0.18_45)]" : "text-green-400"}`} />
              </div>
              <div className={`font-display text-3xl mb-0.5 ${stat.color === "teal" ? "text-[oklch(0.72_0.18_185)]" : stat.color === "orange" ? "text-[oklch(0.65_0.18_45)]" : "text-green-400"}`}>
                {stat.value}
              </div>
              <div className="font-sub text-xs text-[oklch(0.60_0.01_210)]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "bookings" as const, label: "Bookings", icon: Calendar, count: totalBookings },
            { id: "payments" as const, label: "Payments", icon: CreditCard, count: paidPayments },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sub font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border border-[oklch(0.72_0.18_185/0.3)]"
                  : "text-[oklch(0.65_0.01_210)] border border-[oklch(0.22_0.018_210)] hover:border-[oklch(0.72_0.18_185/0.3)] hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <Badge className="bg-[oklch(0.22_0.018_210)] text-[oklch(0.70_0.01_210)] border-0 text-xs font-sub">
                {tab.count}
              </Badge>
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { bookingsQuery.refetch(); paymentsQuery.refetch(); }}
            className="ml-auto font-sub text-[oklch(0.65_0.01_210)] hover:text-white gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div>
            {bookingsQuery.isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-[oklch(0.72_0.18_185)] animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-[oklch(0.55_0.01_210)] font-sub">
                No bookings yet.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <BookingRow key={b.id} booking={b} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments tab */}
        {activeTab === "payments" && (
          <div>
            {paymentsQuery.isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-[oklch(0.72_0.18_185)] animate-spin" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16 text-[oklch(0.55_0.01_210)] font-sub">
                No payments yet.
              </div>
            ) : (
              <div className="rounded-xl border border-[oklch(0.22_0.018_210)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210)]">
                        {["ID", "Booking", "Phone", "Amount", "Status", "Receipt", "Date"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 font-sub text-xs text-[oklch(0.55_0.01_210)] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-[oklch(0.18_0.015_210)] hover:bg-[oklch(0.15_0.02_210/0.5)] transition-colors">
                          <td className="px-4 py-3 font-sub text-sm text-[oklch(0.72_0.18_185)] font-bold">#{p.id}</td>
                          <td className="px-4 py-3 font-sub text-sm text-white">#{p.bookingId}</td>
                          <td className="px-4 py-3 font-sub text-sm text-[oklch(0.75_0.01_210)]">{p.mpesaPhone}</td>
                          <td className="px-4 py-3 font-sub text-sm text-[oklch(0.65_0.18_45)] font-semibold">KES {Number(p.amount).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge className={`font-sub text-xs ${
                              p.status === "completed" ? "bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border-[oklch(0.72_0.18_185/0.3)]"
                              : p.status === "failed" ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                            }`}>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-sub text-xs text-[oklch(0.65_0.01_210)]">{p.mpesaReceiptNumber ?? "—"}</td>
                          <td className="px-4 py-3 font-sub text-xs text-[oklch(0.55_0.01_210)]">{new Date(p.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
