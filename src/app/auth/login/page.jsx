import { useState } from "react";
import { Check, Store, Lock, LogIn, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Define the autofill override class to avoid repetition
  const autofillClass =
    "[&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:-webkit-text-fill-color-[#402E32]";

  const validate = () => {
    const e = { email: "", password: "" };
    if (!email) e.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "صيغة البريد غير صحيحة";
    if (!password) e.password = "كلمة المرور مطلوبة";
    else if (password.length < 6) e.password = "الحد الأدنى 6 محارف";
    setErrors(e);
    return !e.email && !e.password;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "فشل تسجيل الدخول");
        return;
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-light-brown2">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#5A443A]/6 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#F7931D]/6 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 md:flex-row md:items-center md:gap-12">
        {/* Branding / hero side */}
        <aside className="mx-auto mb-10 w-full max-w-xl text-center md:mb-0 md:w-1/2 md:text-right">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-[#402E32] shadow-sm sm:text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            لوحة تحكم المتجر
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#5A443A] sm:text-4xl md:text-5xl">
            أهلاً بك 👋
          </h1>

          <p className="mt-3 text-[#402E32]">
            سجّل دخولك لإدارة المنتجات، الطلبات، العروض، والمحتوى بكل سهولة.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-[#402E32]">
            <li className="flex items-start gap-2">
              <Check className="mt-1 h-5 w-5 flex-none text-[#5A443A]" />
              إدارة فورية للمخزون والأسعار
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1 h-5 w-5 flex-none text-[#5A443A]" />
              تقارير مبيعات يومية
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1 h-5 w-5 flex-none text-[#5A443A]" />
              صلاحيات المستخدمين ومراجعة النشاط
            </li>
          </ul>
        </aside>

        {/* Login card */}
        <div className="mx-auto w-full max-w-xl md:w-1/2">
          <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-xl ring-1 ring-black/5">
            <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:radial-gradient(600px_300px_at_80%_0%,black,transparent)]">
              <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-[#5A443A]/10 blur-2xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#F7931D]/10 blur-2xl" />
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#5A443A] to-[#402E32] text-white shadow-md">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-[#402E32]">لوحة تحكم</p>
                  <h2 className="text-lg font-bold text-[#5A443A]">
                    {" "}
                    HOME STYLE
                  </h2>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-[#402E32]"
                >
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  // ADDED: autofillClass variable here
                  className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#402E32] outline-none transition focus:border-transparent focus:ring-4 focus:ring-[#FFF8F0]/60 ${autofillClass}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-rose-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#402E32]"
                  >
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="text-xs text-[#402E32] hover:text-[#5A443A]"
                  >
                    {showPwd ? "إخفاء" : "إظهار"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    // ADDED: autofillClass variable here
                    className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-[#402E32] outline-none transition focus:border-transparent focus:ring-4 focus:ring-[#FFF8F0]/60 ${autofillClass}`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
                    <Lock className="h-5 w-5 text-[#5A443A]" />
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5A443A] to-[#402E32] px-4 py-3 text-white shadow-lg outline-none transition hover:opacity-95 focus:ring-4 focus:ring-[#FFF8F0]/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 -z-10 rounded-xl bg-white/0 opacity-0 blur transition duration-300 group-hover:opacity-10" />
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size={20} className="text-white" />
                    جاري الدخول...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    دخول
                  </span>
                )}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-[#402E32]">
            © {new Date().getFullYear()} SunriseIT — جميع الحقوق محفوظة
          </p>
        </div>
      </section>
    </main>
  );
}

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false });
