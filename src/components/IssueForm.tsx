"use client";

import { useState } from "react";

type HostelOption = {
  id: string;
  name: string;
};

const categories = [
  "Water",
  "Power",
  "Cleaning",
  "Repairs",
  "Security",
  "Other"
];

export default function IssueForm({ hostels }: { hostels: HostelOption[] }) {
  const [form, setForm] = useState({
    hostelId: hostels[0]?.id ?? "",
    location: "",
    category: "",
    description: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostelId: form.hostelId,
        location: form.location,
        category: form.category,
        description: form.description
      })
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not send issue");
      return;
    }

    setSuccess(true);
    setForm((prev) => ({ ...prev, location: "", category: "", description: "" }));
  }

  return (
    <form className="card space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="text-sm font-medium">Hostel</label>
        <select className="input mt-2" value={form.hostelId} onChange={onChange("hostelId")}>
          {hostels.map((hostel) => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Location (room or area)</label>
        <input className="input mt-2" value={form.location} onChange={onChange("location")} />
      </div>
      <div>
        <label className="text-sm font-medium">Category</label>
        <select className="input mt-2" value={form.category} onChange={onChange("category")}>
          <option value="">Select</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Describe the issue</label>
        <textarea className="input mt-2 min-h-[120px]" value={form.description} onChange={onChange("description")} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">Issue sent. We will update you soon.</p> : null}

      <button className="button-primary w-full" disabled={loading}>
        {loading ? "Sending..." : "Send issue"}
      </button>
    </form>
  );
}
