import React from "react";
import PropTypes from "prop-types";

/**
 * ScheduleCard
 * A simple, reusable schedule / calendar card component.
 *
 * Props:
 * - title: string
 * - date: string (YYYY-MM-DD or any display text)
 * - startTime: string
 * - endTime: string
 * - description: string
 * - color: string (CSS color for accent)
 * - onEdit: function
 * - onDelete: function
 * - onClick: function
 * - compact: boolean (shows compact layout)
 */

const containerBase = {
    display: "flex",
    alignItems: "stretch",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    boxShadow: "0 1px 4px rgba(16,24,40,0.06)",
    background: "#fff",
    border: "1px solid rgba(16,24,40,0.05)",
    cursor: "default",
    userSelect: "none",
};

const leftStripStyle = (color) => ({
    width: 6,
    borderRadius: 4,
    background: color || "#4f46e5",
    flex: "0 0 6px",
});

const contentStyle = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
};

const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
};

const titleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const subtitleStyle = {
    fontSize: 12,
    color: "#475569",
};

const descStyle = {
    marginTop: 8,
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const actionsStyle = {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexShrink: 0,
};

const btnStyle = {
    padding: "6px 8px",
    fontSize: 12,
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "transparent",
};

function ScheduleCard({
    title,
    date,
    startTime,
    endTime,
    description,
    color,
    onEdit,
    onDelete,
    onClick,
    compact = false,
}) {
    const handleClick = (e) => {
        if (onClick) onClick(e);
    };

    return (
        <div
            style={{
                ...containerBase,
                padding: compact ? 8 : 12,
                cursor: onClick ? "pointer" : "default",
            }}
            onClick={handleClick}
            role={onClick ? "button" : undefined}
        >
            <div style={leftStripStyle(color)} aria-hidden />
            <div style={contentStyle}>
                <div style={rowStyle}>
                    <div style={{ minWidth: 0, marginRight: 8 }}>
                        <div style={titleStyle} title={title}>
                            {title || "Untitled"}
                        </div>
                        <div style={subtitleStyle}>
                            {date ? `${date} · ` : ""}
                            {startTime ? startTime : ""}
                            {endTime ? ` — ${endTime}` : ""}
                        </div>
                    </div>

                    <div style={actionsStyle} onClick={(e) => e.stopPropagation()}>
                        {onEdit && (
                            <button
                                style={{ ...btnStyle, color: "#0ea5a4" }}
                                onClick={onEdit}
                                aria-label="Edit"
                                title="Edit"
                            >
                                ✎
                            </button>
                        )}
                        {onDelete && (
                            <button
                                style={{ ...btnStyle, color: "#ef4444" }}
                                onClick={onDelete}
                                aria-label="Delete"
                                title="Delete"
                            >
                                🗑
                            </button>
                        )}
                    </div>
                </div>

                {!compact && description ? (
                    <div style={descStyle} title={description}>
                        {description}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

ScheduleCard.propTypes = {
    title: PropTypes.string,
    date: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    description: PropTypes.string,
    color: PropTypes.string,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onClick: PropTypes.func,
    compact: PropTypes.bool,
};

ScheduleCard.defaultProps = {
    title: "New Event",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    color: "#4f46e5",
    onEdit: null,
    onDelete: null,
    onClick: null,
    compact: false,
};

export default ScheduleCard;