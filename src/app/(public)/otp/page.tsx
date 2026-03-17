"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function OtpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ otp: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function checkPending() {
      try {
        const res = await fetch("/api/auth/otp/verify", {
          method: "GET",
          credentials: "include"
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }
        
        const data = await res.json();
        setContact(data.contact);
      } catch {
        router.push("/login");
      } finally {
        setInitializing(false);
      }
    }
    
    checkPending();
  }, [router]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ otp: event.target.value });
  };

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: form.otp })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid code");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        userId: data.user.id,
        role: data.user.role
      });

      if (result?.error) {
        setError("Failed to create session");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An error occurred");
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="px-6 pb-16 md:px-12">
        <div className="mx-auto max-w-xl card">
          <p className="text-center text-ink/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-16 md:px-12">
      <div className="mx-auto max-w-xl card">
        <h1 className="section-title">Verify your identity</h1>
        <p className="text-sm text-ink/70 mt-2">
          Enter the one-time code sent to {contact}.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={verifyOtp}>
          <div>
            <label className="text-sm font-medium">Verification code</label>
            <input 
              className="input mt-2" 
              value={form.otp} 
              onChange={onChange}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>
          <button className="button-primary w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            className="button-secondary w-full"
            onClick={() => router.push("/login")}
          >
            Start over
          </button>
        </form>
      </div>
    </div>
  );
}
