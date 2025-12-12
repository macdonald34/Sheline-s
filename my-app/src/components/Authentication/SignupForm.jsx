import React, { useState } from "react";

export default function SignupForm({ onSuccess } = {}) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validate(values) {
        const e = {};
        if (!values.name.trim()) e.name = "Name is required.";
        if (!values.email.trim()) e.email = "Email is required.";
        else if (!emailRegex.test(values.email)) e.email = "Invalid email address.";
        if (!values.password) e.password = "Password is required.";
        else if (values.password.length < 8) e.password = "Password must be at least 8 characters.";
        if (!values.confirm) e.confirm = "Please confirm your password.";
        else if (values.password !== values.confirm) e.confirm = "Passwords do not match.";
        return e;
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setServerError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validation = validate(form);
        setErrors(validation);
        if (Object.keys(validation).length) return;

        setLoading(true);
        setServerError("");
        try {
            // Replace URL with your signup endpoint
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Signup failed.");
            }

            const data = await res.json().catch(() => ({}));
            setForm({ name: "", email: "", password: "", confirm: "" });
            if (typeof onSuccess === "function") onSuccess(data);
        } catch (err) {
            setServerError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} aria-live="polite" noValidate>
            <div>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                />
                {errors.name && <div style={{ color: "red" }}>{errors.name}</div>}
            </div>

            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                />
                {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                />
                {errors.password && <div style={{ color: "red" }}>{errors.password}</div>}
            </div>

            <div>
                <label htmlFor="confirm">Confirm Password</label>
                <input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    value={form.confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                />
                {errors.confirm && <div style={{ color: "red" }}>{errors.confirm}</div>}
            </div>

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword((s) => !s)}
                    />{" "}
                    Show passwords
                </label>
            </div>

            {serverError && <div style={{ color: "red" }}>{serverError}</div>}

            <button type="submit" disabled={loading}>
                {loading ? "Signing up…" : "Sign up"}
            </button>
        </form>
    );
}