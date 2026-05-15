import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../config/api";

function toDiaStr(d) {
  if (!d) return "";
  return String(d instanceof Date ? d.toISOString() : d).slice(0, 10);
}

function formatKg(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k kg`;
  return `${Math.round(n)} kg`;
}

function parseUTC(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function todayStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}

function addDays(diaStr, n) {
  const d = parseUTC(diaStr);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function dowMon(diaStr) {
  return (parseUTC(diaStr).getUTCDay() + 6) % 7;
}

function weekSlots(map, today, dayMon) {
  const dow = dowMon(today);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - dow);
    return { dateStr: d, label: dayMon[i], value: map[d] || 0, isToday: d === today };
  });
}

function dailySlots(map, days, today, monthSh) {
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(today, -(days - 1 - i));
    const dt = parseUTC(d);
    const label = `${dt.getUTCDate()} ${monthSh[dt.getUTCMonth()]}`;
    return { dateStr: d, label, value: map[d] || 0, isToday: d === today };
  });
}

function weeklySlots(map, weeks, today, monthSh) {
  const dow = dowMon(today);
  const thisMonday = addDays(today, -dow);
  return Array.from({ length: weeks }, (_, i) => {
    const monStr = addDays(thisMonday, -(weeks - 1 - i) * 7);
    const monDate = parseUTC(monStr);
    let total = 0;
    for (let j = 0; j < 7; j++) total += map[addDays(monStr, j)] || 0;
    return {
      dateStr: monStr,
      label: `${monDate.getUTCDate()} ${monthSh[monDate.getUTCMonth()]}`,
      value: Math.round(total),
      isToday: false,
    };
  });
}

function monthlySlots(monthMap, months, today, monthSh) {
  const ref = parseUTC(today);
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - (months - 1 - i), 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
    return {
      dateStr: key + "-01",
      label: monthSh[d.getUTCMonth()],
      value: Math.round(monthMap[key] || 0),
      isToday: false,
    };
  });
}

//  Chevron icon
function ChevronDown({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function VolumeChart() {
  const { t } = useTranslation();
  const [period, setPeriod]         = useState("week");
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [dropOpen, setDropOpen]     = useState(false);
  const dropRef = useRef(null);

  const PERIODS = useMemo(() => [
    { key: "week",    label: t("stats.volume_chart.periods.week") },
    { key: "month",   label: t("stats.volume_chart.periods.month")    },
    { key: "3months", label: t("stats.volume_chart.periods.months_3")     },
    { key: "year",    label: t("stats.volume_chart.periods.year")    },
    { key: "all",     label: t("stats.volume_chart.periods.always")     },
  ], [t]);

  const DAY_MON  = useMemo(() => t("stats.volume_chart.days", { returnObjects: true }), [t]);
  const MONTH_SH = useMemo(() => t("stats.volume_chart.months", { returnObjects: true }), [t]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setHoveredIdx(null);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/workout/volume-chart?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const buildBars = () => {
    const today = todayStr();
    const dayMap = {};
    data.forEach(r => { const k = toDiaStr(r.dia); dayMap[k] = (dayMap[k] || 0) + (parseFloat(r.volumen_kg) || 0); });
    const monthMap = {};
    data.forEach(r => { const k = toDiaStr(r.dia).slice(0, 7); monthMap[k] = (monthMap[k] || 0) + (parseFloat(r.volumen_kg) || 0); });

    switch (period) {
      case "week":    return weekSlots(dayMap, today, DAY_MON);
      case "month":   return dailySlots(dayMap, 30, today, MONTH_SH);
      case "3months": return weeklySlots(dayMap, 13, today, MONTH_SH);
      case "year":    return monthlySlots(monthMap, 12, today, MONTH_SH);
      case "all": {
        if (data.length === 0) return monthlySlots(monthMap, 12, today, MONTH_SH);
        const earliest = toDiaStr(data[0].dia).slice(0, 7);
        const [ey, em] = earliest.split("-").map(Number);
        const now = new Date();
        const total = Math.min((now.getFullYear() - ey) * 12 + (now.getMonth() + 1 - em) + 1, 36);
        return monthlySlots(monthMap, Math.max(total, 12), today, MONTH_SH);
      }
      default: return weekSlots(dayMap, today, DAY_MON);
    }
  };

  const bars     = buildBars();
  const maxVal   = Math.max(...bars.map(b => b.value), 1);
  const totalVol = bars.reduce((a, b) => a + b.value, 0);
  const bestDay  = bars.reduce((a, b) => (b.value > a.value ? b : a), bars[0] || { value: 0 });
  const showEvery = bars.length <= 7 ? 1 : bars.length <= 14 ? 2 : Math.ceil(bars.length / 7);

  const activePeriod = PERIODS.find(p => p.key === period);

  return (
    <div className="px-4 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("stats.volume_chart.title")}</h3>
          {!loading && totalVol > 0 && (
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              {formatKg(totalVol)} · {t("stats.volume_chart.logs", { count: bars.filter(b => b.value > 0).length })}
            </p>
          )}
        </div>

        {/* Dropdown select */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/40 text-[11px] font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            {activePeriod?.label}
            <ChevronDown open={dropOpen} />
          </button>

          {/* Dropdown menu */}
          {dropOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[130px] bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => { setPeriod(p.key); setDropOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-[12px] font-medium transition-colors ${
                    p.key === period
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-4 overflow-hidden">
        {loading ? (
          <div className="h-36 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Summary tooltip */}
            <div className="h-7 flex items-center mb-2">
              {hoveredIdx !== null && bars[hoveredIdx]?.value > 0 ? (
                <div className="flex items-baseline gap-1.5 animate-in fade-in duration-150">
                  <span className="text-xl font-black text-foreground tracking-tight">
                    {formatKg(bars[hoveredIdx].value)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {bars[hoveredIdx].label}
                  </span>
                </div>
              ) : totalVol > 0 ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-foreground tracking-tight">
                    {formatKg(bestDay?.value || 0)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{t("stats.volume_chart.best_log")}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground font-medium">
                  {t("stats.volume_chart.no_data")}
                </span>
              )}
            </div>

            {/* Bars */}
            <div className="flex items-end gap-[2px] h-28 overflow-x-hidden">
              {bars.map((bar, i) => {
                const heightPct = bar.value > 0 ? Math.max((bar.value / maxVal) * 100, 6) : 0;
                const isEmpty   = bar.value === 0;
                const isHovered = hoveredIdx === i;
                const showLabel = i % showEvery === 0 || i === bars.length - 1;

                return (
                  <div
                    key={`${bar.dateStr}-${i}`}
                    className="flex flex-col items-center flex-1 gap-1 cursor-pointer min-w-0"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onTouchStart={() => setHoveredIdx(i)}
                    onTouchEnd={() => setTimeout(() => setHoveredIdx(null), 1500)}
                  >
                    <div className="w-full flex items-end justify-center h-24">
                      {isEmpty ? (
                        <div
                          className={`w-full rounded-sm ${bar.isToday ? "border border-dashed border-primary/40 bg-primary/10" : "bg-secondary/25"}`}
                          style={{ height: "3px" }}
                        />
                      ) : (
                        <div
                          className={`w-full rounded-t-[3px] transition-all duration-300 ${
                            bar.isToday
                              ? isHovered ? "bg-primary" : "bg-primary/85"
                              : isHovered ? "bg-primary/75" : "bg-primary/45"
                          }`}
                          style={{
                            height: `${heightPct}%`,
                            boxShadow: isHovered ? "0 0 10px rgba(99,102,241,0.5)" : "none",
                          }}
                        />
                      )}
                    </div>

                    <span
                      className={`text-[8px] font-semibold leading-none truncate max-w-full ${
                        showLabel
                          ? bar.isToday ? "text-primary"
                            : isHovered && !isEmpty ? "text-foreground"
                            : "text-muted-foreground/50"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
