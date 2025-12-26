import React, { useEffect, useState, useRef } from "react";

/**
 * App.jsx
 * Single-file React app with several example components:
 * - Header (with Nav and ThemeToggle)
 * - Sidebar
 * - Main (with TodoList, Cards, ContactForm)
 * - Modal
 * - Footer
 *
 * Drop this file into src/App.jsx of a create-react-app / Vite React project.
 */

/* Simple small CSS-in-JS styles used throughout */
const styles = {
  app: (theme) => ({
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    color: theme === "dark" ? "#e6eef8" : "#0f172a",
    background: theme === "dark" ? "#0b1220" : "#f7fbff",
    minHeight: "100vh",
    padding: 16,
    boxSizing: "border-box",
  }),
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 16,
    alignItems: "start",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nav: {
    display: "flex",
    gap: 8,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 12,
    marginTop: 12,
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    opacity: 0.8,
    fontSize: 13,
  },
  sidebar: {
    position: "sticky",
    top: 16,
  },
  input: (theme) => ({
    padding: "8px 10px",
    fontSize: 14,
    borderRadius: 8,
    border: theme === "dark" ? "1px solid #24314a" : "1px solid #cbd5e1",
    background: theme === "dark" ? "#071022" : "#fff",
    color: theme === "dark" ? "#e6eef8" : "#0f172a",
    width: "100%",
    boxSizing: "border-box",
  }),
  button: (variant = "primary") => {
    const base = {
      padding: "8px 12px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
    };
    if (variant === "primary")
      return { ...base, background: "#2563eb", color: "white" };
    if (variant === "ghost")
      return { ...base, background: "transparent", color: "#2563eb", border: "1px solid #cfe0ff" };
    return base;
  },
};

/* Header: title, nav links and theme toggle */
function Header({ theme, onToggleTheme, openModal }) {
  return (
    <header style={styles.header}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>Sheline UI — Example App</h1>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Small collection of components</div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <nav style={styles.nav}>
          <Nav />
        </nav>

        <button
          onClick={() => onToggleTheme()}
          aria-label="Toggle theme"
          title="Toggle theme"
          style={styles.button("ghost")}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        <button onClick={() => openModal("about")} style={styles.button()}>
          About
        </button>
      </div>
    </header>
  );
}

/* Simple Nav links (no router) */
function Nav() {
  return (
    <>
      <a href="#todos" style={{ textDecoration: "none", color: "inherit", padding: 6 }}>
        Todos
      </a>
      <a href="#cards" style={{ textDecoration: "none", color: "inherit", padding: 6 }}>
        Cards
      </a>
      <a href="#contact" style={{ textDecoration: "none", color: "inherit", padding: 6 }}>
        Contact
      </a>
    </>
  );
}

/* Sidebar with quick stats */
function Sidebar({ todos }) {
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  return (
    <aside style={styles.sidebar}>
      <div style={{ marginBottom: 12 }}>
        <Card title="Quick Stats">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{total}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Todos</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{done}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Done</div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Card title="Shortcuts">
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>Press Enter to add todo</li>
            <li>Toggle theme to see styles</li>
            <li>Click About for modal</li>
          </ul>
        </Card>
      </div>
    </aside>
  );
}

/* Generic Card component */
function Card({ title, children }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
        borderRadius: 10,
        padding: 12,
        boxShadow: "0 6px 18px rgba(11,18,30,0.06)",
      }}
    >
      {title && <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>}
      <div>{children}</div>
    </div>
  );
}

/* TodoList component with add/toggle/delete and localStorage */
function TodoList({ initial = [], theme }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("todos_v1");
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  const [text, setText] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    localStorage.setItem("todos_v1", JSON.stringify(items));
  }, [items]);

  function addTodo(ev) {
    ev && ev.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setItems((s) => [{ id: Date.now(), text: trimmed, done: false }, ...s]);
    setText("");
    inputRef.current?.focus();
  }

  function toggle(id) {
    setItems((s) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id) {
    setItems((s) => s.filter((t) => t.id !== id));
  }

  return (
    <section id="todos">
      <h2 style={{ marginTop: 0 }}>Todos</h2>
      <form onSubmit={addTodo} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a todo and press Enter"
          style={styles.input(theme)}
        />
        <button type="submit" style={styles.button()}>
          Add
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.length === 0 && <div style={{ opacity: 0.7 }}>No todos yet.</div>}
        {items.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 8,
              borderRadius: 8,
              background: theme === "dark" ? "#071828" : "#fff",
              border: theme === "dark" ? "1px solid #122235" : "1px solid #e6eef8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                aria-label={`Mark ${t.text} as done`}
              />
              <div style={{ textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.6 : 1 }}>
                {t.text}
              </div>
            </div>
            <div>
              <button onClick={() => remove(t.id)} style={styles.button("ghost")}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Contact form that shows a modal on submit */
function ContactForm({ openModal, theme }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.message.trim()) e.message = "Message required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    openModal("contact", { ...form });
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <section id="contact" style={{ marginTop: 16 }}>
      <h2>Contact</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <input
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="Name"
          style={styles.input(theme)}
        />
        {errors.name && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.name}</div>}

        <input
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          placeholder="Email"
          style={styles.input(theme)}
        />
        {errors.email && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.email}</div>}

        <textarea
          value={form.message}
          onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
          placeholder="Message"
          rows={4}
          style={{ ...styles.input(theme), resize: "vertical" }}
        />
        {errors.message && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.message}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={styles.button()}>
            Send
          </button>
          <button type="button" style={styles.button("ghost")} onClick={() => setForm({ name: "", email: "", message: "" })}>
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

/* Modal component */
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          color: "#071022",
          borderRadius: 12,
          maxWidth: 720,
          width: "100%",
          padding: 18,
          boxShadow: "0 12px 40px rgba(2,6,23,0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={styles.button("ghost")}>
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* Main app */
export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme_v1") || "light";
    } catch {
      return "light";
    }
  });

  const [modal, setModal] = useState({ open: false, key: null, payload: null });
  const sampleTodos = [
    { id: 1, text: "Buy groceries", done: false },
    { id: 2, text: "Read React docs", done: true },
  ];

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
    <div style={styles.app(theme)}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          openModal={openModal}
        />
      </div>

      <div style={styles.container}>
        <main>
          <Card>
            <MainContent sampleTodos={sampleTodos} theme={theme} openModal={openModal} />
          </Card>

          <div style={styles.footer}>
            <Footer />
          </div>
        </main>

        <Sidebar todos={sampleTodos} />
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

/* Main content area assembled from components */
function MainContent({ sampleTodos, theme, openModal }) {
  return (
    <div>
      <TodoList initial={sampleTodos} theme={theme} />

      <section id="cards" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 12 }}>Cards</h2>
        <div style={styles.cardGrid}>
          <Card title="Design">
            Create consistent components and keep props small.
          </Card>
          <Card title="Accessibility">
            Use proper roles and keyboard handlers.
          </Card>
          <Card title="Performance">
            Keep state minimal and memoize where needed.
          </Card>
        </div>
      </section>

      <ContactForm openModal={openModal} theme={theme} />
    </div>
  );
}

/* Footer */
function Footer() {
  return (
    <div>
      <div>© {new Date().getFullYear()} Sheline — Demo</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Built with React — single-file components example</div>
    </div>
  );
}