import React, { useMemo, useState } from "react";

/**
 * 🗑️ Bin Duty — React single-file component (JavaScript version)
 * ---------------------------------------------------------
 * Drop this file into a Vite + React app (e.g., src/BinDuty.jsx) and render it in App.jsx.
 * Styling uses Tailwind utility classes.
 *
 * Rules:
 *  - Order of tenants: Basser, Berman, Galet, Leshinsky, Vale.
 *  - Duty occurs only on Wednesdays.
 *  - Print view shows ONLY a 12-week schedule, sized to ~¼ of a US Letter page with zebra stripes.
 */

// ---------------------------
// Tenant list
// ---------------------------

const TENANTS = [
  { id: "1", name: "Basser" },
  { id: "2", name: "Berman" },
  { id: "3", name: "Galet" },
  { id: "4", name: "Leshinsky" },
  { id: "5", name: "Vale" },
];

// Rotation start date (anchored so Wed Aug 27, 2025 resolves to Galet)
const ROTATION_START = new Date(2025, 7, 13);

// ---------------------------
// Utilities
// ---------------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toLocalMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a, b) {
  const a0 = toLocalMidnight(a).getTime();
  const b0 = toLocalMidnight(b).getTime();
  return Math.round((b0 - a0) / MS_PER_DAY);
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatDate(d) {
  const fmt = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return fmt.format(d);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ---------------------------
// Assignment logic (Wednesdays only)
// ---------------------------

function getAssigneeForDate(date) {
  if (date.getDay() !== 3) return null; // 3 = Wednesday
  const diff = Math.max(0, daysBetween(ROTATION_START, date));
  const weeks = Math.floor(diff / 7);
  const idx = weeks % TENANTS.length;
  return TENANTS[idx];
}

// ---------------------------
// Component
// ---------------------------

export default function BinDutyScheduler() {
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [monthCursor, setMonthCursor] = useState(toLocalMidnight(new Date()));
  const [search, setSearch] = useState("");

  const today = toLocalMidnight(new Date());

  const upcoming = useMemo(() => {
    // Next ~8 Wednesdays
    let list = [];
    for (let i = 0; i < 60; i++) {
      const candidate = addDays(today, i);
      if (candidate.getDay() === 3) list.push({ date: candidate, who: getAssigneeForDate(candidate) });
    }
    return list;
  }, [today]);

  const twelveWeeks = useMemo(() => {
    // Exactly 12 Wednesdays starting from this week
    let list = [];
    for (let i = 0; i < 120; i++) {
      const candidate = addDays(today, i);
      if (candidate.getDay() === 3) {
        list.push({ date: candidate, who: getAssigneeForDate(candidate) });
        if (list.length === 12) break;
      }
    }
    return list;
  }, [today]);

  const nextForSelected = useMemo(() => {
    if (!selectedTenantId) return null;
    for (let i = 0; i < 365; i++) {
      const candidate = addDays(today, i);
      if (candidate.getDay() !== 3) continue;
      const who = getAssigneeForDate(candidate);
      if (who && who.id === selectedTenantId) return candidate;
    }
    return null;
  }, [selectedTenantId, today]);

  const filteredTenants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TENANTS;
    return TENANTS.filter((t) => t.name.toLowerCase().includes(q));
  }, [search]);

  const selectedTenant = TENANTS.find((t) => t.id === selectedTenantId) || null;
  const todaysAssignee = getAssigneeForDate(today);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Inline print CSS to hide UI and size the print card to ~1/4 page */}
      <style>{`
        @media print {
          @page { size: Letter; margin: 0.5in; }
          .screen-only { display: none !important; }
          .print-card {
            display: block !important;
            width: 4.25in;   /* quarter of 8.5in */
            height: 5.5in;   /* quarter of 11in */
            padding: 0.25in;
            border: 1px solid #e2e8f0; /* slate-200 */
            border-radius: 0.5rem;
            box-sizing: border-box;
          }
          /* Zebra striping for printed rows */
          .print-card table tr:nth-child(even) { background: #f1f5f9; } /* slate-100 */
          .print-card table tr:nth-child(odd)  { background: #ffffff; }
          .print-card table th,
          .print-card table td { border-color: #e2e8f0; }
        }
      `}</style>

      <div className="mx-auto max-w-5xl p-4 sm:p-8">
        {/* ===== Screen UI (hidden in print) ===== */}
        <div className="screen-only">
          <header className="mb-6 sm:mb-10 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Building Bin Duty</h1>
              <p className="text-slate-600">Bins are taken in every Wednesday</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
              >
                Print 12 Weeks
              </button>
              <select
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
              >
                <option value="">Highlight by tenant…</option>
                {TENANTS.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </header>

          {/* Today */}
          <section className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="sm:col-span-1 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-500">Today</div>
              <div className="mt-2 text-lg font-semibold">{formatDate(today)}</div>
              <div className="mt-3 text-2xl font-bold">
                {todaysAssignee ? todaysAssignee.name : "No duty today"}
              </div>
              {selectedTenant && todaysAssignee && (
                <div className="mt-3 text-sm text-slate-600">
                  {todaysAssignee.id === selectedTenant.id ? (
                    <span className="inline-block rounded-full bg-sky-100 px-2 py-1 text-sky-700">Your turn today</span>
                  ) : (
                    <span>Highlighted: {selectedTenant.name}</span>
                  )}
                </div>
              )}
            </div>

            <div className="sm:col-span-2 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Next Wednesdays</div>
                  <div className="text-sm text-slate-600">Upcoming schedule</div>
                </div>
                {selectedTenant && (
                  <div className="text-xs text-slate-600">
                    Next for <span className="font-medium">{selectedTenant.name}</span>: {nextForSelected ? formatDate(nextForSelected) : "—"}
                  </div>
                )}
              </div>
              <div className="mt-4 divide-y divide-slate-100 max-h-64 overflow-auto rounded-xl border border-slate-100">
                {upcoming.map(({ date, who }) => (
                  <div key={date.toISOString()} className={"flex items-center justify-between px-4 py-2 text-sm " + (selectedTenant && who && who.id === selectedTenant.id ? "bg-sky-50" : isSameDay(date, today) ? "bg-slate-50" : "bg-white")}>
                    <div className="flex items-center gap-3">
                      <div className="w-24 font-medium">{formatDate(date)}</div>
                    </div>
                    <div className="font-medium">{who ? who.name : "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tenant finder (screen only) */}
          <section className="grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-1 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="text-sm font-semibold mb-2">Find a tenant</div>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="mt-3 max-h-64 overflow-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                {filteredTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTenantId(t.id)}
                    className={"w-full text-left px-3 py-2 text-sm hover:bg-slate-50 " + (selectedTenantId === t.id ? "bg-sky-50" : "")}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              {selectedTenant && (
                <div className="mt-3 text-xs text-slate-600">
                  Next for <span className="font-medium">{selectedTenant.name}</span>: {nextForSelected ? formatDate(nextForSelected) : "—"}
                </div>
              )}
            </div>
          </section>

          <footer className="py-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} Bin Duty</footer>
        </div>

        {/* ===== Print-only compact card (¼ page) ===== */}
        <section className="hidden print:block">
          <div className="print-card">
            <div className="text-base font-semibold mb-2">Bin Duty — Next 12 Wednesdays</div>
            <table className="w-full text-xs border border-slate-200">
              <tbody>
                {twelveWeeks.map(({ date, who }) => (
                  <tr key={date.toISOString()}>
                    <td className="border border-slate-200 px-2 py-1 w-1/2">{formatDate(date)}</td>
                    <td className="border border-slate-200 px-2 py-1">{who ? who.name : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-[10px] text-slate-500">Printed {formatDate(today)}</div>
          </div>
        </section>
      </div>
    </div>
  );
}