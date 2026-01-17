import React, { useEffect, useState, useRef, useMemo, useContext } from "react";

const CAL_STORAGE = "calender_view_events_v1";

/* --- Date utility functions --- */
function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatMonthYear(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/* --- Card Component --- */
function Card({ children }) {
  return (
    <div style={{ 
      background: 'var(--surface)', 
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease'
    }}>
      {children}
    </div>
  );
}

/* --- Main Content Component --- */
function MainContent({ sampleTodos, theme, openModal }) {
  const [todos, setTodos] = useState(sampleTodos);
  const [newTodo, setNewTodo] = useState('');

  function addTodo() {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
    setNewTodo('');
  }

  function toggleTodo(id) {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTodo(id) {
    setTodos(todos.filter(t => t.id !== id));
  }

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(8, 145, 178, 0.08) 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '2.5rem' }}>Welcome to Dashboard</h1>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-light)', fontSize: '1.05rem' }}>Manage your events, vendors, and bookings in one place</p>
          </div>
          <button onClick={() => openModal('about')} style={{ background: 'var(--secondary)', fontWeight: 600, padding: '0.875rem 1.5rem', fontSize: '1rem' }}>Learn About Sheline</button>
        </div>
      </div>
      
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Quick Tasks</h3>
        <Card>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <input 
              value={newTodo} 
              onChange={(e) => setNewTodo(e.target.value)} 
              placeholder="Add a task..." 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                borderRadius: 'var(--radius)', 
                border: '1px solid var(--border)',
                fontSize: '0.95rem'
              }} 
            />
            <button onClick={addTodo}>Add Task</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {todos.map(todo => (
              <div key={todo.id} style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                padding: '0.875rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius)',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                borderLeft: todo.done ? '3px solid var(--success)' : '3px solid transparent'
              }}>
                <input 
                  type="checkbox" 
                  checked={todo.done} 
                  onChange={() => toggleTodo(todo.id)}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
                <span style={{ 
                  flex: 1, 
                  textDecoration: todo.done ? 'line-through' : 'none', 
                  opacity: todo.done ? 0.6 : 1,
                  fontSize: '0.95rem'
                }}>
                  {todo.text}
                </span>
                <button 
                  onClick={() => deleteTodo(todo.id)} 
                  className="danger"
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    fontSize: '0.85rem'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <CalenderView />
    </div>
  );
}

/* --- Auth Context --- */
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

/* --- Modal Component --- */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.6)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{ 
        background: 'var(--surface)', 
        color: 'var(--text)', 
        borderRadius: '0.875rem', 
        padding: '2rem', 
        width: 'auto', 
        maxWidth: '600px',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px rgba(0,0,0,0.15), 0 8px 10px rgba(0,0,0,0.1)',
        border: '1px solid var(--border)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>{title}</h2>
          <button onClick={onClose} style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem', 
            cursor: 'pointer',
            color: 'var(--text-light)',
            transition: 'color 0.2s'
          }} onMouseOver={(e) => e.target.style.color = 'var(--text)'} onMouseOut={(e) => e.target.style.color = 'var(--text-light)'}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* --- About Component --- */
function AboutComponent() {
  const features = [
    { icon: '📅', title: 'Event Management', desc: 'Create and manage events effortlessly' },
    { icon: '🤝', title: 'Vendor Coordination', desc: 'Connect with and manage vendors' },
    { icon: '📊', title: 'Booking System', desc: 'Streamlined booking and reservations' },
    { icon: '🔐', title: 'Secure Auth', desc: 'JWT-based authentication' },
    { icon: '📱', title: 'Responsive Design', desc: 'Works on all devices' },
    { icon: '⚡', title: 'Fast & Reliable', desc: 'Built with modern tech stack' },
  ];

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>Welcome to Sheline</h3>
        <p style={{ margin: 0, opacity: 0.95, fontSize: '1.05rem' }}>Your complete event management solution</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>About Us</h4>
        <p style={{ lineHeight: '1.8', color: 'var(--text)', margin: '0 0 1rem 0' }}>
          Sheline is a modern, full-stack event management platform designed to simplify the entire event lifecycle. From planning to execution, we provide intuitive tools for managing events, coordinating with vendors, and processing bookings—all in one place.
        </p>
        <p style={{ lineHeight: '1.8', color: 'var(--text)', margin: 0 }}>
          Built with React, Python/Flask, and PostgreSQL, our platform delivers a seamless experience with real-time updates and secure authentication.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Key Features</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          {features.map((f, i) => (
            <div 
              key={i} 
              style={{ 
                background: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Tech Stack</h4>
        <div style={{ 
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.95rem' }}>Frontend</h5>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem', color: 'var(--text)' }}>
                <li style={{ marginBottom: '0.25rem' }}>React 18</li>
                <li style={{ marginBottom: '0.25rem' }}>Vite</li>
                <li>Modern CSS3</li>
              </ul>
            </div>
            <div>
              <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.95rem' }}>Backend</h5>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem', color: 'var(--text)' }}>
                <li style={{ marginBottom: '0.25rem' }}>Flask</li>
                <li style={{ marginBottom: '0.25rem' }}>SQLAlchemy</li>
                <li>PostgreSQL/SQLite</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Get Started</h4>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)'
        }}>
          <p style={{ margin: '0 0 1rem 0', color: 'var(--text)', lineHeight: '1.6' }}>
            Visit our GitHub repository for documentation, API guides, and deployment instructions.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'background 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-dark)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary)'}>GitHub</a>
            <a href="mailto:team@sheline.app" style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: 'var(--secondary)',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'background 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.background = '#0a7ba0'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--secondary)'}>Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Auth Context --- */

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
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 16 
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <Login onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ fontFamily: "var(--ui-sans)", color: 'var(--text)', background: 'var(--bg)' }}>
      <CoreLayout>
        <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <MainContent sampleTodos={sampleTodos} theme={theme} openModal={openModal} />
          </div>
        </div>
      </CoreLayout>

      <Modal open={modal.open && modal.key === "about"} onClose={closeModal} title="About Sheline">
        <AboutComponent />
      </Modal>

      <Modal open={modal.open && modal.key === "contact"} onClose={closeModal} title="Message sent">
        <p style={{ marginTop: 0 }}>Thank you, {modal.payload?.name}! We'll reply to {modal.payload?.email} soon.</p>
      </Modal>
    </div>
  );
}