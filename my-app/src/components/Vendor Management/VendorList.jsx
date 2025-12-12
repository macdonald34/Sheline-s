import React, { useEffect, useMemo, useState } from "react";

// /src/components/Vendor Management/VendorList.jsx

/*
    Modern, simple VendorList component:
    - Fetches vendor data (falls back to sample data)
    - Search, sort, paginate
    - Simple actions: view, edit (callback), delete (local state)
    - Accessible, responsive, zero external deps
*/

const SAMPLE_VENDORS = [
    { id: 1, name: "Atlas Supplies", category: "Office", contact: "atlas@example.com", rating: 4.5 },
    { id: 2, name: "BlueWave Logistics", category: "Logistics", contact: "blue@example.com", rating: 4.0 },
    { id: 3, name: "Cedar Foods", category: "Food", contact: "cedar@example.com", rating: 4.2 },
    { id: 4, name: "Delta Tech", category: "IT", contact: "delta@example.com", rating: 4.8 },
    { id: 5, name: "Echo Furniture", category: "Furniture", contact: "echo@example.com", rating: 3.9 },
    // add more if desired
];

const styles = {
    container: { maxWidth: 1000, margin: "24px auto", padding: 16, fontFamily: "Inter, system-ui, sans-serif" },
    controls: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 },
    input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", minWidth: 200 },
    select: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: 8 },
    th: { textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #e6e6e6", cursor: "pointer", userSelect: "none" },
    td: { padding: "10px 8px", borderBottom: "1px solid #f1f1f1" },
    actions: { display: "flex", gap: 8 },
    button: { padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer" },
    primary: { background: "#2563eb", color: "#fff" },
    danger: { background: "#ef4444", color: "#fff" },
    muted: { background: "#f3f4f6", color: "#111" },
    pager: { display: "flex", gap: 8, alignItems: "center", marginTop: 12 }
};

export default function VendorList({ onEdit } = {}) {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState({ key: "name", dir: "asc" });
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);

    useEffect(() => {
        let mounted = true;
        const fetchVendors = async () => {
            setLoading(true);
            setError(null);
            try {
                // Replace this URL with your real API endpoint
                const res = await fetch("/api/vendors");
                if (!res.ok) throw new Error("Network error");
                const data = await res.json();
                if (mounted) setVendors(Array.isArray(data) ? data : SAMPLE_VENDORS);
            } catch (e) {
                // Fallback to sample data on error
                if (mounted) {
                    setVendors(SAMPLE_VENDORS);
                    setError("Using sample data (failed to load API).");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchVendors();
        return () => {
            mounted = false;
        };
    }, []);

    // Derived filtered + sorted list
    const processed = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = vendors.filter(
            v =>
                !q ||
                v.name.toLowerCase().includes(q) ||
                (v.category && v.category.toLowerCase().includes(q)) ||
                (v.contact && v.contact.toLowerCase().includes(q))
        );

        const { key, dir } = sortBy;
        list.sort((a, b) => {
            const av = a[key] ?? "";
            const bv = b[key] ?? "";
            if (typeof av === "number" && typeof bv === "number") {
                return dir === "asc" ? av - bv : bv - av;
            }
            return dir === "asc"
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });

        return list;
    }, [vendors, query, sortBy]);

    const total = processed.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const pageSafe = Math.min(page, totalPages);
    useEffect(() => {
        if (page !== pageSafe) setPage(pageSafe);
    }, [pageSafe]); // keep page within bounds

    const visible = processed.slice((pageSafe - 1) * perPage, pageSafe * perPage);

    // Actions
    const handleSort = key => {
        setSortBy(prev => {
            if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
            return { key, dir: "asc" };
        });
    };

    const handleDelete = id => {
        if (!window.confirm("Delete this vendor? This action cannot be undone.")) return;
        setVendors(prev => prev.filter(v => v.id !== id));
    };

    const handleView = vendor => {
        // Small, simple view - could be modal or route
        window.alert(`${vendor.name}\nCategory: ${vendor.category}\nContact: ${vendor.contact}\nRating: ${vendor.rating}`);
    };

    const handleEdit = vendor => {
        // Prefer parent handler if provided
        if (typeof onEdit === "function") return onEdit(vendor);
        const newName = window.prompt("Edit vendor name", vendor.name);
        if (newName && newName.trim() !== vendor.name) {
            setVendors(prev => prev.map(v => (v.id === vendor.id ? { ...v, name: newName.trim() } : v)));
        }
    };

    return (
        <div style={styles.container}>
            <h2>Vendors</h2>

            <div style={styles.controls}>
                <input
                    aria-label="Search vendors"
                    placeholder="Search by name, category or contact..."
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setPage(1);
                    }}
                    style={styles.input}
                />

                <select
                    aria-label="Items per page"
                    value={perPage}
                    onChange={e => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                    }}
                    style={styles.select}
                >
                    {[5, 10, 20].map(n => (
                        <option key={n} value={n}>
                            {n} / page
                        </option>
                    ))}
                </select>

                <div style={{ marginLeft: "auto", alignSelf: "center", color: "#6b7280" }}>
                    {loading ? "Loading..." : `${total} vendor${total !== 1 ? "s" : ""}`}
                </div>
            </div>

            {error && (
                <div style={{ marginBottom: 8, color: "#b91c1c" }}>
                    {error}
                </div>
            )}

            <table style={styles.table} role="table">
                <thead>
                    <tr>
                        <th style={styles.th} onClick={() => handleSort("name")}>
                            Name {sortBy.key === "name" ? (sortBy.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={styles.th} onClick={() => handleSort("category")}>
                            Category {sortBy.key === "category" ? (sortBy.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={styles.th} onClick={() => handleSort("contact")}>
                            Contact
                        </th>
                        <th style={styles.th} onClick={() => handleSort("rating")}>
                            Rating {sortBy.key === "rating" ? (sortBy.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={styles.th} aria-hidden>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {visible.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: 16, color: "#6b7280" }}>
                                No vendors found.
                            </td>
                        </tr>
                    ) : (
                        visible.map(v => (
                            <tr key={v.id}>
                                <td style={styles.td}>{v.name}</td>
                                <td style={styles.td}>{v.category}</td>
                                <td style={styles.td}>{v.contact}</td>
                                <td style={styles.td}>{v.rating}</td>
                                <td style={{ ...styles.td }}>
                                    <div style={styles.actions}>
                                        <button style={{ ...styles.button, ...styles.muted }} onClick={() => handleView(v)} aria-label={`View ${v.name}`}>
                                            View
                                        </button>
                                        <button style={{ ...styles.button, ...styles.primary }} onClick={() => handleEdit(v)} aria-label={`Edit ${v.name}`}>
                                            Edit
                                        </button>
                                        <button style={{ ...styles.button, ...styles.danger }} onClick={() => handleDelete(v.id)} aria-label={`Delete ${v.name}`}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div style={styles.pager}>
                <button
                    style={{ ...styles.button, ...styles.muted }}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pageSafe <= 1}
                >
                    Prev
                </button>

                <div style={{ color: "#374151" }}>
                    Page {pageSafe} / {totalPages}
                </div>

                <button
                    style={{ ...styles.button, ...styles.muted }}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={pageSafe >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}