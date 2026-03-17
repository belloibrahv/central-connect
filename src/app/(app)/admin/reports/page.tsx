"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Hostel {
  id: string;
  name: string;
}

interface ReportData {
  totalResidents: number;
  confirmedBookings: number;
  pendingBookings: number;
  occupancyRate: number;
  totalRevenue: number;
  transactionCount: number;
  paymentsByStatus: { status: string; amount: number; count: number }[];
  occupancyByHostel: { name: string; beds: number; bookings: number; rate: number }[];
  openIssues: number;
  resolvedIssues: number;
}

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ReportData | null>(null);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  const hostelId = searchParams.get("hostelId") || "";
  const status = searchParams.get("status") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (hostelId) params.set("hostelId", hostelId);
        if (status) params.set("status", status);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const [dataRes, hostelsRes] = await Promise.all([
          fetch(`/api/reports?${params}`),
          fetch("/api/hostels")
        ]);

        const data = await dataRes.json();
        const hostels = await hostelsRes.json();

        setData(data);
        setHostels(hostels);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [hostelId, status, startDate, endDate]);

  if (loading) {
    return (
      <div className="card">
        <p className="text-center py-8">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Reports</h1>
        <p className="text-sm text-ink/70">View analytics and insights</p>
      </div>

      <form className="card flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-ink/60 mb-1">Hostel</label>
          <select
            name="hostelId"
            defaultValue={hostelId}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set("hostelId", e.target.value);
              else url.searchParams.delete("hostelId");
              window.location.href = url.toString();
            }}
            className="w-full px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-ink/60 mb-1">Status</label>
          <select
            name="status"
            defaultValue={status}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set("status", e.target.value);
              else url.searchParams.delete("status");
              window.location.href = url.toString();
            }}
            className="w-full px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-ink/60 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            defaultValue={startDate}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set("startDate", e.target.value);
              else url.searchParams.delete("startDate");
              window.location.href = url.toString();
            }}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-ink/60 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            defaultValue={endDate}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set("endDate", e.target.value);
              else url.searchParams.delete("endDate");
              window.location.href = url.toString();
            }}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-ink/60">Total Residents</p>
          <p className="text-2xl font-display">{data?.totalResidents ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60">Confirmed Bookings</p>
          <p className="text-2xl font-display">{data?.confirmedBookings ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60">Pending Bookings</p>
          <p className="text-2xl font-display">{data?.pendingBookings ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60">Occupancy Rate</p>
          <p className="text-2xl font-display">{data?.occupancyRate ?? 0}%</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="text-sm text-ink/60 mb-4">Total Revenue</p>
          <p className="text-3xl font-display">NGN {(data?.totalRevenue ?? 0).toLocaleString()}</p>
          <p className="text-sm text-ink/50">{data?.transactionCount ?? 0} transactions</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60 mb-4">Payments by Status</p>
          <div className="space-y-2">
            {data?.paymentsByStatus?.map((p) => (
              <div key={p.status} className="flex justify-between">
                <span className="capitalize">{p.status.toLowerCase()}</span>
                <span>{p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="text-sm text-ink/60 mb-4">Occupancy by Hostel</p>
          <div className="space-y-3">
            {data?.occupancyByHostel?.map((h) => (
              <div key={h.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{h.name}</span>
                  <span>{h.bookings}/{h.beds} ({h.rate}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-ink" style={{ width: `${h.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60 mb-4">Issues</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-display">{data?.openIssues ?? 0}</p>
              <p className="text-sm text-ink/60">Open</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-display">{data?.resolvedIssues ?? 0}</p>
              <p className="text-sm text-ink/60">Resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
