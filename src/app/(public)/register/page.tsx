"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dateOfBirth: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined
      })
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="px-6 pb-16 md:px-12">
      <div className="mx-auto max-w-xl card">
        <h1 className="section-title">Create your account</h1>
        <p className="text-sm text-ink/70 mt-2">Keep it simple. We only ask for what we need.</p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input className="input mt-2" value={form.name} onChange={onChange("name")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" className="input mt-2" value={form.email} onChange={onChange("email")} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input className="input mt-2" value={form.phone} onChange={onChange("phone")} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" className="input mt-2" value={form.password} onChange={onChange("password")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Gender</label>
              <select className="input mt-2" value={form.gender} onChange={onChange("gender")}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date of birth</label>
              <input type="date" className="input mt-2" value={form.dateOfBirth} onChange={onChange("dateOfBirth")} />
            </div>
          </div>
          <button className="button-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
