import React from "react";

const footerStyle = {
    background: "linear-gradient(180deg, #0f172a, #071024)",
    color: "#cbd5e1",
    padding: "2rem 1rem",
    fontSize: "0.95rem",
};

const containerStyle = {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    alignItems: "center",
    justifyContent: "space-between",
};

const navStyle = {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
};

const linkStyle = {
    color: "inherit",
    textDecoration: "none",
    opacity: 0.85,
    transition: "opacity 120ms",
};

const socialStyle = {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
};

const smallStyle = {
    color: "#94a3b8",
    fontSize: "0.85rem",
    marginTop: "0.5rem",
    width: "100%",
    textAlign: "center",
};

export default function Footer({ links = defaultLinks }) {
    const year = new Date().getFullYear();

    return (
        <footer style={footerStyle} role="contentinfo" aria-label="Site footer">
            <div style={containerStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontWeight: 700, color: "#fff" }}>Sheline</div>
                    <nav aria-label="Footer">
                        <div style={navStyle}>
                            {links.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    style={linkStyle}
                                    target={l.external ? "_blank" : undefined}
                                    rel={l.external ? "noopener noreferrer" : undefined}
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    </nav>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={socialStyle} aria-hidden="true">
                        {/* Twitter */}
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                            style={linkStyle}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22 5.92c-.66.3-1.37.5-2.11.6a3.7 3.7 0 0 0 1.62-2.05 7.33 7.33 0 0 1-2.34.9 3.67 3.67 0 0 0-6.26 3.34A10.42 10.42 0 0 1 3.1 4.9a3.66 3.66 0 0 0 1.14 4.9 3.6 3.6 0 0 1-1.66-.46v.05a3.68 3.68 0 0 0 2.95 3.6c-.46.12-.95.14-1.45.05a3.68 3.68 0 0 0 3.43 2.55A7.37 7.37 0 0 1 2 18.58a10.4 10.4 0 0 0 5.62 1.65c6.75 0 10.45-5.6 10.45-10.45v-.48A7.3 7.3 0 0 0 22 5.92z" />
                            </svg>
                        </a>
                        {/* GitHub */}
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            style={linkStyle}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 .5A12 12 0 0 0 0 12.5a12 12 0 0 0 8.2 11.44c.6.12.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.76.08-.75.08-.75 1.22.09 1.86 1.26 1.86 1.26 1.08 1.86 2.84 1.32 3.53 1.01.11-.78.42-1.32.76-1.62-2.67-.31-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.56 3.3-1.23 3.3-1.23.66 1.69.24 2.94.12 3.25.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.61-5.47 5.91.43.37.82 1.1.82 2.22v3.29c0 .32.22.71.82.59A12 12 0 0 0 24 12.5 12 12 0 0 0 12 .5z" />
                            </svg>
                        </a>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                        © {year} Sheline
                    </div>
                </div>

                <div style={smallStyle}>
                    Built with care. <a href="/privacy" style={linkStyle}>Privacy</a> · <a href="/terms" style={linkStyle}>Terms</a>
                </div>
            </div>
        </footer>
    );
}

const defaultLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact", external: false },
];