import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Profile.jsx
 *
 * Simple, focused profile component suitable for an authentication area.
 * Props:
 *  - user: { id, name, email, avatarUrl }
 *  - onUpdate: async (updates: { name, email, avatarFile }) => Promise<void>
 *  - onLogout: () => void
 *
 * This component is intentionally generic so it can be wired to your auth logic.
 */

export default function Profile({ user, onUpdate, onLogout }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? "");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
        setAvatarPreview(user?.avatarUrl ?? "");
    }, [user]);

    function handleAvatarChange(e) {
        const file = e.target.files?.[0] ?? null;
        setAvatarFile(file);
        if (!file) {
            setAvatarPreview(user?.avatarUrl ?? "");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(String(reader.result));
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!onUpdate) {
            setMessage("Update handler is not provided.");
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            await onUpdate({
                name: name.trim(),
                email: email.trim(),
                avatarFile,
            });
            setEditing(false);
            setMessage("Profile updated.");
        } catch (err) {
            setMessage(err?.message ?? "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <div style={styles.box}>
                <h3 style={styles.title}>Not signed in</h3>
                <p style={styles.text}>You are not authenticated.</p>
                <a href="/login" style={styles.button}>
                    Sign in
                </a>
            </div>
        );
    }

    return (
        <div style={styles.box}>
            <div style={styles.header}>
                <div style={styles.avatarWrap}>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" style={styles.avatar} />
                    ) : (
                        <div style={styles.avatarPlaceholder}>{(name || "U").charAt(0).toUpperCase()}</div>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={styles.title}>{user.name || "User"}</h3>
                    <p style={styles.text}>{user.email}</p>
                </div>
                <div style={styles.controls}>
                    <button onClick={() => setEditing((v) => !v)} style={styles.smallBtn}>
                        {editing ? "Cancel" : "Edit"}
                    </button>
                    <button onClick={onLogout} style={{ ...styles.smallBtn, marginLeft: 8 }}>
                        Logout
                    </button>
                </div>
            </div>

            {editing && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>
                        Name
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </label>

                    <label style={styles.label}>
                        Email
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            type="email"
                            required
                        />
                    </label>

                    <label style={styles.label}>
                        Avatar
                        <input type="file" accept="image/*" onChange={handleAvatarChange} style={styles.inputFile} />
                    </label>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(false);
                                setAvatarFile(null);
                                setAvatarPreview(user?.avatarUrl ?? "");
                            }}
                            style={styles.buttonAlt}
                        >
                            Cancel
                        </button>
                    </div>
                    {message && <div style={styles.message}>{message}</div>}
                </form>
            )}
        </div>
    );
}

Profile.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        email: PropTypes.string,
        avatarUrl: PropTypes.string,
    }),
    onUpdate: PropTypes.func,
    onLogout: PropTypes.func,
};

Profile.defaultProps = {
    user: null,
    onUpdate: null,
    onLogout: () => {
        // sensible default: clear localStorage and redirect
        try {
            localStorage.removeItem("authToken");
        } catch {}
        window.location.href = "/login";
    },
};

const styles = {
    box: {
        maxWidth: 540,
        margin: "12px auto",
        padding: 16,
        border: "1px solid #e6e6e6",
        borderRadius: 8,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        background: "#fff",
    },
    header: { display: "flex", alignItems: "center", gap: 12 },
    avatarWrap: { width: 72, height: 72, flex: "0 0 72px" },
    avatar: { width: 72, height: 72, borderRadius: 8, objectFit: "cover" },
    avatarPlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 8,
        background: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666",
        fontSize: 28,
        fontWeight: 600,
    },
    title: { margin: 0, fontSize: 18 },
    text: { margin: "4px 0 0", color: "#666", fontSize: 13 },
    controls: { display: "flex", alignItems: "center" },
    smallBtn: {
        padding: "6px 10px",
        fontSize: 13,
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "#fafafa",
        cursor: "pointer",
    },
    form: { marginTop: 14, display: "grid", gap: 8 },
    label: { display: "flex", flexDirection: "column", fontSize: 13, gap: 6 },
    input: {
        padding: "8px 10px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 14,
    },
    inputFile: { marginTop: 6 },
    button: {
        padding: "8px 12px",
        borderRadius: 6,
        border: 0,
        background: "#0078d4",
        color: "#fff",
        cursor: "pointer",
    },
    buttonAlt: {
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
    },
    message: { marginTop: 8, fontSize: 13, color: "#333" },
};