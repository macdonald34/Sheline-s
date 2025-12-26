import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * SideBar.jsx
 * Lightweight, accessible sidebar component with collapse, nested menus, and responsive behavior.
 * Drop into: src/components/Core Layout/SideBar.jsx
 */

const defaultItems = [
    { key: "home", label: "Home", to: "/", icon: HomeIcon },
    {
        key: "projects",
        label: "Projects",
        icon: FolderIcon,
        children: [
            { key: "all", label: "All Projects", to: "/projects" },
            { key: "new", label: "New Project", to: "/projects/new" },
        ],
    },
    { key: "settings", label: "Settings", to: "/settings", icon: GearIcon },
];

export default function SideBar({ items = defaultItems }) {
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState({});
    const location = useLocation();

    useEffect(() => {
        // Auto-collapse on small screens
        const mq = window.matchMedia("(max-width: 768px)");
        const handle = (e) => setCollapsed(e.matches);
        handle(mq);
        mq.addEventListener?.("change", handle);
        return () => mq.removeEventListener?.("change", handle);
    }, []);

    useEffect(() => {
        // Automatically open parent if current route matches a child
        const newOpen = {};
        function walk(list) {
            list.forEach((it) => {
                if (it.children) {
                    if (it.children.some((c) => c.to === location.pathname)) newOpen[it.key] = true;
                    walk(it.children);
                }
            });
        }
        walk(items);
        setOpenKeys((s) => ({ ...s, ...newOpen }));
    }, [location.pathname, items]);

    const toggleOpen = (key) => setOpenKeys((s) => ({ ...s, [key]: !s[key] }));

    const isActive = (to) => {
        if (!to) return false;
        return location.pathname === to;
    };

    return (
        <nav
            aria-label="Main sidebar"
            style={{
                width: collapsed ? 64 : 240,
                transition: "width 200ms ease",
                height: "100vh",
                background: "#0f1724",
                color: "#e6eef8",
                display: "flex",
                flexDirection: "column",
                padding: "12px 8px",
                boxSizing: "border-box",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto" }}>
                    <LogoCollapsed collapsed={collapsed} />
                    {!collapsed && <h1 style={{ fontSize: 16, margin: 0 }}>App Name</h1>}
                </div>
                <button
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    onClick={() => setCollapsed((c) => !c)}
                    style={iconButtonStyle}
                >
                    {collapsed ? ChevronRightIcon() : ChevronLeftIcon()}
                </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: "1 1 auto", overflow: "auto" }}>
                {items.map((item) => (
                    <li key={item.key} style={{ marginBottom: 4 }}>
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleOpen(item.key)}
                                    aria-expanded={!!openKeys[item.key]}
                                    style={{
                                        ...navButtonStyle,
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        background: openKeys[item.key] ? "rgba(255,255,255,0.04)" : "transparent",
                                    }}
                                >
                                    <span style={{ display: "inline-flex", width: 20 }}>{item.icon && item.icon()}</span>
                                    {!collapsed && <span style={{ marginLeft: 10 }}>{item.label}</span>}
                                    {!collapsed && (
                                        <span style={{ marginLeft: "auto", opacity: 0.6 }}>{openKeys[item.key] ? "▾" : "▸"}</span>
                                    )}
                                </button>

                                {openKeys[item.key] && (
                                    <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0 0" }}>
                                        {item.children.map((child) => (
                                            <li key={child.key}>
                                                <Link
                                                    to={child.to}
                                                    style={{
                                                        ...linkStyle,
                                                        paddingLeft: collapsed ? 0 : 36,
                                                        justifyContent: collapsed ? "center" : "flex-start",
                                                        background: isActive(child.to) ? "rgba(255,255,255,0.06)" : "transparent",
                                                    }}
                                                    aria-current={isActive(child.to) ? "page" : undefined}
                                                >
                                                    <span>{child.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <Link
                                to={item.to}
                                style={{
                                    ...linkStyle,
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    background: isActive(item.to) ? "rgba(255,255,255,0.06)" : "transparent",
                                }}
                                aria-current={isActive(item.to) ? "page" : undefined}
                            >
                                <span style={{ display: "inline-flex", width: 20 }}>{item.icon && item.icon()}</span>
                                {!collapsed && <span style={{ marginLeft: 10 }}>{item.label}</span>}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: 12 }}>
                <button style={{ ...navButtonStyle, justifyContent: collapsed ? "center" : "flex-start" }}>
                    <span style={{ display: "inline-flex", width: 20 }}>{UserIcon()}</span>
                    {!collapsed && <span style={{ marginLeft: 10 }}>Profile</span>}
                </button>
            </div>
        </nav>
    );
}

/* ---------- Small helpers & inline styles ---------- */

const navButtonStyle = {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
};

const linkStyle = {
    display: "flex",
    alignItems: "center",
    padding: "8px 10px",
    color: "inherit",
    textDecoration: "none",
    borderRadius: 6,
    fontSize: 14,
};

const iconButtonStyle = {
    border: "none",
    background: "transparent",
    color: "inherit",
    padding: 6,
    borderRadius: 6,
    cursor: "pointer",
};

/* ---------- Minimal icons as functions returning JSX ---------- */

function LogoCollapsed({ collapsed }) {
    return (
        <div
            style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
            }}
        >
            {collapsed ? "A" : "App"}
        </div>
    );
}

function HomeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 10.5L12 4l9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 21V11h14v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function FolderIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function GearIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15a1.7 1.7 0 00.33 1.82l.06.06a1 1 0 01-1.41 1.41l-.06-.06a1.7 1.7 0 00-1.82-.33 1.7 1.7 0 00-1 .89 1.7 1.7 0 01-2.94 0 1.7 1.7 0 00-1-.89 1.7 1.7 0 00-1.82.33l-.06.06a1 1 0 01-1.41-1.41l.06-.06a1.7 1.7 0 00.33-1.82 1.7 1.7 0 00-.89-1 1.7 1.7 0 010-2.94 1.7 1.7 0 00.89-1 1.7 1.7 0 00-.33-1.82l-.06-.06a1 1 0 011.41-1.41l.06.06a1.7 1.7 0 001.82.33 1.7 1.7 0 001-.89 1.7 1.7 0 012.94 0 1.7 1.7 0 001 .89 1.7 1.7 0 001.82-.33l.06-.06a1 1 0 011.41 1.41l-.06.06a1.7 1.7 0 00-.33 1.82 1.7 1.7 0 00.89 1 1.7 1.7 0 010 2.94 1.7 1.7 0 00-.89 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M20 21v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 7a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}