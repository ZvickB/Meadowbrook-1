import React, { useMemo, useRef, useState } from "react";

const THURSDAY = 4;
const TENANTS = [
  { id: "1", name: "Ames" },
  { id: "2", name: "Basser" },
  { id: "3", name: "Galet" },
  { id: "4", name: "Grossman" },
  { id: "5", name: "Vale" },
];

const ROTATION_START = new Date(2025, 7, 13); // Aug 13, 2025 — anchored one week earlier so Grossman is on duty this week

// One color palette entry per tenant (same index order as TENANTS)
const PALETTE = [
  { bg: "#dbeafe", border: "#93c5fd", text: "#1e40af", pill: "#bfdbfe" }, // blue   — Ames
  { bg: "#dcfce7", border: "#86efac", text: "#166534", pill: "#bbf7d0" }, // green  — Basser
  { bg: "#fef9c3", border: "#fde047", text: "#854d0e", pill: "#fef08a" }, // yellow — Galet
  { bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6", pill: "#ddd6fe" }, // violet — Grossman
  { bg: "#fce7f3", border: "#f9a8d4", text: "#9d174d", pill: "#fbcfe8" }, // pink   — Vale
];

function tenantColor(id) {
  const idx = parseInt(id, 10) - 1;
  return PALETTE[idx] ?? PALETTE[0];
}

// ---------- Utilities ----------
const MS_PER_DAY = 24 * 60 * 60 * 1000;
function toLocalMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysBetween(a, b) {
  return Math.round(
    (toLocalMidnight(b).getTime() - toLocalMidnight(a).getTime()) / MS_PER_DAY
  );
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function addMonths(d, n) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}
function formatDate(d) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}
function formatDateLong(d) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ---------- Assignment ----------
function getAssigneeForDate(date) {
  if (date.getDay() !== THURSDAY) return null;
  const diff = Math.max(0, daysBetween(ROTATION_START, date));
  const weeks = Math.floor(diff / 7);
  return TENANTS[weeks % TENANTS.length];
}

// ─────────────────────────────────────────────
// PrintSheet — the actual 8.5 × 11 page layout
// ─────────────────────────────────────────────
function PrintSheet({ twelveWeeks, today }) {
  return (
    <div
      id="print-sheet"
      style={{
        width: "8.5in",
        minHeight: "11in",
        padding: "0.55in 0.6in",
        backgroundColor: "#ffffff",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "0.35in" }}>
        <div style={{ fontSize: "52px", lineHeight: 1 }}>🗑️</div>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "800",
            margin: "10px 0 4px",
            color: "#0f172a",
            letterSpacing: "-0.5px",
          }}
        >
          Building Bin Duty
        </h1>
        <p style={{ fontSize: "15px", color: "#475569", margin: "0 0 4px" }}>
          12-Week Bin Duty Schedule
        </p>
      </div>

      {/* ── Tenant legend ── */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "0.3in",
        }}
      >
        {TENANTS.map((t) => {
          const c = tenantColor(t.id);
          return (
            <span
              key={t.id}
              style={{
                display: "inline-block",
                width: "120px",
                textAlign: "center",
                backgroundColor: c.bg,
                border: `2px solid ${c.border}`,
                color: c.text,
                borderRadius: "999px",
                padding: "5px 18px",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              {t.name}
            </span>
          );
        })}
      </div>

      {/* ── Schedule table ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "15px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th
              style={{
                padding: "10px 14px",
                textAlign: "left",
                borderBottom: "2px solid #cbd5e1",
                width: "52px",
                color: "#475569",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              #
            </th>
            <th
              style={{
                padding: "10px 14px",
                textAlign: "left",
                borderBottom: "2px solid #cbd5e1",
                color: "#475569",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Date (Thursday)
            </th>
            <th
              style={{
                padding: "10px 14px",
                textAlign: "left",
                borderBottom: "2px solid #cbd5e1",
                color: "#475569",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                width: "160px",
              }}
            >
              Tenant
            </th>
            <th
              style={{
                padding: "10px 14px",
                textAlign: "center",
                borderBottom: "2px solid #cbd5e1",
                color: "#475569",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                width: "90px",
              }}
            >
              Done ✓
            </th>
          </tr>
        </thead>
        <tbody>
          {twelveWeeks.map(({ date, who }, i) => {
            const c = who ? tenantColor(who.id) : { bg: "#f8fafc", border: "#e2e8f0", text: "#64748b", pill: "#e2e8f0" };
            return (
              <tr key={date.toISOString()} style={{ backgroundColor: c.bg }}>
                {/* Week number */}
                <td
                  style={{
                    padding: "13px 14px",
                    borderBottom: `1px solid ${c.border}`,
                    color: c.text,
                    fontWeight: "800",
                    fontSize: "20px",
                    lineHeight: 1,
                  }}
                >
                  {i + 1}
                </td>
                {/* Date */}
                <td
                  style={{
                    padding: "13px 14px",
                    borderBottom: `1px solid ${c.border}`,
                    fontWeight: "500",
                    color: "#0f172a",
                  }}
                >
                  {formatDateLong(date)}
                </td>
                {/* Tenant pill */}
                <td
                  style={{
                    padding: "13px 14px",
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "110px",
                      textAlign: "center",
                      backgroundColor: c.pill,
                      color: c.text,
                      borderRadius: "999px",
                      padding: "4px 14px",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    {who ? who.name : "—"}
                  </span>
                </td>
                {/* Checkbox */}
                <td
                  style={{
                    padding: "13px 14px",
                    borderBottom: `1px solid ${c.border}`,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      border: `2.5px solid ${c.border}`,
                      borderRadius: "6px",
                      backgroundColor: "#ffffff",
                      margin: "0 auto",
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Footer note ── */}
      <p
        style={{
          marginTop: "0.3in",
          textAlign: "center",
          fontSize: "12px",
          color: "#94a3b8",
        }}
      >
        Printed {formatDate(today)}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// PrintPreviewModal
// ─────────────────────────────────────────────
function PrintPreviewModal({ twelveWeeks, today, onClose, onPrint }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
      className="screen-only"
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#1e293b",
          padding: "12px 24px",
          color: "#f1f5f9",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: "600", fontSize: "15px" }}>
          🖨️ &nbsp;Print Preview — 12-Week Schedule
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onPrint}
            style={{
              backgroundColor: "#0ea5e9",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Print
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#475569",
              color: "#f1f5f9",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Paper preview area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "#64748b",
          display: "flex",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            borderRadius: "4px",
            overflow: "hidden",
            height: "fit-content",
          }}
        >
          <PrintSheet twelveWeeks={twelveWeeks} today={today} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function BinDutyScheduler() {
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [monthCursor, setMonthCursor] = useState(toLocalMidnight(new Date()));
  const [search, setSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const printAreaRef = useRef(null);

  const today = toLocalMidnight(new Date());

  const handlePrint = () => {
    const html = printAreaRef.current?.innerHTML;
    if (!html) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: letter; margin: 0; }
    body { margin: 0; padding: 0; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
  </style>
</head>
<body>${html}</body>
</html>`);
    win.document.close();
    win.focus();
    win.onafterprint = () => win.close();
    win.print();
  };

  const upcoming = useMemo(() => {
    const list = [];
    for (let i = 0; i < 60; i++) {
      const candidate = addDays(today, i);
      if (candidate.getDay() === THURSDAY) {
        list.push({ date: candidate, who: getAssigneeForDate(candidate) });
      }
    }
    return list;
  }, [today]);

  const twelveWeeks = useMemo(() => {
    const list = [];
    for (let i = 0; i < 120; i++) {
      const candidate = addDays(today, i);
      if (candidate.getDay() === THURSDAY) {
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
      if (candidate.getDay() !== THURSDAY) continue;
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

  return (
    <>
      {/* ── Global print CSS ── */}
      <style>{`
        @media screen {
          #print-area { display: none; }
        }
        @media print {
          @page { size: letter; margin: 0; }
          #print-area { display: block; }
          .screen-only { display: none !important; }
        }
      `}</style>

      {/* ── Always-in-DOM print area (hidden on screen, shown when printing) ── */}
      <div id="print-area" ref={printAreaRef}>
        <PrintSheet twelveWeeks={twelveWeeks} today={today} />
      </div>

      {/* ── Print preview modal ── */}
      {showPreview && (
        <PrintPreviewModal
          twelveWeeks={twelveWeeks}
          today={today}
          onClose={() => setShowPreview(false)}
          onPrint={handlePrint}
        />
      )}

      {/* ── Screen UI ── */}
      <div className="screen-only min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-5xl p-4 sm:p-8">

          {/* Header */}
          <header className="mb-6 sm:mb-10 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Building Bin Duty</h1>
              <p className="text-slate-600">Bins are taken in every Thursday</p>
            </div>
            <button
              onClick={() => setShowPreview(true)}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 transition-colors"
            >
              🖨️ Preview &amp; Print 12 Weeks
            </button>
          </header>

          {/* Today + Upcoming */}
          <section className="grid gap-4 sm:grid-cols-3 mb-8">
            {/* Today */}
            <div className="sm:col-span-1 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-500">Today</div>
              <div className="mt-2 text-lg font-semibold">{formatDate(today)}</div>
              <div className="mt-3 text-2xl font-bold">
                {todaysAssignee ? todaysAssignee.name : "No duty today"}
              </div>
              {selectedTenant && todaysAssignee && (
                <div className="mt-3 text-sm text-slate-600">
                  {todaysAssignee.id === selectedTenant.id ? (
                    <span className="inline-block rounded-full bg-sky-100 px-2 py-1 text-sky-700">
                      Your turn today
                    </span>
                  ) : (
                    <span>Highlighted: {selectedTenant.name}</span>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming */}
            <div className="sm:col-span-2 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Next Thursdays</div>
                  <div className="text-sm text-slate-600">Upcoming schedule</div>
                </div>
                {selectedTenant && (
                  <div className="text-xs text-slate-600">
                    Next for <span className="font-medium">{selectedTenant.name}</span>:{" "}
                    {nextForSelected ? formatDate(nextForSelected) : "—"}
                  </div>
                )}
              </div>

              {/* Highlight filter */}
              <div className="mt-3 mb-2">
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

              <div className="mt-2 divide-y divide-slate-100 max-h-64 overflow-auto rounded-xl border border-slate-100">
                {upcoming.map(({ date, who }) => {
                  const c = who ? tenantColor(who.id) : null;
                  const isHighlighted = selectedTenant && who && who.id === selectedTenant.id;
                  return (
                    <div
                      key={date.toISOString()}
                      className="flex items-center justify-between px-4 py-2 text-sm"
                      style={isHighlighted && c ? { backgroundColor: c.bg } : {}}
                    >
                      <div className="w-28 font-medium">{formatDate(date)}</div>
                      {who && c ? (
                        <span
                          style={{
                            display: "inline-block",
                            width: "100px",
                            textAlign: "center",
                            backgroundColor: c.pill,
                            color: c.text,
                            borderRadius: "999px",
                            padding: "2px 12px",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          {who.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Tenant finder + Calendar */}
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
                {filteredTenants.map((t, i) => {
                  const c = PALETTE[parseInt(t.id, 10) - 1];
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTenantId(t.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                      style={selectedTenantId === t.id ? { backgroundColor: c.bg } : {}}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: c.border,
                          flexShrink: 0,
                        }}
                      />
                      {t.name}
                    </button>
                  );
                })}
              </div>
              {selectedTenant && (
                <div className="mt-3 text-xs text-slate-600">
                  Next for <span className="font-medium">{selectedTenant.name}</span>:{" "}
                  {nextForSelected ? formatDate(nextForSelected) : "—"}
                </div>
              )}
            </div>

            {/* Month Calendar */}
            <div className="sm:col-span-2 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(monthCursor)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setMonthCursor(toLocalMidnight(new Date()))}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>
              </div>

              <CalendarGrid
                monthDate={monthCursor}
                getAssigneeForDate={getAssigneeForDate}
                highlightTenantId={selectedTenantId || null}
                tenantColor={tenantColor}
              />

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 outline outline-2 outline-slate-400 rounded" />
                  Today
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 ring-2 ring-sky-400 rounded" />
                  Highlighted tenant
                </span>
              </div>
            </div>
          </section>

          <footer className="py-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Bin Duty
          </footer>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// CalendarGrid
// ─────────────────────────────────────────────
function buildMonthGrid(anchor) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = [];
  for (let i = 0; i < startWeekday; i++) {
    grid.push({ date: new Date(year, month, 1 - (startWeekday - i)), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    grid.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (grid.length < 42) {
    const last = grid[grid.length - 1].date;
    grid.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inMonth: false,
    });
  }
  return grid;
}

function CalendarGrid({ monthDate, getAssigneeForDate, highlightTenantId, tenantColor }) {
  const today = toLocalMidnight(new Date());
  const grid = useMemo(() => buildMonthGrid(monthDate), [monthDate]);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
        {weekdays.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map(({ date, inMonth }) => {
          const who = getAssigneeForDate(date);
          const c = who ? tenantColor(who.id) : null;
          const isTodayCell = isSameDay(date, today);
          const isHighlighted = highlightTenantId && who && who.id === highlightTenantId;

          return (
            <div
              key={date.toISOString()}
              className={
                "relative h-24 rounded-xl border p-2 text-xs " +
                (inMonth ? "border-slate-200" : "border-slate-100 text-slate-400") +
                (isTodayCell ? " outline outline-2 outline-slate-400" : "") +
                (isHighlighted ? " ring-2 ring-sky-400" : "")
              }
              style={
                inMonth && c
                  ? { backgroundColor: c.bg }
                  : inMonth
                  ? { backgroundColor: "#ffffff" }
                  : { backgroundColor: "#f8fafc" }
              }
              title={`${date.toDateString()} — ${who ? who.name : "No duty"}`}
            >
              <div className="flex items-start justify-between">
                <div className="font-semibold text-slate-700">{date.getDate()}</div>
                {who && c && (
                  <div
                    style={{
                      backgroundColor: c.pill,
                      color: c.text,
                      borderRadius: "4px",
                      padding: "0 4px",
                      fontSize: "10px",
                      fontWeight: "700",
                    }}
                  >
                    {who.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {who && c && (
                <div className="mt-1 flex justify-center">
                  <span
                    style={{
                      display: "inline-block",
                      width: "100%",
                      textAlign: "center",
                      backgroundColor: c.pill,
                      color: c.text,
                      borderRadius: "999px",
                      padding: "1px 4px",
                      fontSize: "10px",
                      fontWeight: "700",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {who.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
