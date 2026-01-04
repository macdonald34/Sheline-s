import React, { useEffect, useState, useRef, useMemo, useContext } from "react";

const CAL_STORAGE = "calender_view_events_v1";

/* --- AUTH (simple username-based) --- */
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user_v1"));
    } catch {
      return null;
    }
  });

  function login(username) {
    const u = { name: username };
    setUser(u);
    localStorage.setItem("user_v1", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user_v1");
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

function Login({ onSuccess }) {
  const [name, setName] = useState("");
  const { login } = useAuth();

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    login(name.trim());
    onSuccess?.();
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Sign in</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ padding: 8 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "8px 12px" }}>Sign in</button>
        </div>
      </form>
    </div>
  );
}

/* --- EVENTS (shared event-management for calendar) --- */
const EventsContext = React.createContext(null);

function EventsProvider({ children }) {
  const [events, setEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(CAL_STORAGE);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CAL_STORAGE, JSON.stringify(events));
    } catch {}
  }, [events]);

  function addEvent(dateKey, ev) {
    setEvents((prev) => {
      const day = [...(prev[dateKey] || [])];
      const item = { ...ev, id: ev.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
      day.push(item);
      day.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
      return { ...prev, [dateKey]: day };
    });
  }

  function updateEvent(dateKey, ev) {
    setEvents((prev) => {
      const day = [...(prev[dateKey] || [])];
      const idx = day.findIndex((d) => d.id === ev.id);
      if (idx >= 0) day[idx] = ev;
      else day.push(ev);
      day.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
      return { ...prev, [dateKey]: day };
    });
  }

  function deleteEvent(dateKey, id) {
    setEvents((prev) => {
      const day = (prev[dateKey] || []).filter((d) => d.id !== id);
      const next = { ...prev };
      if (day.length) next[dateKey] = day;
      else delete next[dateKey];
      return next;
    });
  }

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

function useEvents() {
  return useContext(EventsContext);
}

/* --- CORE LAYOUT wrapper (Header/Footer/Sidebar placement) --- */
function CoreLayout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Sheline</h1>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Welcome, {user?.name}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={logout} style={{ padding: "8px 10px" }}>Sign out</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        <main>{children}</main>
        <aside style={{ position: "sticky", top: 16 }}>
          {/* lightweight right column - keep existing Sidebar content if needed */}
          <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>Core Sidebar</div>
        </aside>
      </div>

      <footer style={{ marginTop: 24, textAlign: "center", opacity: 0.8 }}>
        © {new Date().getFullYear()} Sheline
      </footer>
    </div>
  );
}

/* --- Replace CalenderView to use EventsContext --- */
function CalenderView() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorData, setEditorData] = useState({ id: null, date: formatDateKey(new Date()), title: "", time: "09:00", notes: "" });

  const weeks = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const last = endOfMonth(currentMonth);
    const startWeekDay = first.getDay();
    const daysInMonth = last.getDate();
    const matrix = [];
    let week = [];
    for (let i = 0; i < startWeekDay; i++) week.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
      if (week.length === 7) {
        matrix.push(week);
        week = [];
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      matrix.push(week);
    }
    return matrix;
  }, [currentMonth]);

  function openEditorFor(date, event = null) {
    setEditorData({
      id: event ? event.id : null,
      date: formatDateKey(date),
      title: event ? event.title : "",
      time: event ? event.time : "09:00",
      notes: event ? event.notes : "",
    });
    setIsEditorOpen(true);
  }

  function saveEditor() {
    const { id, date, title, time, notes } = editorData;
    if (!title?.trim()) {
      alert("Title required");
      return;
    }
    const payload = { id, title: title.trim(), time, notes: notes || "" };
    if (id) updateEvent(date, payload);
    else addEvent(date, payload);
    setIsEditorOpen(false);
  }

  function handleDelete(dateKey, id) {
    if (!window.confirm("Delete this event?")) return;
    deleteEvent(dateKey, id);
  }

  function gotoToday() {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    setSelectedDate(today);
  }

  const stylesCal = {
    container: { display: "flex", gap: 20, padding: 12, fontFamily: "inherit" },
    calendar: { flex: "1 1 0", background: "#fff", borderRadius: 8, padding: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 },
    dayCell: (isToday, isSelected) => ({
      minHeight: 84,
      borderRadius: 6,
      padding: 8,
      background: isSelected ? "#0b5cff22" : "#f9f9fb",
      border: isToday ? "1px solid #0b5cff44" : "1px solid transparent",
      cursor: "pointer",
      position: "relative",
    }),
    dayNumber: { fontSize: 13, fontWeight: 600, marginBottom: 6 },
    smallCount: { position: "absolute", top: 8, right: 8, fontSize: 11, background: "#0b5cff", color: "#fff", padding: "2px 6px", borderRadius: 999 },
    schedule: { width: 320, background: "#fff", borderRadius: 8, padding: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
    eventItem: { padding: 8, borderRadius: 6, background: "#f4f7ff", marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 8 },
    modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { width: 420, background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.24)" },
    input: { width: "100%", padding: 8, fontSize: 14, marginBottom: 8, borderRadius: 6, border: "1px solid #e6e9ef" },
    actions: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 },
    btn: (primary) => ({ padding: "8px 10px", borderRadius: 6, cursor: "pointer", border: "none", background: primary ? "#0b5cff" : "#f1f3f7", color: primary ? "#fff" : "#111" }),
  };

  const selectedKey = formatDateKey(selectedDate);
  const selectedEvents = events[selectedKey] || [];

  return (
    <section id="calendar" style={{ marginTop: 18 }}>
      <h2 style={{ marginTop: 12 }}>Calendar</h2>
      <div style={stylesCal.container}>
        <div style={stylesCal.calendar}>
          <div style={stylesCal.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{formatMonthYear(currentMonth)}</div>
              <div style={{ color: "#666", fontSize: 13 }}>{selectedDate.toLocaleDateString()}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={stylesCal.btn(false)} onClick={() => setCurrentMonth((m) => addMonths(m, -1))}>◀</button>
              <button style={stylesCal.btn(false)} onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>▶</button>
              <button style={stylesCal.btn(false)} onClick={gotoToday}>Today</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#666" }}>{d}</div>
            ))}
          </div>

          <div style={stylesCal.grid}>
            {weeks.flat().map((day, idx) => {
              if (!day) return <div key={idx} style={{ minHeight: 84, borderRadius: 6, background: "#fafafa" }} />;
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const key = formatDateKey(day);
              const dayEvents = events[key] || [];
              return (
                <div
                  key={key}
                  style={stylesCal.dayCell(isToday, isSelected)}
                  onClick={() => setSelectedDate(day)}
                  onDoubleClick={() => openEditorFor(day)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSelectedDate(day);
                    if (e.key === " ") openEditorFor(day);
                  }}
                  title={day.toDateString()}
                >
                  <div style={stylesCal.dayNumber}>{day.getDate()}</div>
                  {dayEvents.slice(0,3).map((ev) => (
                    <div key={ev.id} style={{ fontSize: 12, marginBottom: 4, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ev.time} • {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div style={{ fontSize: 11, color: "#666" }}>+{dayEvents.length - 3} more</div>}
                  {dayEvents.length > 0 && <div style={stylesCal.smallCount}>{dayEvents.length}</div>}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "#666", fontSize: 13 }}>Double-click a day to add an event.</div>
            <div>
              <button style={stylesCal.btn(true)} onClick={() => openEditorFor(selectedDate)}>+ Add Event</button>
            </div>
          </div>
        </div>

        <aside style={stylesCal.schedule} aria-label="Schedule">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{selectedEvents.length} event(s)</div>
            </div>
            <div>
              <button style={stylesCal.btn(false)} onClick={() => setSelectedDate((d) => addDays(d, -1))}>◀</button>
              <button style={stylesCal.btn(false)} onClick={() => setSelectedDate((d) => addDays(d, 1))}>▶</button>
            </div>
          </div>

          <div>
            {selectedEvents.length === 0 && <div style={{ color: "#666" }}>No events. Click "Add Event" to schedule something.</div>}
            {selectedEvents.map((ev) => (
              <div key={ev.id} style={stylesCal.eventItem}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{ev.title}</div>
                  <div style={{ fontSize: 13, color: "#444" }}>{ev.time}</div>
                  {ev.notes && <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{ev.notes}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button style={stylesCal.btn(false)} onClick={() => openEditorFor(selectedDate, ev)}>Edit</button>
                  <button style={stylesCal.btn(false)} onClick={() => handleDelete(selectedKey, ev.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {isEditorOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setIsEditorOpen(false)}>
            <div style={{ width: 420, background: "#fff", borderRadius: 8, padding: 16 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{editorData.id ? "Edit Event" : "New Event"}</div>
              <label>Date</label>
              <input type="date" value={editorData.date} onChange={(e) => setEditorData((s) => ({ ...s, date: e.target.value }))} style={{ width: "100%", padding: 8, marginBottom: 8 }} />
              <label>Time</label>
              <input type="time" value={editorData.time} onChange={(e) => setEditorData((s) => ({ ...s, time: e.target.value }))} style={{ width: "100%", padding: 8, marginBottom: 8 }} />
              <label>Title</label>
              <input type="text" value={editorData.title} onChange={(e) => setEditorData((s) => ({ ...s, title: e.target.value }))} style={{ width: "100%", padding: 8, marginBottom: 8 }} />
              <label>Notes</label>
              <textarea value={editorData.notes} onChange={(e) => setEditorData((s) => ({ ...s, notes: e.target.value }))} style={{ width: "100%", padding: 8, minHeight: 80 }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={() => setIsEditorOpen(false)} style={{ padding: "8px 10px" }}>Cancel</button>
                <button onClick={saveEditor} style={{ padding: "8px 10px", background: "#0b5cff", color: "#fff" }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* --- Wrap App with providers and require auth --- */
export default function App() {
  // ...existing App state (theme, modal etc.)...
  // replace top-level return with providers and auth gating
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme_v1") || "light";
    } catch {
      return "light";
    }
  });
  const [modal, setModal] = useState({ open: false, key: null, payload: null });

  useEffect(() => {
    localStorage.setItem("theme_v1", theme);
  }, [theme]);

  function openModal(key, payload = null) {
    setModal({ open: true, key, payload });
  }
  function closeModal() {
    setModal({ open: false, key: null, payload: null });
  }

  return (
    <AuthProvider>
      <EventsProvider>
        <AppInner theme={theme} setTheme={setTheme} modal={modal} openModal={openModal} closeModal={closeModal} />
      </EventsProvider>
    </AuthProvider>
  );
}

/* small wrapper that uses auth to gate UI */
function AppInner({ theme, setTheme, modal, openModal, closeModal }) {
  const { user } = useAuth();
  const sampleTodos = [
    { id: 1, text: "Buy groceries", done: false },
    { id: 2, text: "Read React docs", done: true },
  ];

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <Login onSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: theme === "dark" ? "#e6eef8" : "#0f172a", background: theme === "dark" ? "#0b1220" : "#f7fbff", minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <CoreLayout>
          <Card>
            <MainContent sampleTodos={sampleTodos} theme={theme} openModal={openModal} />
          </Card>
        </CoreLayout>
      </div>

      <Modal open={modal.open && modal.key === "about"} onClose={closeModal} title="About">
        <p style={{ marginTop: 0 }}>
          This is a small demo app showing multiple components in one file. Toggle theme, try the todo list, or submit
          the contact form.
        </p>
      </Modal>

      <Modal open={modal.open && modal.key === "contact"} onClose={closeModal} title="Message sent">
        <p style={{ marginTop: 0 }}>Thank you, {modal.payload?.name}! We'll reply to {modal.payload?.email} soon.</p>
      </Modal>
    </div>
  );
}