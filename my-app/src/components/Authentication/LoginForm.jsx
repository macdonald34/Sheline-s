import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * Simple, easy-to-understand LoginForm component.
 * - Controlled inputs for email and password
 * - Basic client-side validation (required + email format)
 * - Password visibility toggle
 * - onLogin prop called with { email, password } and may return a Promise
 *
 * Usage:
 * <LoginForm onLogin={async (creds) => { await api.login(creds); }} />
 */

export default function LoginForm({ onLogin }) {
    // form field states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // error messages
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");

    // simple email regex for basic validation
    const isValidEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    // validate fields and return an object with error messages (empty means valid)
    const validate = () => {
        const next = {};
        if (!email.trim()) next.email = "Email is required.";
        else if (!isValidEmail(email)) next.email = "Enter a valid email address.";
        if (!password) next.password = "Password is required.";
        return next;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setSubmitting(true);
        try {
            // onLogin can be async; await to support async auth calls
            await onLogin({ email: email.trim(), password });
            // reset form on success (optional)
            setEmail("");
            setPassword("");
        } catch (err) {
            // show a friendly error message; err may be a string or Error
            setFormError(err?.message || String(err) || "Login failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} aria-labelledby="login-heading" style={styles.form}>
            <h2 id="login-heading" style={styles.heading}>Sign in</h2>

            {formError && <div role="alert" style={styles.formError}>{formError}</div>}

            <label style={styles.label}>
                Email
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    style={{ ...styles.input, borderColor: errors.email ? "#e74c3c" : "#ccc" }}
                    placeholder="you@example.com"
                    required
                />
            </label>
            {errors.email && (
                <div id="email-error" style={styles.fieldError} role="alert">
                    {errors.email}
                </div>
            )}

            <label style={styles.label}>
                Password
                <div style={styles.passwordRow}>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        style={{ ...styles.input, flex: 1, borderColor: errors.password ? "#e74c3c" : "#ccc" }}
                        placeholder="Your password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-pressed={showPassword}
                        style={styles.toggleBtn}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
            </label>
            {errors.password && (
                <div id="password-error" style={styles.fieldError} role="alert">
                    {errors.password}
                </div>
            )}

            <button type="submit" disabled={submitting} style={{ ...styles.submit, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Signing in…" : "Sign in"}
            </button>
        </form>
    );
}

LoginForm.propTypes = {
    // onLogin receives { email, password } and may return a Promise
    onLogin: PropTypes.func,
};

LoginForm.defaultProps = {
    onLogin: async ({ email, password }) => {
        // Default fallback does nothing; in real apps pass your auth function
        // This simulated delay helps demonstrate the submitting state
        await new Promise((res) => setTimeout(res, 700));
        // For demo purposes, reject if password is "error"
        if (password === "error") throw new Error("Invalid credentials.");
        // Otherwise succeed (no-op)
        return { ok: true, email };
    },
};

/* Simple inline styles to keep the example self-contained */
const styles = {
    form: {
        maxWidth: 360,
        margin: "12px auto",
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 6,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        background: "#fff",
    },
    heading: {
        margin: "0 0 12px 0",
        fontSize: 18,
        textAlign: "center",
    },
    label: {
        display: "block",
        marginBottom: 12,
        fontSize: 14,
        color: "#333",
    },
    input: {
        display: "block",
        width: "100%",
        padding: "8px 10px",
        fontSize: 14,
        borderRadius: 4,
        border: "1px solid #ccc",
        boxSizing: "border-box",
        marginTop: 6,
    },
    passwordRow: {
        display: "flex",
        gap: 8,
        alignItems: "center",
    },
    toggleBtn: {
        padding: "8px 10px",
        fontSize: 13,
        borderRadius: 4,
        border: "1px solid #ccc",
        background: "#f7f7f7",
        cursor: "pointer",
    },
    submit: {
        width: "100%",
        padding: "10px 12px",
        fontSize: 15,
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
    },
    fieldError: {
        color: "#e74c3c",
        fontSize: 13,
        marginTop: -8,
        marginBottom: 8,
    },
    formError: {
        background: "#fee",
        color: "#900",
        padding: "8px 10px",
        borderRadius: 4,
        marginBottom: 12,
        fontSize: 13,
    },
};