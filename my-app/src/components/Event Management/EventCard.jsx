/**
 * EventCard - a compact, reusable event card component.
 * Props:
 *   - event: { id, title, date, location, image, description, attendeesCount, status }
 *   - onEdit, onDelete, onRegister: optional callbacks
 *
 * Usage: <EventCard event={e} onRegister={handle} onEdit={...} onDelete={...} />
 */

const styles = {
    card: {
        display: "flex",
        flexDirection: "row",
        gap: 16,
        padding: 16,
        borderRadius: 8,
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
        background: "#fff",
        alignItems: "stretch",
        maxWidth: 820,
        margin: "8px 0",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    },
    image: {
        width: 160,
        height: 110,
        objectFit: "cover",
        borderRadius: 6,
        flexShrink: 0,
        background: "#f0f0f0",
    },
    content: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        margin: 0,
        color: "#111827",
    },
    meta: {
        fontSize: 13,
        color: "#6b7280",
    },
    description: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 1.35,
        margin: 0,
    },
    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginTop: 6,
    },
    leftGroup: {
        display: "flex",
        gap: 8,
        alignItems: "center",
    },
    badge: {
        padding: "4px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: "#fff",
    },
    button: {
        padding: "8px 12px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontSize: 14,
    },
    ghostButton: {
        background: "transparent",
        border: "1px solid #e5e7eb",
        color: "#111827",
    },
    primaryButton: {
        background: "#0369a1",
        color: "#fff",
    },
    smallIconBtn: {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "#6b7280",
        padding: 6,
    },
};

/* small helper to convert status to color */
function statusColor(status) {
    switch ((status || "").toLowerCase()) {
        case "ongoing":
            return "#059669"; // green
        case "upcoming":
            return "#0ea5e9"; // blue
        case "past":
            return "#6b7280"; // gray
        case "cancelled":
            return "#ef4444"; // red
        default:
            return "#6b7280";
    }
}

export default function EventCard({ event, onEdit, onDelete, onRegister }) {
    const [expanded, setExpanded] = useState(false);
    const ev = event || {};
    const dateObj = ev.date ? new Date(ev.date) : null;
    const dateLabel = dateObj
        ? dateObj.toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            })
        : "TBA";

    const isPast = (ev.status || "").toLowerCase() === "past";

    const description = ev.description || "";
    const shortDesc = description.length > 160 ? description.slice(0, 160) + "…" : description;

    return (
        <div style={styles.card} role="article" aria-labelledby={`event-title-${ev.id || ""}`}>
            {ev.image ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={ev.image} alt={ev.title || "Event image"} style={styles.image} />
            ) : (
                <div
                    style={{
                        ...styles.image,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: 13,
                    }}
                    aria-hidden="true"
                >
                    No image
                </div>
            )}

            <div style={styles.content}>
                <div style={styles.headerRow}>
                    <div>
                        <h3 id={`event-title-${ev.id || ""}`} style={styles.title}>
                            {ev.title || "Untitled event"}
                        </h3>
                        <div style={styles.meta}>
                            {dateLabel} • {ev.location || "Location TBA"}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <div
                            style={{
                                ...styles.badge,
                                background: statusColor(ev.status),
                            }}
                            aria-label={`Status: ${ev.status || "unknown"}`}
                        >
                            {(ev.status || "Unknown").toUpperCase()}
                        </div>

                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {typeof onEdit === "function" && (
                                <button
                                    onClick={() => onEdit(ev)}
                                    title="Edit"
                                    aria-label="Edit event"
                                    style={styles.smallIconBtn}
                                >
                                    ✏️
                                </button>
                            )}
                            {typeof onDelete === "function" && (
                                <button
                                    onClick={() => onDelete(ev)}
                                    title="Delete"
                                    aria-label="Delete event"
                                    style={styles.smallIconBtn}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <p style={styles.description}>
                    {expanded ? description || "No description provided." : shortDesc || "No description provided."}
                    {description.length > 160 && (
                        <button
                            onClick={() => setExpanded((s) => !s)}
                            style={{ marginLeft: 8, ...styles.ghostButton, ...styles.button }}
                            aria-expanded={expanded}
                        >
                            {expanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </p>

                <div style={styles.footer}>
                    <div style={styles.leftGroup}>
                        <div style={styles.meta}>
                            👥 {typeof ev.attendeesCount === "number" ? ev.attendeesCount : "—"} going
                        </div>
                        <div style={{ width: 1, height: 18, background: "#e5e7eb", marginLeft: 8, marginRight: 8 }} />
                        <div style={styles.meta}>{ev.category || ""}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={() => onRegister && onRegister(ev)}
                            disabled={isPast || typeof onRegister !== "function"}
                            style={{
                                ...styles.button,
                                ...(isPast || typeof onRegister !== "function" ? styles.ghostButton : styles.primaryButton),
                                opacity: isPast ? 0.6 : 1,
                            }}
                            aria-disabled={isPast || typeof onRegister !== "function"}
                        >
                            {isPast ? "Event Ended" : "Register"}
                        </button>

                        <button
                            onClick={() => window.alert("Share link copied")}
                            title="Share"
                            aria-label="Share event"
                            style={{ ...styles.button, ...styles.ghostButton }}
                        >
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

EventCard.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        location: PropTypes.string,
        image: PropTypes.string,
        description: PropTypes.string,
        attendeesCount: PropTypes.number,
        status: PropTypes.string,
        category: PropTypes.string,
    }),
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onRegister: PropTypes.func,
};

EventCard.defaultProps = {
    event: {},
    onEdit: undefined,
    onDelete: undefined,
    onRegister: undefined,
};