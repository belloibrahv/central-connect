"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier: form.identifier, password: form.password })
    });

    setLoading(false);

    if (!res.ok) {
      let errorMessage = "OTP request failed";
      try {
        const data = await res.json();
        errorMessage = data.error ?? errorMessage;
      } catch {
        errorMessage = `Request failed: ${res.status}`;
      }
      setError(errorMessage);
      return;
    }

    router.push("/otp");
  }

  return (
    <div className="px-6 pb-16 md:px-12">
      <div className="mx-auto max-w-xl card">
        <h1 className="section-title">Sign in</h1>
        <p className="text-sm text-ink/70 mt-2">
          Use your email or phone and password. We will send a one-time code.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={requestOtp}>
          <div>
            <label className="text-sm font-medium">Email or phone</label>
            <input className="input mt-2" value={form.identifier} onChange={onChange("identifier")} />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" className="input mt-2" value={form.password} onChange={onChange("password")} />
          </div>
          <button className="button-primary w-full" disabled={loading}>
            {loading ? "Sending code..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
