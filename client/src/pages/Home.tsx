import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Shield,
  Award,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
  Zap,
  Users,
  BookOpen,
} from "lucide-react";

// ─── 3D Hero Background ───────────────────────────────────────────────────────
function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / width, y: e.clientY / height };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particles
    const PARTICLE_COUNT = 80;
    type Particle = {
      x: number; y: number; z: number;
      vx: number; vy: number; vz: number;
      size: number; color: string; opacity: number;
    };
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 800 + 100,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2.5 + 0.5,
      color: Math.random() > 0.5 ? "#00d4c8" : "#e07b39",
      opacity: Math.random() * 0.7 + 0.3,
    }));

    // Road lines
    type RoadLine = { y: number; speed: number; opacity: number };
    const roadLines: RoadLine[] = Array.from({ length: 12 }, (_, i) => ({
      y: (i / 12) * height,
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.15 + 0.05,
    }));

    let t = 0;
    function draw() {
      if (!ctx) return;
      t += 0.008;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Background gradient
      const grad = ctx.createRadialGradient(
        width * (0.3 + mx * 0.4), height * (0.2 + my * 0.3), 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.9
      );
      grad.addColorStop(0, "rgba(0,60,70,0.95)");
      grad.addColorStop(0.35, "rgba(5,25,40,0.97)");
      grad.addColorStop(0.7, "rgba(15,8,5,0.98)");
      grad.addColorStop(1, "rgba(5,10,20,1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Teal glow orb (mouse-tracked)
      const tealGrad = ctx.createRadialGradient(
        width * mx, height * my, 0,
        width * mx, height * my, width * 0.45
      );
      tealGrad.addColorStop(0, "rgba(0,212,200,0.12)");
      tealGrad.addColorStop(0.5, "rgba(0,150,160,0.06)");
      tealGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = tealGrad;
      ctx.fillRect(0, 0, width, height);

      // Orange glow orb (opposite)
      const orangeGrad = ctx.createRadialGradient(
        width * (1 - mx), height * (1 - my), 0,
        width * (1 - mx), height * (1 - my), width * 0.4
      );
      orangeGrad.addColorStop(0, "rgba(224,123,57,0.10)");
      orangeGrad.addColorStop(0.5, "rgba(180,80,20,0.05)");
      orangeGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = orangeGrad;
      ctx.fillRect(0, 0, width, height);

      // Animated road lines (perspective)
      roadLines.forEach((line) => {
        line.y += line.speed;
        if (line.y > height) line.y = -20;
        const perspective = 1 - line.y / height;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - 2 * perspective * width, line.y);
        ctx.lineTo(width * 0.5 + 2 * perspective * width, line.y);
        ctx.strokeStyle = `rgba(0,212,200,${line.opacity})`;
        ctx.lineWidth = perspective * 1.5;
        ctx.stroke();
      });

      // 3D Particles
      particles.forEach((p) => {
        p.x += p.vx + (mx - 0.5) * 0.4;
        p.y += p.vy + (my - 0.5) * 0.4;
        p.z += p.vz;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        if (p.z < 50) p.z = 900;
        if (p.z > 900) p.z = 50;

        const scale = 600 / p.z;
        const px = (p.x - width / 2) * scale + width / 2;
        const py = (p.y - height / 2) * scale + height / 2;
        const r = p.size * scale;
        const alpha = p.opacity * (1 - p.z / 900);

        ctx.beginPath();
        ctx.arc(px, py, Math.max(r, 0.3), 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // Geometric grid lines
      ctx.save();
      ctx.globalAlpha = 0.04 + Math.sin(t) * 0.01;
      const gridSpacing = 80;
      ctx.strokeStyle = "#00d4c8";
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < width; gx += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(gx + mx * 10, 0);
        ctx.lineTo(gx + mx * 10, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, gy + my * 10);
        ctx.lineTo(width, gy + my * 10);
        ctx.stroke();
      }
      ctx.restore();

      // Hexagonal accent shapes
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.sin(t * 0.7) * 0.02;
      const hexCenters = [
        { x: width * 0.1, y: height * 0.2, r: 120 },
        { x: width * 0.9, y: height * 0.7, r: 90 },
        { x: width * 0.8, y: height * 0.15, r: 60 },
      ];
      hexCenters.forEach((h, i) => {
        ctx.beginPath();
        for (let side = 0; side < 6; side++) {
          const angle = (Math.PI / 3) * side + t * (i % 2 === 0 ? 0.3 : -0.3);
          const hx = h.x + h.r * Math.cos(angle);
          const hy = h.y + h.r * Math.sin(angle);
          side === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = i === 1 ? "#e07b39" : "#00d4c8";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Services", href: "#services" },
    { label: "Instructors", href: "#instructors" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.10_0.015_210/0.95)] backdrop-blur-xl border-b border-[oklch(0.72_0.18_185/0.2)]"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_oklch(0.72_0.18_185/0.5)] transition-shadow">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display text-xl text-white leading-none tracking-wider">AA DRIVING</div>
            <div className="font-sub text-xs text-[oklch(0.72_0.18_185)] tracking-[0.2em] uppercase">School</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sub font-medium text-sm text-[oklch(0.80_0.01_210)] hover:text-[oklch(0.72_0.18_185)] transition-colors tracking-wide uppercase"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/book">
            <Button className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold tracking-wide hover:opacity-90 shadow-lg hover:shadow-[0_0_20px_oklch(0.72_0.18_185/0.4)] transition-all">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[oklch(0.10_0.015_210/0.98)] backdrop-blur-xl border-t border-[oklch(0.72_0.18_185/0.2)] px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sub font-medium text-base text-[oklch(0.80_0.01_210)] hover:text-[oklch(0.72_0.18_185)] transition-colors tracking-wide uppercase py-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link href="/book" onClick={() => setMenuOpen(false)}>
            <Button className="w-full bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold tracking-wide mt-2">
              Book Now
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroBackground />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.10_0.015_210)] pointer-events-none" />

      <div className={`relative z-10 text-center px-4 max-w-5xl mx-auto transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge className="bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border border-[oklch(0.72_0.18_185/0.3)] font-sub tracking-widest text-xs uppercase px-4 py-1.5">
            Kenya's Premier Driving School
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl sm:text-8xl md:text-[10rem] text-white leading-none mb-4 drop-shadow-2xl">
          AA DRIVING
          <br />
          <span className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] bg-clip-text text-transparent">
            SCHOOL
          </span>
        </h1>

        {/* Tagline */}
        <p className="font-sub text-lg sm:text-2xl text-[oklch(0.80_0.01_210)] max-w-2xl mx-auto mb-10 font-light tracking-wide">
          Master the road with confidence. Professional instruction, modern vehicles, and a track record of excellence.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {[
            { value: "2,500+", label: "Graduates" },
            { value: "98%", label: "Pass Rate" },
            { value: "15+", label: "Years Experience" },
            { value: "5★", label: "Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl sm:text-4xl bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="font-sub text-xs text-[oklch(0.60_0.015_210)] uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/book">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.55_0.18_185)] text-white font-sub font-semibold text-lg px-10 py-6 tracking-wide shadow-[0_0_30px_oklch(0.72_0.18_185/0.4)] hover:shadow-[0_0_50px_oklch(0.72_0.18_185/0.6)] hover:opacity-95 transition-all"
            >
              Book a Lesson
            </Button>
          </Link>
          <a href="#services">
            <Button
              size="lg"
              variant="outline"
              className="border-[oklch(0.72_0.18_185/0.5)] text-white font-sub font-semibold text-lg px-10 py-6 tracking-wide hover:bg-[oklch(0.72_0.18_185/0.1)] hover:border-[oklch(0.72_0.18_185)] transition-all"
            >
              Explore Courses
            </Button>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#services"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[oklch(0.60_0.015_210)] hover:text-[oklch(0.72_0.18_185)] transition-colors animate-bounce"
      >
        <span className="font-sub text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </a>
    </section>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: BookOpen,
    title: "Beginner Course",
    desc: "Start from zero with our structured beginner program. Learn traffic rules, vehicle controls, and basic maneuvers in a safe, supportive environment.",
    price: "KES 8,000",
    tag: "Most Popular",
    color: "teal",
  },
  {
    icon: Car,
    title: "Intermediate Course",
    desc: "Build on your basics with highway driving, night driving, and complex intersections. Ideal for learners who have some experience.",
    price: "KES 6,000",
    tag: null,
    color: "orange",
  },
  {
    icon: Zap,
    title: "Advanced Driving",
    desc: "Master defensive driving, emergency maneuvers, and advanced road techniques. Perfect for those seeking elite driving skills.",
    price: "KES 10,000",
    tag: "Premium",
    color: "teal",
  },
  {
    icon: Shield,
    title: "Defensive Driving",
    desc: "Learn to anticipate hazards and avoid accidents. Our defensive driving course is NTSA-approved and recognized by insurance companies.",
    price: "KES 7,500",
    tag: "NTSA Approved",
    color: "orange",
  },
  {
    icon: Clock,
    title: "Refresher Course",
    desc: "Haven't driven in a while? Our refresher course gets you back behind the wheel with confidence in just a few sessions.",
    price: "KES 4,000",
    tag: null,
    color: "teal",
  },
  {
    icon: Award,
    title: "License Test Prep",
    desc: "Targeted preparation for your NTSA driving test. We cover all test scenarios and ensure you're fully ready on test day.",
    price: "KES 3,500",
    tag: "High Pass Rate",
    color: "orange",
  },
];

function ServicesSection() {
  return (
    <section id="services" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.10_0.015_210)] via-[oklch(0.08_0.012_210)] to-[oklch(0.10_0.015_210)]" />
      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-[oklch(0.65_0.18_45/0.15)] text-[oklch(0.65_0.18_45)] border border-[oklch(0.65_0.18_45/0.3)] font-sub tracking-widest text-xs uppercase px-4 py-1.5 mb-4">
            Our Programs
          </Badge>
          <h2 className="font-display text-5xl sm:text-7xl text-white mb-4">
            DRIVING <span className="text-[oklch(0.72_0.18_185)]">COURSES</span>
          </h2>
          <p className="font-sub text-[oklch(0.70_0.01_210)] max-w-2xl mx-auto text-lg">
            From first-time learners to experienced drivers seeking advanced skills — we have a course tailored for every stage of your journey.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="group relative rounded-2xl p-6 border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.8)] hover:border-[oklch(0.72_0.18_185/0.4)] hover:bg-[oklch(0.15_0.02_210/0.9)] transition-all duration-300 hover:shadow-[0_0_30px_oklch(0.72_0.18_185/0.1)] overflow-hidden"
            >
              {/* Accent line */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.color === "teal" ? "from-[oklch(0.72_0.18_185)] to-transparent" : "from-[oklch(0.65_0.18_45)] to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity`} />

              {s.tag && (
                <Badge className={`mb-4 text-xs font-sub tracking-wide ${s.color === "teal" ? "bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border-[oklch(0.72_0.18_185/0.3)]" : "bg-[oklch(0.65_0.18_45/0.15)] text-[oklch(0.65_0.18_45)] border-[oklch(0.65_0.18_45/0.3)]"}`}>
                  {s.tag}
                </Badge>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.color === "teal" ? "bg-[oklch(0.72_0.18_185/0.15)]" : "bg-[oklch(0.65_0.18_45/0.15)]"}`}>
                <s.icon className={`w-6 h-6 ${s.color === "teal" ? "text-[oklch(0.72_0.18_185)]" : "text-[oklch(0.65_0.18_45)]"}`} />
              </div>

              <h3 className="font-sub font-bold text-xl text-white mb-2">{s.title}</h3>
              <p className="font-sub text-sm text-[oklch(0.65_0.01_210)] leading-relaxed mb-4">{s.desc}</p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[oklch(0.22_0.018_210)]">
                <span className={`font-display text-2xl ${s.color === "teal" ? "text-[oklch(0.72_0.18_185)]" : "text-[oklch(0.65_0.18_45)]"}`}>
                  {s.price}
                </span>
                <Link href="/book">
                  <Button size="sm" variant="ghost" className="font-sub text-[oklch(0.72_0.18_185)] hover:bg-[oklch(0.72_0.18_185/0.1)] text-xs tracking-wide">
                    Book →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Instructors Section ──────────────────────────────────────────────────────
const INSTRUCTORS = [
  {
    name: "James Mwangi",
    role: "Chief Instructor",
    exp: "12 Years",
    specialty: "Advanced & Defensive Driving",
    rating: 4.9,
    initials: "JM",
    color: "teal",
  },
  {
    name: "Grace Wanjiru",
    role: "Senior Instructor",
    exp: "8 Years",
    specialty: "Beginner & Intermediate",
    rating: 4.8,
    initials: "GW",
    color: "orange",
  },
  {
    name: "David Otieno",
    role: "Instructor",
    exp: "6 Years",
    specialty: "License Test Prep",
    rating: 4.9,
    initials: "DO",
    color: "teal",
  },
  {
    name: "Amina Hassan",
    role: "Instructor",
    exp: "5 Years",
    specialty: "Refresher & Beginner",
    rating: 4.7,
    initials: "AH",
    color: "orange",
  },
];

function InstructorsSection() {
  return (
    <section id="instructors" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.10_0.015_210)] to-[oklch(0.08_0.012_210)]" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border border-[oklch(0.72_0.18_185/0.3)] font-sub tracking-widest text-xs uppercase px-4 py-1.5 mb-4">
            Meet the Team
          </Badge>
          <h2 className="font-display text-5xl sm:text-7xl text-white mb-4">
            OUR <span className="text-[oklch(0.65_0.18_45)]">INSTRUCTORS</span>
          </h2>
          <p className="font-sub text-[oklch(0.70_0.01_210)] max-w-2xl mx-auto text-lg">
            Certified, patient, and passionate about road safety. Our instructors bring years of real-world experience to every lesson.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INSTRUCTORS.map((inst) => (
            <div
              key={inst.name}
              className="group rounded-2xl p-6 border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.8)] hover:border-[oklch(0.72_0.18_185/0.4)] transition-all duration-300 hover:shadow-[0_0_30px_oklch(0.72_0.18_185/0.1)] text-center"
            >
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display text-white shadow-lg ${inst.color === "teal" ? "bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.55_0.16_185)]" : "bg-gradient-to-br from-[oklch(0.65_0.18_45)] to-[oklch(0.50_0.16_45)]"}`}>
                  {inst.initials}
                </div>
              </div>

              <h4 className="font-sub font-bold text-lg text-white mb-1">{inst.name}</h4>
              <p className={`font-sub text-sm font-medium mb-1 ${inst.color === "teal" ? "text-[oklch(0.72_0.18_185)]" : "text-[oklch(0.65_0.18_45)]"}`}>
                {inst.role}
              </p>
              <p className="font-sub text-xs text-[oklch(0.60_0.01_210)] mb-3">{inst.specialty}</p>

              <div className="flex items-center justify-center gap-4 text-xs text-[oklch(0.60_0.01_210)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {inst.exp}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {inst.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Peter Kamau",
    location: "Nairobi",
    text: "AA Driving School transformed me from a nervous first-timer into a confident driver. James was incredibly patient and professional. Passed my test on the first attempt!",
    rating: 5,
    course: "Beginner Course",
  },
  {
    name: "Fatuma Ali",
    location: "Mombasa",
    text: "The online booking system made everything so easy. I booked my slot, paid via M-Pesa, and received confirmation instantly. The lessons themselves were top-notch.",
    rating: 5,
    course: "Intermediate Course",
  },
  {
    name: "Brian Ochieng",
    location: "Kisumu",
    text: "I took the defensive driving course for insurance purposes and it was worth every shilling. The instructors are knowledgeable and the vehicles are well-maintained.",
    rating: 5,
    course: "Defensive Driving",
  },
  {
    name: "Mary Njeri",
    location: "Nakuru",
    text: "After a 5-year break from driving, the refresher course got me back on track in just 3 sessions. Highly recommend AA Driving School to anyone!",
    rating: 5,
    course: "Refresher Course",
  },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.012_210)] to-[oklch(0.10_0.015_210)]" />
      {/* Decorative orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[oklch(0.72_0.18_185/0.03)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-[oklch(0.65_0.18_45/0.15)] text-[oklch(0.65_0.18_45)] border border-[oklch(0.65_0.18_45/0.3)] font-sub tracking-widest text-xs uppercase px-4 py-1.5 mb-4">
            Student Stories
          </Badge>
          <h2 className="font-display text-5xl sm:text-7xl text-white mb-4">
            WHAT THEY <span className="text-[oklch(0.72_0.18_185)]">SAY</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-6 border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.8)] hover:border-[oklch(0.72_0.18_185/0.3)] transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="font-sub text-[oklch(0.80_0.01_210)] leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] flex items-center justify-center font-display text-white text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-sub font-semibold text-white text-sm">{t.name}</div>
                    <div className="font-sub text-xs text-[oklch(0.60_0.01_210)] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {t.location}
                    </div>
                  </div>
                </div>
                <Badge className="bg-[oklch(0.72_0.18_185/0.1)] text-[oklch(0.72_0.18_185)] border-[oklch(0.72_0.18_185/0.2)] text-xs font-sub">
                  {t.course}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────
function WhyUsSection() {
  const features = [
    { icon: Shield, title: "NTSA Certified", desc: "Fully licensed and certified by the National Transport and Safety Authority of Kenya." },
    { icon: Users, title: "Expert Instructors", desc: "Highly trained, patient, and professional instructors with years of experience." },
    { icon: Car, title: "Modern Fleet", desc: "Well-maintained, dual-control vehicles equipped with the latest safety features." },
    { icon: CheckCircle2, title: "Flexible Scheduling", desc: "Book lessons at your convenience — mornings, evenings, and weekends available." },
    { icon: Award, title: "High Pass Rate", desc: "98% of our students pass their NTSA driving test on the first attempt." },
    { icon: Zap, title: "M-Pesa Payments", desc: "Fast, secure, and convenient payments via M-Pesa STK Push — no cash needed." },
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[oklch(0.08_0.012_210)]" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl sm:text-7xl text-white mb-4">
            WHY CHOOSE <span className="text-[oklch(0.65_0.18_45)]">US</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 p-5 rounded-xl border border-[oklch(0.22_0.018_210)] bg-[oklch(0.13_0.018_210/0.5)] hover:border-[oklch(0.72_0.18_185/0.3)] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[oklch(0.72_0.18_185/0.15)] flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-[oklch(0.72_0.18_185)]" />
              </div>
              <div>
                <h4 className="font-sub font-bold text-white mb-1">{f.title}</h4>
                <p className="font-sub text-sm text-[oklch(0.65_0.01_210)] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.10_0.015_210)] to-[oklch(0.08_0.012_210)]" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-[oklch(0.72_0.18_185/0.15)] text-[oklch(0.72_0.18_185)] border border-[oklch(0.72_0.18_185/0.3)] font-sub tracking-widest text-xs uppercase px-4 py-1.5 mb-4">
            Get in Touch
          </Badge>
          <h2 className="font-display text-5xl sm:text-7xl text-white mb-4">
            CONTACT <span className="text-[oklch(0.72_0.18_185)]">US</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact info */}
          <div className="space-y-6">
            {[
              { icon: Phone, label: "Phone", value: "+254 700 123 456", sub: "Mon–Sat, 7am–7pm" },
              { icon: Mail, label: "Email", value: "info@aadrivingschool.co.ke", sub: "We reply within 24 hours" },
              { icon: MapPin, label: "Location", value: "Westlands, Nairobi", sub: "Near Westgate Mall" },
              { icon: Clock, label: "Hours", value: "Mon–Sat: 7am–7pm", sub: "Sunday: 8am–4pm" },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-[oklch(0.72_0.18_185/0.15)] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[oklch(0.72_0.18_185)]" />
                </div>
                <div>
                  <div className="font-sub text-xs text-[oklch(0.60_0.01_210)] uppercase tracking-widest mb-0.5">{item.label}</div>
                  <div className="font-sub font-semibold text-white">{item.value}</div>
                  <div className="font-sub text-xs text-[oklch(0.60_0.01_210)]">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA card */}
          <div className="rounded-2xl p-8 border border-[oklch(0.72_0.18_185/0.2)] bg-gradient-to-br from-[oklch(0.13_0.018_210/0.9)] to-[oklch(0.10_0.015_210/0.9)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_oklch(0.72_0.18_185/0.4)]">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-4xl text-white mb-3">READY TO DRIVE?</h3>
            <p className="font-sub text-[oklch(0.70_0.01_210)] mb-8 leading-relaxed">
              Book your first lesson today. Pay securely via M-Pesa and get instant confirmation.
            </p>
            <Link href="/book">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] text-white font-sub font-semibold text-lg py-6 tracking-wide shadow-[0_0_30px_oklch(0.72_0.18_185/0.3)] hover:shadow-[0_0_50px_oklch(0.72_0.18_185/0.5)] hover:opacity-95 transition-all"
              >
                Book Your Lesson Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[oklch(0.22_0.018_210)] bg-[oklch(0.08_0.012_210)] py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.72_0.18_185)] to-[oklch(0.65_0.18_45)] flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display text-lg text-white leading-none">AA DRIVING SCHOOL</div>
              <div className="font-sub text-xs text-[oklch(0.60_0.01_210)]">Professional Driving Instruction</div>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-sub text-[oklch(0.60_0.01_210)]">
            <a href="#services" className="hover:text-[oklch(0.72_0.18_185)] transition-colors">Services</a>
            <a href="#instructors" className="hover:text-[oklch(0.72_0.18_185)] transition-colors">Instructors</a>
            <a href="#contact" className="hover:text-[oklch(0.72_0.18_185)] transition-colors">Contact</a>
            <Link href="/book" className="hover:text-[oklch(0.72_0.18_185)] transition-colors">Book</Link>
          </div>
          <div className="font-sub text-xs text-[oklch(0.50_0.01_210)]">
            © {new Date().getFullYear()} AA Driving School. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Home Page ───────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[oklch(0.10_0.015_210)]">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <InstructorsSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
