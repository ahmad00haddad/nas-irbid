import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "تسجيل الدخول · ناس إربد" }] }),
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/admin" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("أهلاً وسهلاً");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب. يمكنك الدخول الآن.");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err.message ?? "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-20 min-h-[70vh] flex items-center">
      <div className="max-w-md mx-auto w-full">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-6">
          <ArrowLeft size={12} /> العودة للموقع
        </Link>
        <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-deep">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-warm items-center justify-center shadow-glow mb-4">
              <Lock size={22} className="text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl text-foreground">
              {mode === "login" ? "تسجيل الدخول" : "حساب جديد"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              لوحة إدارة برنامج ناس إربد
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold text-foreground mb-2">البريد الإلكتروني</span>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-foreground mb-2">كلمة المرور</span>
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </label>
            <button
              type="submit" disabled={busy}
              className="w-full py-3 rounded-full bg-gradient-warm text-primary-foreground font-bold shadow-glow hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "..." : mode === "login" ? "دخول" : "إنشاء الحساب"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full mt-5 text-center text-sm text-muted-foreground hover:text-primary transition"
          >
            {mode === "login" ? "ما عندك حساب؟ سجّل الآن" : "عندك حساب؟ سجّل دخول"}
          </button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-6 leading-relaxed">
          الوصول للوحة الإدارة محصور بالمسؤولين المعتمدين.
          <br/>
          أول حساب يُنشأ يحتاج تعيينه كمسؤول من قاعدة البيانات.
        </p>
      </div>
    </div>
  );
}
