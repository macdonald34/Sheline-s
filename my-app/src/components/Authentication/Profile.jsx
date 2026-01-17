import React, { useState, useEffect } from "react";

/**
 * Profile.jsx - Modern User Profile Component
 *
 * Displays and manages user profile information with edit capabilities.
 * Props:
 *  - user: { id, name, email, avatarUrl }
 *  - onUpdate: async (updates: { name, email, avatarFile }) => Promise<void>
 *  - onLogout: () => void
 *
 * Features:
 *  - Modern gradient design matching app theme
 *  - Edit profile information (name, email, avatar)
 *  - Avatar preview and file upload
 *  - Logout functionality
 *  - Loading states and user feedback
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
            <div style={styles.container}>
                <div style={styles.notSignedIn}>
                    <div style={styles.icon}>👤</div>
                    <h2 style={styles.notSignedInTitle}>Not signed in</h2>
                    <p style={styles.notSignedInText}>You are not authenticated yet.</p>
                    <a href="/login" style={styles.primaryBtn}>
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Profile Header Card */}
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.avatarSection}>
                        <div style={styles.avatarWrap}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="avatar" style={styles.avatar} />
                            ) : (
                                <div style={styles.avatarPlaceholder}>
                                    {(name || "U").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div style={styles.userInfo}>
                            <h2 style={styles.userName}>{user.name || "User"}</h2>
                            <p style={styles.userEmail}>{user.email}</p>
                        </div>
                    </div>

                    <div style={styles.headerActions}>
                        <button
                            onClick={() => setEditing((v) => !v)}
                            style={editing ? styles.secondaryBtn : styles.primaryBtn}
                        >
                            {editing ? "✕ Cancel" : "✎ Edit"}
                        </button>
                        <button onClick={onLogout} style={styles.dangerBtn}>
                            ⎋ Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            {editing && (
                <div style={styles.card}>
                    <h3 style={styles.formTitle}>Edit Profile</h3>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={styles.input}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Profile Picture</label>
                            <div style={styles.fileInputWrapper}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    style={styles.fileInput}
                                    id="avatar-input"
                                />
                                <label htmlFor="avatar-input" style={styles.fileInputLabel}>
                                    📁 Choose Image
                                </label>
                                {avatarFile && (
                                    <p style={styles.fileName}>{avatarFile.name}</p>
                                )}
                            </div>
                        </div>

                        <div style={styles.formActions}>
                            <button type="submit" disabled={loading} style={styles.submitBtn}>
                                {loading ? "Saving..." : "💾 Save Changes"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    setName(user?.name ?? "");
                                    setEmail(user?.email ?? "");
                                    setAvatarFile(null);
                                    setAvatarPreview(user?.avatarUrl ?? "");
                                    setMessage("");
                                }}
                                style={styles.cancelBtn}
                            >
                                Reset
                            </button>
                        </div>

                        {message && (
                            <div style={{
                                ...styles.message,
                                borderLeft: `4px solid ${message.includes("updated") ? "var(--success, #10b981)" : "var(--error, #ef4444)"}`
                            }}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Quick Stats */}
            {!editing && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>0</div>
                        <div style={styles.statLabel}>Events Created</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>0</div>
                        <div style={styles.statLabel}>Bookings Made</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>0</div>
                        <div style={styles.statLabel}>Following</div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 800,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
    },
    card: {
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--border, #e5e7eb)",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
    },
    notSignedIn: {
        textAlign: "center",
        padding: "48px 24px",
        background: "linear-gradient(135deg, var(--primary, #4f46e5) 0%, var(--secondary, #0891b2) 100%)",
        borderRadius: "16px",
        color: "white",
    },
    icon: {
        fontSize: "48px",
        marginBottom: "16px",
    },
    notSignedInTitle: {
        fontSize: "28px",
        fontWeight: 600,
        margin: "0 0 8px 0",
    },
    notSignedInText: {
        fontSize: "16px",
        opacity: 0.9,
        margin: "0 0 24px 0",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 24,
        flexWrap: "wrap",
    },
    avatarSection: {
        display: "flex",
        alignItems: "center",
        gap: 20,
        flex: 1,
        minWidth: 200,
    },
    avatarWrap: {
        width: 100,
        height: 100,
        flex: "0 0 100px",
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        objectFit: "cover",
        border: "3px solid var(--primary, #4f46e5)",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        background: "linear-gradient(135deg, var(--primary, #4f46e5) 0%, var(--secondary, #0891b2) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 40,
        fontWeight: 600,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        margin: "0 0 8px 0",
        fontSize: 24,
        fontWeight: 700,
        color: "var(--text-dark, #1f2937)",
    },
    userEmail: {
        margin: 0,
        fontSize: 14,
        color: "var(--text-secondary, #6b7280)",
    },
    headerActions: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
    },
    primaryBtn: {
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        background: "var(--primary, #4f46e5)",
        color: "white",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 4px rgba(79, 70, 229, 0.3)",
    },
    secondaryBtn: {
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid var(--secondary, #0891b2)",
        background: "transparent",
        color: "var(--secondary, #0891b2)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    dangerBtn: {
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid var(--error, #ef4444)",
        background: "transparent",
        color: "var(--error, #ef4444)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    formTitle: {
        margin: "0 0 20px 0",
        fontSize: 20,
        fontWeight: 700,
        color: "var(--text-dark, #1f2937)",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 20,
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--text-dark, #1f2937)",
    },
    input: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border, #e5e7eb)",
        fontSize: 14,
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        background: "var(--surface, #ffffff)",
    },
    fileInputWrapper: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    fileInput: {
        display: "none",
    },
    fileInputLabel: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "2px dashed var(--secondary, #0891b2)",
        background: "rgba(8, 145, 178, 0.05)",
        color: "var(--secondary, #0891b2)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.2s ease",
    },
    fileName: {
        fontSize: 13,
        color: "var(--text-secondary, #6b7280)",
        margin: 0,
    },
    formActions: {
        display: "flex",
        gap: 12,
        marginTop: 8,
    },
    submitBtn: {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        background: "var(--primary, #4f46e5)",
        color: "white",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        flex: 1,
    },
    cancelBtn: {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "1px solid var(--border, #e5e7eb)",
        background: "transparent",
        color: "var(--text-dark, #1f2937)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    message: {
        padding: "12px 16px",
        borderRadius: "8px",
        background: "rgba(16, 185, 129, 0.1)",
        color: "var(--text-dark, #1f2937)",
        fontSize: 14,
        marginTop: 12,
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 16,
    },
    statCard: {
        background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)",
        border: "1px solid var(--border, #e5e7eb)",
        borderRadius: "12px",
        padding: "20px 16px",
        textAlign: "center",
        transition: "all 0.3s ease",
    },
    statValue: {
        fontSize: 32,
        fontWeight: 700,
        color: "var(--primary, #4f46e5)",
        margin: "0 0 8px 0",
    },
    statLabel: {
        fontSize: 13,
        color: "var(--text-secondary, #6b7280)",
        fontWeight: 500,
    },
};
