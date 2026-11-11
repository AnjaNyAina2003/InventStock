import { useEffect, useState } from "react";
import apiClient from "../../../../api/apiClient";
import LoadingScreen from "../../../Loading/LoadingScreen";
const FILTERS = ["7J", "1M", "6M", "1A"];
const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const GREEN = "#3b82f6";   
const ROSE  = "#f97316";   
const BLUE  = "#6366f1"; 

function buildPeriodData(mouvements, filter) {
  const now = new Date();
  const sumFor = (start, end) => {
    let entrees = 0, sorties = 0;
    for (const m of mouvements) {
      const d = new Date(m.date_create);
      if (d >= start && d < end) {
        if (m.mouvement_type === "ENTREE") entrees += Number(m.quantite);
        else sorties += Number(m.quantite);
      }
    }
    return { entrees, sorties };
  };

  let series = [];
  let currentStart, currentEnd, previousStart, previousEnd;

  if (filter === "7J") {
    series = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - i));
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const end = new Date(start); end.setDate(start.getDate() + 1);
      const { entrees, sorties } = sumFor(start, end);
      return { label: JOURS[day.getDay()], entrees, sorties };
    });
    currentStart = new Date(now); currentStart.setDate(now.getDate() - 6);
    currentStart.setHours(0, 0, 0, 0);
    currentEnd = new Date(now); currentEnd.setDate(now.getDate() + 1); currentEnd.setHours(0, 0, 0, 0);
    previousEnd = currentStart;
    previousStart = new Date(previousEnd); previousStart.setDate(previousEnd.getDate() - 7);
  } else if (filter === "1M") {
    series = Array.from({ length: 4 }).map((_, i) => {
      const start = new Date(now); start.setDate(now.getDate() - (28 - i * 7));
      const end = new Date(start); end.setDate(start.getDate() + 7);
      const { entrees, sorties } = sumFor(start, end);
      return { label: `S${i + 1}`, entrees, sorties };
    });
    currentStart = new Date(now); currentStart.setDate(now.getDate() - 28);
    currentEnd = now;
    previousEnd = currentStart;
    previousStart = new Date(previousEnd); previousStart.setDate(previousEnd.getDate() - 28);
  } else {
    const monthsCount = filter === "6M" ? 6 : 12;
    series = Array.from({ length: monthsCount }).map((_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1 - i), 1);
      const start = monthDate;
      const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
      const { entrees, sorties } = sumFor(start, end);
      return { label: MOIS[monthDate.getMonth()], entrees, sorties };
    });
    currentStart = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);
    currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    previousEnd = currentStart;
    previousStart = new Date(now.getFullYear(), now.getMonth() - (monthsCount * 2 - 1), 1);
  }

  const current = sumFor(currentStart, currentEnd);
  const previous = sumFor(previousStart, previousEnd);

  const pct = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    series,
    totalEntrees: current.entrees,
    totalSorties: current.sorties,
    deltaEntreesPct: pct(current.entrees, previous.entrees),
    deltaSortiesPct: pct(current.sorties, previous.sorties),
  };
}

export default function ChartEntreesSorties() {
  const [activeFilter, setActiveFilter] = useState("6M");
  const [tooltip, setTooltip] = useState(null);
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      apiClient.get("/produit/historiqueMvt")
        .then((res) => setMouvements(res.data))
        .catch(() => setMouvements([]))
        .finally(() => setLoading(false));
    }, []);
  
    if (loading) {
      return <LoadingScreen message="Chargement du graphique..." />;
    }
  
  const { series: currentData, totalEntrees, totalSorties, deltaEntreesPct, deltaSortiesPct } =
    buildPeriodData(mouvements, activeFilter);
  const maxVal = Math.max(...currentData.flatMap(d => [d.entrees, d.sorties]));
  const gridMax = Math.ceil(maxVal / 50) * 50;
  const gridSteps = [gridMax, gridMax * 0.75, gridMax * 0.5, gridMax * 0.25, 0];

  const solde = totalEntrees - totalSorties;
  const soldePercent = Math.min(100, Math.round((solde / totalEntrees) * 100));

  const BAR_HEIGHT = 240;

  return (
    <div style={{
      background: "#c9c8c3",
      minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .tab-btn { background: none; border: 1px solid transparent; cursor: pointer; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 500; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .tab-btn:hover { background: #1a1e2a; color: #e2e5f0; }
        .tab-active { background: #1a1e2a !important; border-color: rgba(255,255,255,0.06) !important; color: #e2e5f0 !important; }
        .bar-wrap:hover .bar-fill-green { filter: brightness(1.25); cursor: pointer;}
        .bar-wrap:hover .bar-fill-rose  { filter: brightness(1.25); cursor: pointer;}
      `}</style>

      <div style={{
        background: "var(--black-chart)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 28,
        padding: "36px 40px 32px",
        width: "42.3rem",
        maxWidth: 680,
        position: "relative",
      }}>

        <div style={{
          position: "absolute", inset: 0, borderRadius: 28, overflow: "hidden",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px", pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, position: "relative" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#e2e5f0" }}>
              Entrées vs Sorties
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4, fontWeight: 300 }}>
              Mouvement de stock · période sélectionnée
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {[{ color: GREEN, label: "Entrées" }, { color: ROSE, label: "Sorties" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 500, color: "#6b7280" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, flexShrink: 0 }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 24, position: "relative" }}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`tab-btn ${activeFilter === f ? "tab-active" : ""}`}
              style={{ color: activeFilter === f ? "#e2e5f0" : "#4e5568" }}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 32, position: "relative" }}>
          {[
            {
              label: "Total Entrées", value: totalEntrees, color: GREEN,
              delta: `${deltaEntreesPct >= 0 ? "↑ +" : "↓ "}${deltaEntreesPct}% vs période préc.`,
              deltaUp: deltaEntreesPct >= 0,
            },
            {
              label: "Total Sorties", value: totalSorties, color: ROSE,
              delta: `${deltaSortiesPct >= 0 ? "↑ +" : "↓ "}${deltaSortiesPct}% vs période préc.`,
              deltaUp: deltaSortiesPct < 0, // une baisse des sorties est "positive"
            },
            {
              label: "Solde net", value: `${solde >= 0 ? "+" : ""}${solde}`, color: BLUE,
              delta: solde >= 0 ? "Stock en hausse" : "Stock en baisse",
              deltaUp: solde >= 0,
            },
          ].map(c => (
            <div key={c.label} style={{
              flex: 1, background: "#1a1e2a", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 4,
            }}>
              <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>{c.label}</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: c.deltaUp ? GREEN : ROSE }}>{c.delta}</span>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", height: BAR_HEIGHT + 32, userSelect: "none" }}>

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BAR_HEIGHT, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
            {gridSteps.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#4e5568", minWidth: 32, textAlign: "right" }}>{v}</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              </div>
            ))}
          </div>

          <div style={{
            position: "absolute", bottom: 32, left: 44, right: 0, top: 0,
            display: "flex", alignItems: "flex-end", gap: 6,
          }}>
            {currentData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 3, height: "100%" }}>

                <div
                  className="bar-wrap"
                  style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", position: "relative", cursor: "pointer" }}
                  onMouseEnter={() => setTooltip({ i, type: "entrees", value: d.entrees, label: d.label })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {tooltip && tooltip.i === i && tooltip.type === "entrees" && (
                    <div style={{
                      position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                      background: "#1a1e2a", border: `1px solid rgba(59,130,246,0.35)`, borderRadius: 8,
                      padding: "5px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                      color: GREEN, zIndex: 10,
                    }}>
                      ↑ {d.entrees} entrées
                    </div>
                  )}
                  <div
                    className="bar-fill-green"
                    style={{
                      height: `${(d.entrees / gridMax) * 100}%`,
                      borderRadius: "6px 6px 2px 2px",
                      background: `linear-gradient(180deg, ${GREEN} 0%, rgba(59,130,246,0.45) 100%)`,
                      boxShadow: `0 0 14px rgba(59,130,246,0.3)`,
                      transition: "filter 0.2s, height 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  />
                </div>

                <div
                  className="bar-wrap"
                  style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", position: "relative", cursor: "pointer" }}
                  onMouseEnter={() => setTooltip({ i, type: "sorties", value: d.sorties, label: d.label })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {tooltip && tooltip.i === i && tooltip.type === "sorties" && (
                    <div style={{
                      position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                      background: "#1a1e2a", border: `1px solid rgba(249,115,22,0.35)`, borderRadius: 8,
                      padding: "5px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                      color: ROSE, zIndex: 10,
                    }}>
                      ↓ {d.sorties} sorties
                    </div>
                  )}
                  <div
                    className="bar-fill-rose"
                    style={{
                      height: `${(d.sorties / gridMax) * 100}%`,
                      borderRadius: "6px 6px 2px 2px",
                      background: `linear-gradient(180deg, ${ROSE} 0%, rgba(249,115,22,0.45) 100%)`,
                      boxShadow: `0 0 14px rgba(249,115,22,0.3)`,
                      transition: "filter 0.2s, height 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 44, right: 0, display: "flex", gap: 6 }}>
            {currentData.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#6b7280", fontWeight: 500 }}>
                {d.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}>
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Solde cumulé</span>
          <div style={{ flex: 1, height: 6, background: "#1a1e2a", borderRadius: 99, margin: "0 20px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99, width: `${soldePercent}%`,
              background: `linear-gradient(90deg, ${GREEN}, ${BLUE})`,
              transition: "width 1s ease",
            }} />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: GREEN }}>
            {solde >= 0 ? "+" : ""}{solde} unités
          </span>
        </div>

      </div>
    </div>
  );
}