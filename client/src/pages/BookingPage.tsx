import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Car,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  BookOpen,
  Zap,
  Shield,
  Award,
  Loader2,
  Smartphone,
  RefreshCw,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type CourseType = "beginner" | "intermediate" | "advanced" | "defensive" | "refresher";
type Step = "course" | "datetime" | "details" | "payment" | "success";

// ─── Course data ──────────────────────────────────────────────────────────────
const COURSES: { id: CourseType; label: string; desc: string; price: number; duration: string; icon: React.ElementType; color: string }[] = [
  { id: "beginner", label: "Beginner", desc: "Perfect for first-time learners. Learn the basics of vehicle control and road rules.", price: 8000, duration: "20 hours", icon: BookOpen, color: "teal" },
  { id: "intermediate", label: "Intermediate", desc: "Build on your basics with highway and night driving.", price: 6000, duration: "15 hours", icon: Car, color: "orange" },
  { id: "advanced", label: "Advanced", desc: "Master defensive driving and emergency maneuvers.", price: 10000, duration: "25 hours", icon: Zap, color: "teal" },
  { id: "defensive", label: "Defensive Driving", desc: "NTSA-approved course recognized by insurance companies.", price: 7500, duration: "18 hours", icon: Shield, color: "orange" },
  { id: "refresher", label: "Refresher", desc: "Get back behind the wheel with confidence.", price: 4000, duration: "8 hours", icon: RefreshCw, color: "teal" },
];

const TIME_SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS: { id: Step; label: string }[] = [
  { id: "course", label: "Course" },
  { id: "datetime", label: "Date & Time" },
  { id: "details", label: "Your Details" },
  { id: "payment", label: "Payment" },
  { id: "success", label: "Confirmed" },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${idx <= currentIdx ? "opacity-100" : "opacity-40"}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-sub font-bold transition-all ${
                idx < currentIdx
                  ? "bg-[oklch(0.72_0.18_185)] text-[oklch(0.10_0.015_210)]"
                  : idx === currentIdx
                  ? "bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white shadow-[0_0_12px_oklch(0.72_0.18_185/0.5)]"
                  : "bg-[oklch(0.22_0.018_210)] text-[oklch(0.60_0.01_210)]"
              }`}
            >
              {idx < currentIdx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
            </div>
            <span className="hidden sm:block font-sub text-xs text-[oklch(0.70_0.01_210)]">{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-8 sm:w-12 h-px transition-all ${idx < currentIdx ? "bg-[oklch(0.72_0.18_185)]" : "bg-[oklch(0.22_0.018_210)]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Course Selection ─────────────────────────────────────────────────
function CourseStep({ selected, onSelect, onNext }: { selected: CourseType | null; onSelect: (c: CourseType) => void; onNext: () => void }) {
  return (
    <div>
      <h2 className="font-display text-4xl sm:text-5xl text-white text-center mb-2">SELECT YOUR COURSE</h2>
      <p className="font-sub text-[oklch(0.65_0.01_210)] text-center mb-8">Choose the program that best fits your needs</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {COURSES.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`text-left rounded-2xl p-5 border transition-all duration-200 ${
              selected === c.id
                ? "border-[oklch(0.72_0.18_185)] bg-[oklch(0.72_0.18_185/0.1)] shadow-[0_0_20px_oklch(0.72_0.18_185/0.2)]"
                : "border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.5)] hover:border-[oklch(0.72_0.18_185/0.4)]"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color === "teal" ? "bg-[oklch(0.72_0.18_185/0.15)]" : "bg-[oklch(0.65_0.18_45/0.15)]"}`}>
              <c.icon className={`w-5 h-5 ${c.color === "teal" ? "text-[oklch(0.72_0.18_185)]" : "text-[oklch(0.65_0.18_45)]"}`} />
            </div>
            <div className="font-sub font-bold text-white mb-1">{c.label}</div>
            <div className="font-sub text-xs text-[oklch(0.60_0.01_210)] mb-3 leading-relaxed">{c.desc}</div>
            <div className="flex items-center justify-between">
              <span className={`font-display text-xl ${c.color === "teal" ? "text-[oklch(0.72_0.18_185)]" : "text-[oklch(0.65_0.18_45)]"}`}>
                KES {c.price.toLocaleString()}
              </span>
              <span className="font-sub text-xs text-[oklch(0.55_0.01_210)] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {c.duration}
              </span>
            </div>
            {selected === c.id && (
              <div className="mt-2 flex items-center gap-1 text-[oklch(0.72_0.18_185)] text-xs font-sub">
                <CheckCircle2 className="w-3 h-3" /> Selected
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!selected}
          className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold px-8 py-5 tracking-wide disabled:opacity-40"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Date & Time ──────────────────────────────────────────────────────
function DateTimeStep({
  date, time, onDate, onTime, onNext, onBack,
}: {
  date: string; time: string;
  onDate: (d: string) => void; onTime: (t: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  // Generate next 30 days
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  }).filter((d) => d.getDay() !== 0); // exclude Sundays

  const formatDate = (d: Date) =>
    d.toISOString().split("T")[0];

  const displayDate = (d: Date) =>
    d.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div>
      <h2 className="font-display text-4xl sm:text-5xl text-white text-center mb-2">PICK DATE & TIME</h2>
      <p className="font-sub text-[oklch(0.65_0.01_210)] text-center mb-8">Select your preferred lesson date and time slot</p>

      {/* Date picker */}
      <div className="mb-8">
        <Label className="font-sub text-sm text-[oklch(0.70_0.01_210)] mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[oklch(0.72_0.18_185)]" /> Select Date
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
          {days.map((d) => {
            const val = formatDate(d);
            return (
              <button
                key={val}
                onClick={() => onDate(val)}
                className={`rounded-xl py-3 px-2 text-center transition-all border text-xs font-sub ${
                  date === val
                    ? "border-[oklch(0.72_0.18_185)] bg-[oklch(0.72_0.18_185/0.15)] text-white shadow-[0_0_12px_oklch(0.72_0.18_185/0.3)]"
                    : "border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.5)] text-[oklch(0.70_0.01_210)] hover:border-[oklch(0.72_0.18_185/0.4)]"
                }`}
              >
                {displayDate(d)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time picker */}
      <div className="mb-8">
        <Label className="font-sub text-sm text-[oklch(0.70_0.01_210)] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[oklch(0.65_0.18_45)]" /> Select Time
        </Label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => onTime(slot)}
              className={`rounded-xl py-3 text-center transition-all border text-sm font-sub font-medium ${
                time === slot
                  ? "border-[oklch(0.65_0.18_45)] bg-[oklch(0.65_0.18_45/0.15)] text-white shadow-[0_0_12px_oklch(0.65_0.18_45/0.3)]"
                  : "border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.5)] text-[oklch(0.70_0.01_210)] hover:border-[oklch(0.65_0.18_45/0.4)]"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="font-sub text-[oklch(0.70_0.01_210)] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!date || !time}
          className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold px-8 py-5 tracking-wide disabled:opacity-40"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Customer Details ─────────────────────────────────────────────────
function DetailsStep({
  name, email, phone, notes,
  onName, onEmail, onPhone, onNotes,
  onNext, onBack, loading,
}: {
  name: string; email: string; phone: string; notes: string;
  onName: (v: string) => void; onEmail: (v: string) => void;
  onPhone: (v: string) => void; onNotes: (v: string) => void;
  onNext: () => void; onBack: () => void; loading: boolean;
}) {
  const valid = name.length >= 2 && email.includes("@") && phone.length >= 9;
  return (
    <div>
      <h2 className="font-display text-4xl sm:text-5xl text-white text-center mb-2">YOUR DETAILS</h2>
      <p className="font-sub text-[oklch(0.65_0.01_210)] text-center mb-8">We'll use these to confirm your booking</p>

      <div className="space-y-5 max-w-lg mx-auto mb-8">
        <div>
          <Label className="font-sub text-sm text-[oklch(0.70_0.01_210)] mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[oklch(0.72_0.18_185)]" /> Full Name *
          </Label>
          <Input
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="e.g. John Kamau"
            className="bg-[oklch(0.13_0.018_210)] border-[oklch(0.22_0.018_210)] text-white placeholder:text-[oklch(0.45_0.01_210)] focus:border-[oklch(0.72_0.18_185)] font-sub"
          />
        </div>
        <div>
          <Label className="font-sub text-sm text-[oklch(0.70_0.01_210)] mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[oklch(0.72_0.18_185)]" /> Email Address *
          </Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="john@example.com"
            className="bg-[oklch(0.13_0.018_210)] border-[oklch(0.22_0.018_210)] text-white placeholder:text-[oklch(0.45_0.01_210)] focus:border-[oklch(0.72_0.18_185)] font-sub"
          />
        </div>
        <div>
          <Label className="font-sub text-sm text-[oklch(0.70_0.01_210)] mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[oklch(0.72_0.18_185)]" /> Phone Number *
          </Label>
          <Input
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            placeholder="0712 345 678"
            className="bg-[oklch(0.13_0.018_210)] border-[oklch(0.22_0.018_210)] text-white placeholder:text-[oklch(0.45_0.01_210)] focus:border-[oklch(0.72_0.18_185)] font-sub"
          />
        </div>
        <div>
          <Label className="font-sub text-sm text-[oklch(0.70_0.01_210)] mb-2">Additional Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            placeholder="Any special requirements or questions..."
            className="bg-[oklch(0.13_0.018_210)] border-[oklch(0.22_0.018_210)] text-white placeholder:text-[oklch(0.45_0.01_210)] focus:border-[oklch(0.72_0.18_185)] font-sub resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="font-sub text-[oklch(0.70_0.01_210)] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!valid || loading}
          className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold px-8 py-5 tracking-wide disabled:opacity-40"
        >
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</> : <>Confirm Booking <ArrowRight className="w-4 h-4 ml-2" /></>}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4: M-Pesa Payment ───────────────────────────────────────────────────
function PaymentStep({
  bookingId, amount, onSuccess, onBack,
}: {
  bookingId: number; amount: number; onSuccess: (receipt: string) => void; onBack: () => void;
}) {
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [paymentState, setPaymentState] = useState<"idle" | "initiated" | "polling" | "success" | "failed">("idle");
  const [pollCount, setPollCount] = useState(0);
  const [receipt, setReceipt] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  const initiateMutation = trpc.payment.initiate.useMutation();
  const simulateMutation = trpc.payment.simulateSuccess.useMutation();
  const statusQuery = trpc.payment.checkStatus.useQuery(
    { bookingId },
    {
      enabled: paymentState === "polling",
      refetchInterval: paymentState === "polling" ? 3000 : false,
    }
  );

  // Watch status changes
  useEffect(() => {
    if (paymentState !== "polling") return;
    const s = statusQuery.data;
    if (!s) return;
    if (s.status === "completed") {
      setReceipt(s.mpesaReceiptNumber ?? "");
      setPaymentState("success");
      onSuccess(s.mpesaReceiptNumber ?? "");
    } else if (s.status === "failed" || s.status === "cancelled") {
      setPaymentState("failed");
    }
    setPollCount((c) => c + 1);
    if (pollCount >= 40) setPaymentState("failed"); // 2-min timeout
  }, [statusQuery.data, paymentState, pollCount, onSuccess]);

  const handleInitiate = async () => {
    if (!mpesaPhone || mpesaPhone.length < 9) {
      toast.error("Please enter a valid M-Pesa phone number");
      return;
    }
    try {
      setPaymentState("initiated");
      const res = await initiateMutation.mutateAsync({ bookingId, mpesaPhone, amount });
      setIsDemo(res.demo);
      setPaymentState("polling");
    } catch {
      setPaymentState("failed");
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const handleSimulate = async () => {
    try {
      const res = await simulateMutation.mutateAsync({ bookingId });
      setReceipt(res.receiptNumber);
      setPaymentState("success");
      onSuccess(res.receiptNumber);
    } catch {
      toast.error("Simulation failed");
    }
  };

  if (paymentState === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-[oklch(0.72_0.18_185/0.15)] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_oklch(0.72_0.18_185/0.4)]">
          <CheckCircle2 className="w-10 h-10 text-[oklch(0.72_0.18_185)]" />
        </div>
        <h3 className="font-display text-4xl text-white mb-2">PAYMENT CONFIRMED!</h3>
        <p className="font-sub text-[oklch(0.70_0.01_210)] mb-2">M-Pesa Receipt: <span className="text-[oklch(0.72_0.18_185)] font-semibold">{receipt}</span></p>
        <p className="font-sub text-sm text-[oklch(0.60_0.01_210)]">Your booking is now confirmed. We'll send details to your email.</p>
      </div>
    );
  }

  if (paymentState === "failed") {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-[oklch(0.65_0.22_25/0.15)] flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-[oklch(0.65_0.22_25)]" />
        </div>
        <h3 className="font-display text-4xl text-white mb-2">PAYMENT FAILED</h3>
        <p className="font-sub text-[oklch(0.70_0.01_210)] mb-6">The payment was not completed. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onBack} className="font-sub text-[oklch(0.70_0.01_210)]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={() => setPaymentState("idle")} className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (paymentState === "polling") {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-[oklch(0.72_0.18_185/0.1)] flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Smartphone className="w-10 h-10 text-[oklch(0.72_0.18_185)]" />
        </div>
        <h3 className="font-display text-4xl text-white mb-3">CHECK YOUR PHONE</h3>
        <p className="font-sub text-[oklch(0.70_0.01_210)] mb-2">
          {isDemo ? "Demo mode: Simulate the payment below." : "An M-Pesa STK Push has been sent to your phone. Enter your PIN to complete payment."}
        </p>
        <div className="flex items-center justify-center gap-2 mb-6 text-[oklch(0.60_0.01_210)]">
          <Loader2 className="w-4 h-4 animate-spin text-[oklch(0.72_0.18_185)]" />
          <span className="font-sub text-sm">Waiting for payment confirmation...</span>
        </div>
        {/* Real-time status indicator */}
        <div className="max-w-xs mx-auto rounded-xl border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210)] p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.72_0.18_185)] animate-pulse" />
            <span className="font-sub text-xs text-[oklch(0.70_0.01_210)]">Status: Pending</span>
          </div>
          <div className="font-sub text-xs text-[oklch(0.55_0.01_210)]">Amount: KES {amount.toLocaleString()}</div>
          <div className="font-sub text-xs text-[oklch(0.55_0.01_210)]">Polls: {pollCount}/40</div>
        </div>
        {isDemo && (
          <Button
            onClick={handleSimulate}
            disabled={simulateMutation.isPending}
            className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold px-8"
          >
            {simulateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simulate M-Pesa Payment ✓"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-4xl sm:text-5xl text-white text-center mb-2">M-PESA PAYMENT</h2>
      <p className="font-sub text-[oklch(0.65_0.01_210)] text-center mb-8">Pay securely via M-Pesa STK Push</p>

      {/* Amount display */}
      <div className="max-w-md mx-auto mb-8">
        <div className="rounded-2xl border border-[oklch(0.72_0.18_185/0.3)] bg-[oklch(0.72_0.18_185/0.05)] p-6 text-center mb-6">
          <div className="font-sub text-sm text-[oklch(0.65_0.01_210)] mb-1">Total Amount</div>
          <div className="font-display text-5xl text-[oklch(0.72_0.18_185)]">KES {amount.toLocaleString()}</div>
          <div className="font-sub text-xs text-[oklch(0.55_0.01_210)] mt-1">Booking #{bookingId}</div>
        </div>

        {/* M-Pesa info */}
        <div className="flex items-start gap-3 rounded-xl border border-[oklch(0.65_0.18_45/0.2)] bg-[oklch(0.65_0.18_45/0.05)] p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-[oklch(0.65_0.18_45)] flex-shrink-0 mt-0.5" />
          <p className="font-sub text-xs text-[oklch(0.70_0.01_210)] leading-relaxed">
            Enter your M-Pesa registered phone number below. You will receive an STK Push prompt on your phone. Enter your M-Pesa PIN to complete the payment.
          </p>
        </div>

        <div className="mb-6">
          <Label className="font-sub text-sm text-[oklch(0.70_0.01_210)] mb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[oklch(0.72_0.18_185)]" /> M-Pesa Phone Number
          </Label>
          <Input
            value={mpesaPhone}
            onChange={(e) => setMpesaPhone(e.target.value)}
            placeholder="0712 345 678"
            className="bg-[oklch(0.13_0.018_210)] border-[oklch(0.22_0.018_210)] text-white placeholder:text-[oklch(0.45_0.01_210)] focus:border-[oklch(0.72_0.18_185)] font-sub text-lg"
          />
        </div>

        <Button
          onClick={handleInitiate}
          disabled={initiateMutation.isPending || mpesaPhone.length < 9}
          className="w-full bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold text-lg py-6 tracking-wide shadow-[0_0_20px_oklch(0.72_0.18_185/0.3)] hover:shadow-[0_0_40px_oklch(0.72_0.18_185/0.5)] disabled:opacity-40"
        >
          {initiateMutation.isPending ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Initiating...</>
          ) : (
            "Pay with M-Pesa"
          )}
        </Button>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={onBack} className="font-sub text-[oklch(0.70_0.01_210)] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    </div>
  );
}

// ─── Step 5: Success ──────────────────────────────────────────────────────────
function SuccessStep({
  bookingId, course, date, time, name, receipt,
}: {
  bookingId: number; course: CourseType; date: string; time: string; name: string; receipt: string;
}) {
  const courseData = COURSES.find((c) => c.id === course)!;
  return (
    <div className="text-center py-4">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_oklch(0.72_0.18_185/0.5)]">
        <CheckCircle2 className="w-12 h-12 text-white" />
      </div>
      <h2 className="font-display text-5xl sm:text-6xl text-white mb-3">BOOKING CONFIRMED!</h2>
      <p className="font-sub text-[oklch(0.70_0.01_210)] mb-8">
        Welcome to AA Driving School, {name}! Your lesson has been successfully booked.
      </p>

      <div className="max-w-md mx-auto rounded-2xl border border-[oklch(0.72_0.18_185/0.3)] bg-[oklch(0.13_0.018_210/0.8)] p-6 text-left mb-8 space-y-3">
        <div className="flex justify-between">
          <span className="font-sub text-sm text-[oklch(0.60_0.01_210)]">Booking ID</span>
          <span className="font-sub font-semibold text-[oklch(0.72_0.18_185)]">#{bookingId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-sub text-sm text-[oklch(0.60_0.01_210)]">Course</span>
          <span className="font-sub font-semibold text-white">{courseData.label}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-sub text-sm text-[oklch(0.60_0.01_210)]">Date</span>
          <span className="font-sub font-semibold text-white">{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-sub text-sm text-[oklch(0.60_0.01_210)]">Time</span>
          <span className="font-sub font-semibold text-white">{time}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-sub text-sm text-[oklch(0.60_0.01_210)]">Amount Paid</span>
          <span className="font-sub font-semibold text-[oklch(0.65_0.18_45)]">KES {courseData.price.toLocaleString()}</span>
        </div>
        {receipt && (
          <div className="flex justify-between">
            <span className="font-sub text-sm text-[oklch(0.60_0.01_210)]">M-Pesa Receipt</span>
            <span className="font-sub font-semibold text-[oklch(0.72_0.18_185)]">{receipt}</span>
          </div>
        )}
      </div>

      <Link href="/">
        <Button className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold px-10 py-5 tracking-wide">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}

// ─── Main Booking Page ────────────────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState<Step>("course");
  const [course, setCourse] = useState<CourseType | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState("");

  const createBookingMutation = trpc.booking.create.useMutation();

  const handleCreateBooking = async () => {
    if (!course || !date || !time) return;
    try {
      const res = await createBookingMutation.mutateAsync({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        courseType: course,
        preferredDate: date,
        preferredTime: time,
        notes: notes || undefined,
      });
      setBookingId(res.bookingId);
      setStep("payment");
    } catch {
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const courseData = COURSES.find((c) => c.id === course);

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.015_210)] relative">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.72_0.18_185/0.04)] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.65_0.18_45/0.04)] blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[oklch(0.10_0.015_210/0.95)] backdrop-blur-xl border-b border-[oklch(0.72_0.18_185/0.2)]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg text-white tracking-wider">AA DRIVING SCHOOL</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-sub text-[oklch(0.70_0.01_210)] hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" /> Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          {step !== "success" && (
            <div className="text-center mb-8">
              <Badge className="bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border border-[oklch(0.72_0.18_185/0.3)] font-sub tracking-widest text-xs uppercase px-4 py-1.5 mb-4">
                Book a Lesson
              </Badge>
              <h1 className="font-display text-5xl sm:text-6xl text-white mb-2">BOOK YOUR LESSON</h1>
              <p className="font-sub text-[oklch(0.65_0.01_210)]">Complete the steps below to secure your driving lesson</p>
            </div>
          )}

          {/* Booking summary bar */}
          {step !== "course" && step !== "success" && courseData && (
            <div className="rounded-xl border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.8)] p-4 mb-6 flex flex-wrap gap-4 items-center">
              <Badge className="bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border-[oklch(0.72_0.18_185/0.3)] font-sub text-xs">
                {courseData.label}
              </Badge>
              {date && <span className="font-sub text-sm text-[oklch(0.70_0.01_210)] flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>}
              {time && <span className="font-sub text-sm text-[oklch(0.70_0.01_210)] flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>}
              <span className="ml-auto font-display text-xl text-[oklch(0.72_0.18_185)]">KES {courseData.price.toLocaleString()}</span>
            </div>
          )}

          {/* Step indicator */}
          {step !== "success" && <StepIndicator current={step} />}

          {/* Step content */}
          <div className="rounded-2xl border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.8)] backdrop-blur-xl p-6 sm:p-10">
            {step === "course" && (
              <CourseStep
                selected={course}
                onSelect={setCourse}
                onNext={() => setStep("datetime")}
              />
            )}
            {step === "datetime" && (
              <DateTimeStep
                date={date} time={time}
                onDate={setDate} onTime={setTime}
                onNext={() => setStep("details")}
                onBack={() => setStep("course")}
              />
            )}
            {step === "details" && (
              <DetailsStep
                name={name} email={email} phone={phone} notes={notes}
                onName={setName} onEmail={setEmail} onPhone={setPhone} onNotes={setNotes}
                onNext={handleCreateBooking}
                onBack={() => setStep("datetime")}
                loading={createBookingMutation.isPending}
              />
            )}
            {step === "payment" && bookingId && courseData && (
              <PaymentStep
                bookingId={bookingId}
                amount={courseData.price}
                onSuccess={(r) => { setReceipt(r); setStep("success"); }}
                onBack={() => setStep("details")}
              />
            )}
            {step === "success" && bookingId && course && (
              <SuccessStep
                bookingId={bookingId}
                course={course}
                date={date}
                time={time}
                name={name}
                receipt={receipt}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
