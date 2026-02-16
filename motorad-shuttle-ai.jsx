import { useState, useEffect, useCallback, useMemo } from "react";

// ─── SAMPLE DATA ───
const VEHICLES = [
  { id: "v1", type: "מיניבוס 14", capacity: 14, fixedCost: 180, costPerKm: 7.5, comfort: 4 },
  { id: "v2", type: "מיניבוס 20", capacity: 20, fixedCost: 220, costPerKm: 8.2, comfort: 3 },
  { id: "v3", type: "אוטובוס 35", capacity: 35, fixedCost: 280, costPerKm: 6.8, comfort: 4 },
  { id: "v4", type: "אוטובוס 50", capacity: 50, fixedCost: 350, costPerKm: 6.0, comfort: 3 },
];

const REGIONS = ["צפון", "חיפה והקריות", "מרכז-צפון", "מרכז", "דרום"];
const CITIES = {
  "צפון": ["כרמיאל", "מעלות", "נהריה", "עכו", "צפת", "טבריה"],
  "חיפה והקריות": ["חיפה", "קריית אתא", "קריית ביאליק", "קריית מוצקין", "טירת כרמל", "נשר"],
  "מרכז-צפון": ["עפולה", "נצרת", "יקנעם", "מגדל העמק", "בית שאן"],
  "מרכז": ["תל אביב", "רמת גן", "פתח תקווה", "ראשון לציון", "חולון"],
  "דרום": ["באר שבע", "אשדוד", "אשקלון", "דימונה", "ערד"],
};

const DEPARTMENTS = ["ייצור", "הנדסה", "אבטחת איכות", "לוגיסטיקה", "מנהלה"];
const SHIFTS = ["בוקר", "לילה", "חופש"];
const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];

const generateEmployees = () => {
  const names = [
    "יוסי כהן", "דנה לוי", "מוחמד סעיד", "אנה ברקוביץ", "עומר חסן",
    "רותם שפירא", "טל אביטל", "נועה גולדשטיין", "אחמד מנסור", "שירה בן דוד",
    "איתי פרידמן", "מיכל רוזנברג", "סאלח עותמאן", "ליאור נחום", "הילה קצב",
    "עידו מזרחי", "יעל אברהם", "חאלד ח׳טיב", "גל ברנר", "סיגל עמרם",
    "אלון דהן", "ענבל שושן", "פאדי נאסר", "רון חיים", "אורלי ביטון",
    "ניר תמיר", "לימור אוחיון", "וליד סלימאן", "עדי פלדמן", "קרן וינשטיין",
    "אסף גורן", "מורן צדוק", "ראמי זידאן", "דורון סבג", "שני מלכה",
    "בועז ישראלי", "חן אלבז", "סמיר דראושה", "רינת חזן", "יובל ששון",
  ];
  return names.map((name, i) => {
    const regionIdx = i % REGIONS.length;
    const region = REGIONS[regionIdx];
    const cityList = CITIES[region];
    const city = cityList[i % cityList.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    return {
      id: `emp-${i + 1}`,
      name,
      city,
      region,
      department: dept,
      address: `רחוב ${i + 1}, ${city}`,
      shifts: DAYS.map(() => SHIFTS[Math.random() > 0.15 ? 0 : (Math.random() > 0.5 ? 1 : 2)]),
      overtime: false,
      overtimeUpdated: false,
      absent: false,
      feedback: null,
    };
  });
};

const generateRoutes = (employees) => {
  const morningWorkers = employees.filter((e, i) => e.shifts[new Date().getDay() === 0 ? 0 : Math.min(new Date().getDay() - 1, 4)] === "בוקר" && !e.absent);
  const grouped = {};
  morningWorkers.forEach((emp) => {
    if (!grouped[emp.region]) grouped[emp.region] = [];
    grouped[emp.region].push(emp);
  });
  const routes = [];
  let routeNum = 1;
  Object.entries(grouped).forEach(([region, emps]) => {
    let remaining = [...emps];
    while (remaining.length > 0) {
      const batch = remaining.splice(0, Math.min(remaining.length, 14 + Math.floor(Math.random() * 7)));
      const vehicle = VEHICLES.find((v) => v.capacity >= batch.length) || VEHICLES[VEHICLES.length - 1];
      const distance = 25 + Math.floor(Math.random() * 40);
      const duration = 20 + Math.floor(Math.random() * 35);
      const cost = vehicle.fixedCost + vehicle.costPerKm * distance;
      const occupancy = Math.round((batch.length / vehicle.capacity) * 100);
      const aiScore = Math.round(Math.min(100, occupancy * 0.3 + (100 - duration) * 0.3 + (1 - cost / 800) * 100 * 0.25 + vehicle.comfort * 5 * 0.15));
      routes.push({
        id: `route-${routeNum}`,
        name: `קו ${routeNum} — ${region}`,
        region,
        employees: batch.map((e) => e.id),
        employeeNames: batch.map((e) => e.name),
        vehicle: vehicle.type,
        vehicleId: vehicle.id,
        capacity: vehicle.capacity,
        distance,
        duration,
        cost: Math.round(cost),
        occupancy,
        aiScore: Math.max(45, Math.min(98, aiScore)),
        departureTime: "07:00",
        returnTime16: "16:15",
        returnTime18: "18:15",
        status: "מאושר",
        driver: ["דוד מלכה", "יורם סולומון", "חסן עבאסי", "אלכס פטרוב", "משה דיין"][routeNum % 5],
        stops: batch.map((e, idx) => ({ name: e.name, city: e.city, address: e.address, order: idx + 1, eta: `${7}:${String((idx * 4 + 5) % 60).padStart(2, "0")}` })),
      });
      routeNum++;
    }
  });
  return routes;
};

// ─── ICONS (inline SVG) ───
const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    truck: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    route: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H18"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    starEmpty: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevron: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    bus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6v6M16 6v6M2 12h20M6 18h2M16 18h2"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>,
  };
  return <span className={className} style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// ─── SCORE BADGE ───
const ScoreBadge = ({ score, size = "md" }) => {
  const color = score >= 80 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626";
  const bg = score >= 80 ? "#ecfdf5" : score >= 60 ? "#fffbeb" : "#fef2f2";
  const s = size === "lg" ? { fontSize: 18, padding: "6px 14px" } : { fontSize: 13, padding: "3px 10px" };
  return <span style={{ ...s, background: bg, color, fontWeight: 700, borderRadius: 20, border: `1.5px solid ${color}30` }}>{score}</span>;
};

// ─── KPI CARD ───
const KpiCard = ({ label, value, sub, color = "#0ea5e9", icon }) => (
  <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb", flex: 1, minWidth: 160 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", letterSpacing: -1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
      </div>
      {icon && <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}><Icon name={icon} size={22} /></div>}
    </div>
  </div>
);

// ─── ALERT ITEM ───
const AlertItem = ({ type, text, time }) => {
  const colors = { warning: { bg: "#fffbeb", border: "#fbbf24", icon: "#d97706" }, error: { bg: "#fef2f2", border: "#f87171", icon: "#dc2626" }, info: { bg: "#eff6ff", border: "#60a5fa", icon: "#2563eb" }, success: { bg: "#ecfdf5", border: "#34d399", icon: "#059669" } };
  const c = colors[type] || colors.info;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: c.bg, borderRadius: 10, borderRight: `4px solid ${c.border}`, marginBottom: 8 }}>
      <Icon name="alert" size={18} className="" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{text}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{time}</div>
      </div>
    </div>
  );
};

// ─── MAIN APP ───
export default function MotaradShuttleAI() {
  const [activeView, setActiveView] = useState("dashboard");
  const [employees, setEmployees] = useState(() => generateEmployees());
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [currentRole, setCurrentRole] = useState("coordinator");
  const [selectedDay, setSelectedDay] = useState(0);
  const [feedbackRoute, setFeedbackRoute] = useState(null);
  const [feedbackScore, setFeedbackScore] = useState(0);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = useCallback((msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); }, []);

  const runOptimization = useCallback(() => {
    setOptimizing(true);
    setTimeout(() => {
      const r = generateRoutes(employees);
      setRoutes(r);
      setOptimizing(false);
      setOptimized(true);
      showToast("האופטימיזציה הושלמה בהצלחה! נוצרו " + r.length + " קווים");
    }, 2500);
  }, [employees, showToast]);

  const totalEmployees = employees.length;
  const assignedEmployees = routes.reduce((s, r) => s + r.employees.length, 0);
  const avgOccupancy = routes.length ? Math.round(routes.reduce((s, r) => s + r.occupancy, 0) / routes.length) : 0;
  const totalCost = routes.reduce((s, r) => s + r.cost, 0);
  const avgAiScore = routes.length ? Math.round(routes.reduce((s, r) => s + r.aiScore, 0) / routes.length) : 0;

  const navItems = [
    { id: "dashboard", label: "לוח בקרה", icon: "dashboard" },
    { id: "weekly", label: "תכנון שבועי", icon: "calendar" },
    { id: "daily", label: "תפעול יומי", icon: "clock" },
    { id: "employee", label: "ממשק עובד", icon: "user" },
    { id: "driver", label: "ממשק נהג", icon: "truck" },
    { id: "settings", label: "הגדרות", icon: "settings" },
  ];

  // ─── SIDEBAR ───
  const Sidebar = () => (
    <div style={{ width: 240, background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", color: "#fff", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", right: 0, top: 0, zIndex: 50 }}>
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #334155" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16 }}>M</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>Motorad AI</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>מערכת הסעות חכמה</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 10px", flex: 1 }}>
        {navItems.map((item) => (
          <button key={item.id} onClick={() => { setActiveView(item.id); setSelectedRoute(null); }}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 14px", border: "none", borderRadius: 10, cursor: "pointer", marginBottom: 4, fontSize: 14, fontWeight: activeView === item.id ? 700 : 500, background: activeView === item.id ? "rgba(14,165,233,0.15)" : "transparent", color: activeView === item.id ? "#38bdf8" : "#94a3b8", transition: "all 0.15s" }}>
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "16px 14px", borderTop: "1px solid #334155" }}>
        <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #475569", background: "#1e293b", color: "#e2e8f0", fontSize: 13 }}>
          <option value="coordinator">מתאמת הסעות</option>
          <option value="manager">מנהל מחלקה</option>
          <option value="employee">עובד</option>
          <option value="driver">נהג</option>
        </select>
      </div>
    </div>
  );

  // ─── DASHBOARD VIEW ───
  const DashboardView = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>לוח בקרה</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>סקירה כללית של מערך ההסעות</p>
        </div>
        <button onClick={runOptimization} disabled={optimizing}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "none", background: optimizing ? "#94a3b8" : "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: optimizing ? "wait" : "pointer", boxShadow: "0 4px 14px #0ea5e930" }}>
          <Icon name={optimizing ? "refresh" : "play"} size={18} />
          {optimizing ? "מחשב..." : "הפעל אופטימיזציה"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KpiCard label="עובדים משובצים" value={`${assignedEmployees}/${totalEmployees}`} sub="עובדים פעילים" color="#0ea5e9" icon="user" />
        <KpiCard label="קווים פעילים" value={routes.length} sub="מסלולים היום" color="#8b5cf6" icon="route" />
        <KpiCard label="תפוסה ממוצעת" value={`${avgOccupancy}%`} sub={avgOccupancy >= 70 ? "תקין" : "מתחת ליעד"} color={avgOccupancy >= 70 ? "#059669" : "#d97706"} icon="bus" />
        <KpiCard label="עלות יומית" value={`₪${totalCost.toLocaleString()}`} sub="סה״כ כל הקווים" color="#f59e0b" icon="truck" />
        <KpiCard label="AI Score ממוצע" value={avgAiScore} sub={avgAiScore >= 75 ? "מעולה" : "ניתן לשיפור"} color={avgAiScore >= 75 ? "#059669" : "#d97706"} icon="star" />
      </div>

      {routes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>קווי הסעה</h2>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{routes.length} קווים</span>
            </div>
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              {routes.map((route) => (
                <div key={route.id} onClick={() => setSelectedRoute(selectedRoute?.id === route.id ? null : route)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, marginBottom: 6, cursor: "pointer", border: selectedRoute?.id === route.id ? "2px solid #0ea5e9" : "1px solid #f3f4f6", background: selectedRoute?.id === route.id ? "#f0f9ff" : "#fff", transition: "all 0.15s" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${route.aiScore >= 80 ? "#ecfdf5" : route.aiScore >= 60 ? "#fffbeb" : "#fef2f2"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ScoreBadge score={route.aiScore} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{route.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{route.vehicle} • {route.employees.length} נוסעים • {route.duration} דק׳</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>₪{route.cost}</div>
                    <div style={{ fontSize: 11, color: route.occupancy >= 70 ? "#059669" : "#d97706" }}>{route.occupancy}% תפוסה</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {selectedRoute ? (
              <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>{selectedRoute.name}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[["רכב", selectedRoute.vehicle], ["נהג", selectedRoute.driver], ["נוסעים", `${selectedRoute.employees.length}/${selectedRoute.capacity}`], ["מרחק", `${selectedRoute.distance} ק״מ`], ["זמן", `${selectedRoute.duration} דק׳`], ["עלות", `₪${selectedRoute.cost}`]].map(([l, v]) => (
                    <div key={l} style={{ padding: "8px 12px", background: "#f9fafb", borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: "#6b7280" }}>נקודות עצירה</h4>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {selectedRoute.stops.map((stop, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < selectedRoute.stops.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0ea5e9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{stop.order}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{stop.name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{stop.city}</div>
                      </div>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{stop.eta}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>התראות</h3>
              <AlertItem type="warning" text="קו 3 — תפוסה 52%, מתחת לסף. שקלו איחוד עם קו 4" time="לפני 10 דקות" />
              <AlertItem type="info" text="5 עובדים עדכנו שעות נוספות עד 18:00" time="לפני 25 דקות" />
              <AlertItem type="success" text="חישוב מחדש יומי הושלם בהצלחה" time="12:03" />
              <AlertItem type="error" text="עובד מוחמד סעיד דיווח היעדרות — קו 2 מעודכן" time="08:30" />
            </div>
          </div>
        </div>
      )}

      {!routes.length && !optimizing && (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="route" size={36} className="" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>אין מסלולים פעילים</h2>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>לחצו על ״הפעל אופטימיזציה״ כדי ליצור תוכנית מסלולים</p>
        </div>
      )}
    </div>
  );

  // ─── WEEKLY PLANNING VIEW ───
  const WeeklyView = () => {
    const deptEmployees = employees.filter(e => currentRole === "manager" ? e.department === "ייצור" : true);
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>תכנון שבועי — שיבוץ משמרות</h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>שבוע 16–20 בפברואר 2026</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => showToast("המשמרות נשמרו בהצלחה")} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>שמור טיוטה</button>
            <button onClick={() => { showToast("המשמרות נשלחו לאופטימיזציה"); runOptimization(); }} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#0ea5e9", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>שלח לאופטימיזציה</button>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #e5e7eb", position: "sticky", right: 0, background: "#f9fafb", minWidth: 160 }}>עובד</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #e5e7eb", minWidth: 80 }}>מחלקה</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #e5e7eb", minWidth: 80 }}>אזור</th>
                {DAYS.map(d => <th key={d} style={{ padding: "12px 10px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #e5e7eb", minWidth: 90 }}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {deptEmployees.slice(0, 20).map((emp, empIdx) => (
                <tr key={emp.id} style={{ background: empIdx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, borderBottom: "1px solid #f3f4f6", position: "sticky", right: 0, background: empIdx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                    <div>{emp.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{emp.city}</div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center", borderBottom: "1px solid #f3f4f6", fontSize: 12, color: "#6b7280" }}>{emp.department}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center", borderBottom: "1px solid #f3f4f6", fontSize: 12, color: "#6b7280" }}>{emp.region}</td>
                  {DAYS.map((_, di) => (
                    <td key={di} style={{ padding: "6px 8px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
                      <select value={emp.shifts[di]} onChange={(e) => {
                        const newEmps = [...employees];
                        const idx = newEmps.findIndex(x => x.id === emp.id);
                        newEmps[idx] = { ...newEmps[idx], shifts: [...newEmps[idx].shifts] };
                        newEmps[idx].shifts[di] = e.target.value;
                        setEmployees(newEmps);
                      }}
                        style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 600, width: "100%", textAlign: "center", cursor: "pointer",
                          background: emp.shifts[di] === "בוקר" ? "#dbeafe" : emp.shifts[di] === "לילה" ? "#ede9fe" : "#f3f4f6",
                          color: emp.shifts[di] === "בוקר" ? "#1d4ed8" : emp.shifts[di] === "לילה" ? "#6d28d9" : "#9ca3af" }}>
                        {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {deptEmployees.length > 20 && <div style={{ textAlign: "center", padding: 16, fontSize: 13, color: "#9ca3af" }}>מוצגים 20 מתוך {deptEmployees.length} עובדים</div>}
        </div>
      </div>
    );
  };

  // ─── DAILY OPERATIONS VIEW ───
  const DailyView = () => {
    const overtimeCount = employees.filter(e => e.overtime).length;
    const absentCount = employees.filter(e => e.absent).length;
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>תפעול יומי</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>יום שני, 16 בפברואר 2026 — עדכון שעות נוספות והיעדרויות</p>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
          <KpiCard label="שעות נוספות" value={overtimeCount} sub="עובדים עד 18:00" color="#8b5cf6" icon="clock" />
          <KpiCard label="היעדרויות" value={absentCount} sub="עובדים חסרים" color="#ef4444" icon="x" />
          <KpiCard label="סטטוס חלון" value="פתוח" sub="סגירה ב-12:00" color="#059669" icon="check" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>עדכון שעות נוספות</h2>
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {employees.filter(e => e.shifts[0] === "בוקר").slice(0, 15).map((emp) => (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{emp.city}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => {
                      const newEmps = [...employees];
                      const idx = newEmps.findIndex(x => x.id === emp.id);
                      newEmps[idx] = { ...newEmps[idx], overtime: false, overtimeUpdated: true };
                      setEmployees(newEmps);
                    }}
                      style={{ padding: "6px 14px", borderRadius: 8, border: !emp.overtime && emp.overtimeUpdated ? "2px solid #0ea5e9" : "1px solid #e5e7eb", background: !emp.overtime && emp.overtimeUpdated ? "#dbeafe" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: !emp.overtime && emp.overtimeUpdated ? "#1d4ed8" : "#374151" }}>16:00</button>
                    <button onClick={() => {
                      const newEmps = [...employees];
                      const idx = newEmps.findIndex(x => x.id === emp.id);
                      newEmps[idx] = { ...newEmps[idx], overtime: true, overtimeUpdated: true };
                      setEmployees(newEmps);
                    }}
                      style={{ padding: "6px 14px", borderRadius: 8, border: emp.overtime ? "2px solid #8b5cf6" : "1px solid #e5e7eb", background: emp.overtime ? "#ede9fe" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: emp.overtime ? "#6d28d9" : "#374151" }}>18:00</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>דיווח היעדרות</h2>
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {employees.slice(0, 15).map((emp) => (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{emp.department} • {emp.city}</div>
                  </div>
                  <button onClick={() => {
                    const newEmps = [...employees];
                    const idx = newEmps.findIndex(x => x.id === emp.id);
                    newEmps[idx] = { ...newEmps[idx], absent: !newEmps[idx].absent };
                    setEmployees(newEmps);
                    showToast(newEmps[idx].absent ? `${emp.name} סומן כנעדר` : `${emp.name} סומן כנוכח`);
                  }}
                    style={{ padding: "6px 14px", borderRadius: 8, border: emp.absent ? "2px solid #ef4444" : "1px solid #e5e7eb", background: emp.absent ? "#fef2f2" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: emp.absent ? "#dc2626" : "#374151" }}>
                    {emp.absent ? "נעדר" : "נוכח"}
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => { showToast("חישוב מחדש הופעל"); runOptimization(); }}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#0ea5e9", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 16 }}>
              חישוב מחדש מסלולים
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── EMPLOYEE VIEW ───
  const EmployeeView = () => {
    const myEmployee = employees[0];
    const myRoute = routes.find(r => r.employees.includes(myEmployee.id));
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>שלום, {myEmployee.name}</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>פרטי ההסעה שלך להיום</p>
        </div>

        {myRoute ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="bus" size={26} className="" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#111827" }}>{myRoute.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>סטטוס: {myRoute.status}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  ["שעת איסוף", myRoute.stops.find(s => s.name === myEmployee.name)?.eta || "07:10"],
                  ["שעת הגעה", "07:45"],
                  ["נהג", myRoute.driver],
                  ["רכב", myRoute.vehicle],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: "14px 16px", background: "#f9fafb", borderRadius: 10 }}>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{v}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", margin: "0 0 10px" }}>נקודות עצירה</h3>
              {myRoute.stops.slice(0, 6).map((stop, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6", opacity: stop.name === myEmployee.name ? 1 : 0.6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: stop.name === myEmployee.name ? "#0ea5e9" : "#e5e7eb", color: stop.name === myEmployee.name ? "#fff" : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{stop.order}</div>
                  <div style={{ flex: 1, fontWeight: stop.name === myEmployee.name ? 700 : 500, fontSize: 13 }}>{stop.name} {stop.name === myEmployee.name && <span style={{ color: "#0ea5e9" }}>(אתה)</span>}</div>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{stop.eta}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>עדכון שעות נוספות</h2>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>בחר שעת סיום עבודה (ניתן לעדכן עד 12:00)</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => { const n = [...employees]; n[0] = { ...n[0], overtime: false, overtimeUpdated: true }; setEmployees(n); showToast("סיום ב-16:00 נשמר"); }}
                    style={{ flex: 1, padding: "16px", borderRadius: 12, border: !myEmployee.overtime ? "3px solid #0ea5e9" : "2px solid #e5e7eb", background: !myEmployee.overtime ? "#dbeafe" : "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer", color: !myEmployee.overtime ? "#1d4ed8" : "#374151" }}>
                    16:00
                  </button>
                  <button onClick={() => { const n = [...employees]; n[0] = { ...n[0], overtime: true, overtimeUpdated: true }; setEmployees(n); showToast("שעות נוספות עד 18:00 נשמרו"); }}
                    style={{ flex: 1, padding: "16px", borderRadius: 12, border: myEmployee.overtime ? "3px solid #8b5cf6" : "2px solid #e5e7eb", background: myEmployee.overtime ? "#ede9fe" : "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer", color: myEmployee.overtime ? "#6d28d9" : "#374151" }}>
                    18:00
                  </button>
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>פידבק על הנסיעה</h2>
                <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setFeedbackScore(s)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: s <= feedbackScore ? "#f59e0b" : "#d1d5db", transition: "all 0.15s", transform: s <= feedbackScore ? "scale(1.2)" : "scale(1)" }}>
                      <Icon name={s <= feedbackScore ? "star" : "starEmpty"} size={32} />
                    </button>
                  ))}
                </div>
                <textarea placeholder="הערות נוספות (אופציונלי)..." rows={3}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, resize: "none", boxSizing: "border-box" }} />
                <button onClick={() => { showToast("תודה על הפידבק!"); setFeedbackScore(0); }}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: feedbackScore > 0 ? "#0ea5e9" : "#e5e7eb", color: feedbackScore > 0 ? "#fff" : "#9ca3af", fontWeight: 700, fontSize: 14, cursor: feedbackScore > 0 ? "pointer" : "default", marginTop: 10 }}>
                  שלח פידבק
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" }}>
            <Icon name="bus" size={48} className="" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "16px 0 8px" }}>אין הסעה משובצת</h2>
            <p style={{ fontSize: 14, color: "#6b7280" }}>הפעל אופטימיזציה בלוח הבקרה כדי ליצור מסלולים</p>
          </div>
        )}
      </div>
    );
  };

  // ─── DRIVER VIEW ───
  const DriverView = () => {
    const myRoute = routes[0];
    const [checkedPassengers, setCheckedPassengers] = useState({});
    if (!myRoute) return (
      <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" }}>
        <Icon name="truck" size={48} />
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "16px 0 8px" }}>אין מסלול משובץ</h2>
        <p style={{ fontSize: 14, color: "#6b7280" }}>הפעל אופטימיזציה בלוח הבקרה</p>
      </div>
    );
    const checked = Object.values(checkedPassengers).filter(Boolean).length;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>שלום, {myRoute.driver}</h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>{myRoute.name} — {myRoute.vehicle}</p>
          </div>
          <button style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="map" size={18} /> נווט ב-Waze
          </button>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <KpiCard label="נוסעים" value={`${myRoute.employees.length}`} sub={`${checked} עלו`} color="#0ea5e9" icon="user" />
          <KpiCard label="נקודות עצירה" value={myRoute.stops.length} color="#8b5cf6" icon="map" />
          <KpiCard label="זמן מסלול" value={`${myRoute.duration} דק׳`} color="#f59e0b" icon="clock" />
          <KpiCard label="מרחק" value={`${myRoute.distance} ק״מ`} color="#059669" icon="route" />
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>רשימת נוסעים ונקודות עצירה</h2>
          {myRoute.stops.map((stop, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, marginBottom: 8, background: checkedPassengers[stop.name] === true ? "#ecfdf5" : checkedPassengers[stop.name] === false ? "#fef2f2" : "#f9fafb", border: `1px solid ${checkedPassengers[stop.name] === true ? "#a7f3d0" : checkedPassengers[stop.name] === false ? "#fecaca" : "#e5e7eb"}`, transition: "all 0.2s" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0ea5e9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{stop.order}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{stop.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{stop.address} • ETA: {stop.eta}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setCheckedPassengers(p => ({ ...p, [stop.name]: true }))}
                  style={{ padding: "8px 16px", borderRadius: 8, border: checkedPassengers[stop.name] === true ? "2px solid #059669" : "1px solid #d1d5db", background: checkedPassengers[stop.name] === true ? "#d1fae5" : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", color: checkedPassengers[stop.name] === true ? "#059669" : "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="check" size={16} /> עלה
                </button>
                <button onClick={() => setCheckedPassengers(p => ({ ...p, [stop.name]: false }))}
                  style={{ padding: "8px 16px", borderRadius: 8, border: checkedPassengers[stop.name] === false ? "2px solid #dc2626" : "1px solid #d1d5db", background: checkedPassengers[stop.name] === false ? "#fee2e2" : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", color: checkedPassengers[stop.name] === false ? "#dc2626" : "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="x" size={16} /> לא עלה
                </button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: "14px 16px", background: "#f0f9ff", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: "#0c4a6e" }}>סיכום: {checked}/{myRoute.stops.length} נוסעים עלו</span>
            <span style={{ fontWeight: 700, color: "#0ea5e9" }}>{myRoute.stops.length > 0 ? Math.round((checked / myRoute.stops.length) * 100) : 0}% נוכחות</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── SETTINGS VIEW ───
  const SettingsView = () => (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 24px" }}>הגדרות מערכת</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 20px" }}>פרמטרי אופטימיזציה</h2>
          {[
            { label: "סף זמן נסיעה מקסימלי", value: "60 דקות", range: "30–90" },
            { label: "סף תפוסה מינימלית", value: "60%", range: "40–90%" },
            { label: "סף עיקוף מקסימלי", value: "20%", range: "10–40%" },
            { label: "משקל עלות", value: "40%", range: "0–100%" },
            { label: "משקל זמן נסיעה", value: "30%", range: "0–100%" },
            { label: "משקל שביעות רצון", value: "20%", range: "0–100%" },
            { label: "משקל ניצולת", value: "10%", range: "0–100%" },
          ].map((param, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{param.label}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>טווח: {param.range}</div>
              </div>
              <div style={{ padding: "6px 16px", background: "#f0f9ff", borderRadius: 8, fontWeight: 700, color: "#0c4a6e", fontSize: 14 }}>{param.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px #0001", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 20px" }}>צי רכבים</h2>
          {VEHICLES.map((v) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="bus" size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{v.type}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{v.capacity} מקומות • נוחות: {"★".repeat(v.comfort)}{"☆".repeat(5 - v.comfort)}</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>₪{v.fixedCost}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>+ ₪{v.costPerKm}/ק״מ</div>
              </div>
            </div>
          ))}

          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "24px 0 16px" }}>אינטגרציות</h2>
          {[
            { name: "ERP ארגוני", status: "מחובר", type: "דו-כיוונית" },
            { name: "Google Maps API", status: "מחובר", type: "חד-כיוונית" },
            { name: "Waze API", status: "לא פעיל", type: "חד-כיוונית" },
          ].map((int, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{int.name}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{int.type}</div>
              </div>
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: int.status === "מחובר" ? "#ecfdf5" : "#f3f4f6", color: int.status === "מחובר" ? "#059669" : "#9ca3af" }}>{int.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const views = { dashboard: DashboardView, weekly: WeeklyView, daily: DailyView, employee: EmployeeView, driver: DriverView, settings: SettingsView };
  const ActiveComponent = views[activeView];

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", background: "#f5f6f8", minHeight: "100vh", display: "flex" }}>
      <Sidebar />
      <div style={{ marginRight: 240, flex: 1, padding: "28px 32px", minHeight: "100vh" }}>
        <ActiveComponent />
      </div>

      {optimizing && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "40px 50px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "4px solid #e5e7eb", borderTopColor: "#0ea5e9", margin: "0 auto 20px", animation: "spin 1s linear infinite" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>מחשב מסלולים אופטימליים...</h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>קלאסטרינג גיאוגרפי → אילוצי מרחק → התאמת רכב → TSP</p>
          </div>
        </div>
      )}

      {toastMsg && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#111827", color: "#fff", padding: "14px 28px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.2)", zIndex: 200, display: "flex", alignItems: "center", gap: 10, animation: "slideUp 0.3s ease" }}>
          <Icon name="check" size={18} />
          {toastMsg}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        select { font-family: inherit; }
        textarea { font-family: inherit; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}
