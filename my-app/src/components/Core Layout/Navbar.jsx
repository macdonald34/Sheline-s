import React, { useState, useEffect, useRef } from "react";

/**
 * Navbar.jsx
 *
 * Lightweight, self-contained responsive navbar.
 * Props:
 * - links: [{ label: string, to: string }] (default: Home/About/Contact)
 * - logo: ReactNode | string
 * - LinkComponent: component to render links (defaults to "a")
 * - onLinkClick: optional callback when a link is clicked
 * - className: additional wrapper classname
 *
 * Usage:
 * <Navbar links={[{label:'Home',to:'/'}]} logo={<img .../>} LinkComponent={NavLink} />
 */

export default function Navbar({
    links = [
        { label: "Home", to: "/" },
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
    ],
    logo = "Logo",
    LinkComponent = "a",
    onLinkClick,
    className = "",
    children,
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        function handleOutside(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const toggle = () => setOpen((v) => !v);

    return (
        <header className={`nav-root ${className}`} ref={rootRef}>
            <style>{`
                .nav-root { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
                .nav { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.5rem 1rem; background:#0f172a; color:#fff; }
                .nav .brand { display:flex; align-items:center; gap:.5rem; font-weight:600; color:inherit; text-decoration:none; }
                .nav .links { display:flex; gap:.5rem; align-items:center; }
                .nav a.link { color:rgba(255,255,255,0.9); text-decoration:none; padding:.5rem .75rem; border-radius:6px; }
                .nav a.link:hover, .nav a.link:focus { background: rgba(255,255,255,0.06); outline:none; }
                .nav .actions { display:flex; gap:.5rem; align-items:center; }
                .hamburger { display:none; background:transparent; border:1px solid rgba(255,255,255,0.06); color:inherit; padding:.35rem .5rem; border-radius:6px; }
                @media (max-width:720px){
                    .nav .links { display:none; position:absolute; left:0; right:0; top:58px; flex-direction:column; background:#071133; padding:.5rem; box-shadow:0 8px 24px rgba(2,6,23,0.6); border-radius:6px; margin:0.5rem; }
                    .nav .links.open { display:flex; }
                    .hamburger { display:inline-flex; }
                }
            `}</style>

            <nav className="nav" aria-label="Main navigation">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <LinkComponent href="/" className="brand" onClick={() => { setOpen(false); }}>
                        {typeof logo === "string" ? <span>{logo}</span> : logo}
                    </LinkComponent>
                </div>

                <button
                    aria-expanded={open}
                    aria-label="Toggle menu"
                    className="hamburger"
                    onClick={toggle}
                >
                    {open ? "✕" : "☰"}
                </button>

                <div className={`links ${open ? "open" : ""}`} role="menu">
                    {links.map((l) => (
                        <LinkComponent
                            key={l.to}
                            href={l.to}
                            className="link"
                            onClick={(e) => {
                                setOpen(false);
                                if (onLinkClick) onLinkClick(l, e);
                            }}
                            role="menuitem"
                        >
                            {l.label}
                        </LinkComponent>
                    ))}
                </div>

                <div className="actions">{children}</div>
            </nav>
        </header>
    );
}