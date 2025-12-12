import React, { useState, useEffect, useMemo } from "react";

/**
 * CalenderView.jsx
 * A lightweight calendar + schedule component with localStorage persistence.
 *
 * Features:
 * - Month navigation (prev/next/today)
 * - Day selection
 * - Add / edit / delete events (stored in localStorage)
 * - Simple responsive layout (calendar left, schedule right)
 *
 * Drop this file into: src/components/Calender & Schedule/CalenderView.jsx
 */

const STORAGE_KEY = "calender_view_events_v1";

// Basic helpers for dates (no external libs)
function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function addMonths(date, n) {
    return new Date(date.getFullYear(), date.getMonth() + n, 1);
}
function isSameDay(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}
function formatMonthYear(date) {
    return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}
function formatDayLabel(date) {
    return date.toLocaleString(undefined, { weekday: "short" });
}
function formatDateKey(date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}
function parseTimeToMinutes(t) {
    // t like "09:30"
    const [hh = "0", mm = "0"] = (t || "").split(":");
    return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}

export default function CalenderView() {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorData, setEditorData] = useState({ id: null, date: formatDateKey(new Date()), title: "", time: "09:00", notes: "" });

    // Load events from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setEvents(JSON.parse(raw));
        } catch (e) {
            console.error("Failed to load events", e);
        }
    }, []);

    // Persist events
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch (e) {
            console.error("Failed to save events", e);
        }
    }, [events]);

    // Generate calendar matrix (weeks x days)
    const weeks = useMemo(() => {
        const first = startOfMonth(currentMonth);
        const last = endOfMonth(currentMonth);
        const startWeekDay = first.getDay(); // 0..6 (Sun..Sat)
        const daysInMonth = last.getDate();

        const matrix = [];
        let week = [];
        // Fill leading blanks
        for (let i = 0; i < startWeekDay; i++) week.push(null);

        for (let day = 1; day <= daysInMonth; day++) {
            week.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
            if (week.length === 7) {
                matrix.push(week);
                week = [];
            }
        }
        // Trailing blanks
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
            alert("Title is required");
            return;
        }
        const idToUse = id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setEvents((prev) => {
            const dayEvents = [...(prev[date] || [])];
            const item = { id: idToUse, title: title.trim(), time, notes: notes || "" };
            if (id) {
                const idx = dayEvents.findIndex((e) => e.id === id);
                if (idx >= 0) dayEvents[idx] = item;
                else dayEvents.push(item);
            } else {
                dayEvents.push(item);
            }
            // sort by time
            dayEvents.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
            return { ...prev, [date]: dayEvents };
        });
        setIsEditorOpen(false);
    }

    function deleteEvent(dateKey, id) {
        if (!window.confirm("Delete this event?")) return;
        setEvents((prev) => {
            const dayEvents = (prev[dateKey] || []).filter((e) => e.id !== id);
            const next = { ...prev };
            if (dayEvents.length) next[dateKey] = dayEvents;
            else delete next[dateKey];
            return next;
        });
    }

    function gotoToday() {
        const today = new Date();
        setCurrentMonth(startOfMonth(today));
        setSelectedDate(today);
    }

    // Basic styling - inline to keep single-file component
    const styles = {
        container: { display: "flex", gap: 20, padding: 16, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" },
        calendar: { flex: "1 1 0", background: "#fff", borderRadius: 8, padding: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
        navButtons: { display: "flex", gap: 8 },
        monthLabel: { fontSize: 18, fontWeight: 600 },
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
        weekdayRow: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 },
        schedule: { width: 360, background: "#fff", borderRadius: 8, padding: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" },
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
        <div style={styles.container}>
            <div style={styles.calendar}>
                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={styles.monthLabel}>{formatMonthYear(currentMonth)}</div>
                        <div style={{ color: "#666", fontSize: 13 }}>{selectedDate.toLocaleDateString()}</div>
                    </div>
                    <div style={styles.navButtons}>
                        <button style={styles.btn(false)} onClick={() => setCurrentMonth((m) => addMonths(m, -1))} aria-label="Previous month">
                            ◀
                        </button>
                        <button style={styles.btn(false)} onClick={() => setCurrentMonth((m) => addMonths(m, 1))} aria-label="Next month">
                            ▶
                        </button>
                        <button style={styles.btn(false)} onClick={gotoToday}>
                            Today
                        </button>
                    </div>
                </div>

                <div style={styles.weekdayRow}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#666" }}>
                            {d}
                        </div>
                    ))}
                </div>

                <div style={styles.grid}>
                    {weeks.flat().map((day, idx) => {
                        if (!day) {
                            return <div key={idx} style={{ minHeight: 84, borderRadius: 6, background: "#fafafa" }} />;
                        }
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, selectedDate);
                        const key = formatDateKey(day);
                        const dayEvents = events[key] || [];
                        return (
                            <div
                                key={key}
                                style={styles.dayCell(isToday, isSelected)}
                                onClick={() => {
                                    setSelectedDate(day);
                                }}
                                onDoubleClick={() => openEditorFor(day)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") setSelectedDate(day);
                                    if (e.key === " ") openEditorFor(day);
                                }}
                                title={day.toDateString()}
                            >
                                <div style={styles.dayNumber}>{day.getDate()}</div>
                                {dayEvents.slice(0, 3).map((ev) => (
                                    <div key={ev.id} style={{ fontSize: 12, marginBottom: 4, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {ev.time} • {ev.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && <div style={{ fontSize: 11, color: "#666" }}>+{dayEvents.length - 3} more</div>}
                                {dayEvents.length > 0 && <div style={styles.smallCount}>{dayEvents.length}</div>}
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
                    <div style={{ color: "#666", fontSize: 13 }}>Double-click a day to add an event.</div>
                    <div>
                        <button
                            style={styles.btn(true)}
                            onClick={() => openEditorFor(selectedDate)}
                            aria-label="Add event"
                        >
                            + Add Event
                        </button>
                    </div>
                </div>
            </div>

            <aside style={styles.schedule} aria-label="Schedule">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>{selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</div>
                        <div style={{ fontSize: 13, color: "#666" }}>{selectedEvents.length} event(s)</div>
                    </div>
                    <div>
                        <button style={styles.btn(false)} onClick={() => setSelectedDate((d) => addDays(d, -1))} aria-label="Previous day">
                            ◀
                        </button>
                        <button style={styles.btn(false)} onClick={() => setSelectedDate((d) => addDays(d, 1))} aria-label="Next day">
                            ▶
                        </button>
                    </div>
                </div>

                <div>
                    {selectedEvents.length === 0 && <div style={{ color: "#666" }}>No events. Click "Add Event" to schedule something.</div>}
                    {selectedEvents.map((ev) => (
                        <div key={ev.id} style={styles.eventItem}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{ev.title}</div>
                                <div style={{ fontSize: 13, color: "#444" }}>{ev.time}</div>
                                {ev.notes && <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{ev.notes}</div>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <button
                                    style={styles.btn(false)}
                                    onClick={() => openEditorFor(selectedDate, ev)}
                                    aria-label="Edit event"
                                >
                                    Edit
                                </button>
                                <button
                                    style={styles.btn(false)}
                                    onClick={() => deleteEvent(selectedKey, ev.id)}
                                    aria-label="Delete event"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {isEditorOpen && (
                <div style={styles.modalBackdrop} onClick={() => setIsEditorOpen(false)}>
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Event editor"
                    >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{editorData.id ? "Edit Event" : "New Event"}</div>
                        <label style={{ fontSize: 13, color: "#444" }}>Date</label>
                        <input
                            type="date"
                            style={styles.input}
                            value={editorData.date}
                            onChange={(e) => setEditorData((s) => ({ ...s, date: e.target.value }))}
                        />
                        <label style={{ fontSize: 13, color: "#444" }}>Time</label>
                        <input
                            type="time"
                            style={styles.input}
                            value={editorData.time}
                            onChange={(e) => setEditorData((s) => ({ ...s, time: e.target.value }))}
                        />
                        <label style={{ fontSize: 13, color: "#444" }}>Title</label>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="Event title"
                            value={editorData.title}
                            onChange={(e) => setEditorData((s) => ({ ...s, title: e.target.value }))}
                        />
                        <label style={{ fontSize: 13, color: "#444" }}>Notes</label>
                        <textarea
                            style={{ ...styles.input, minHeight: 80 }}
                            value={editorData.notes}
                            onChange={(e) => setEditorData((s) => ({ ...s, notes: e.target.value }))}
                        />
                        <div style={styles.actions}>
                            <button style={styles.btn(false)} onClick={() => setIsEditorOpen(false)}>
                                Cancel
                            </button>
                            <button
                                style={styles.btn(true)}
                                onClick={saveEditor}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// small util: add days (used for schedule navigation)
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}