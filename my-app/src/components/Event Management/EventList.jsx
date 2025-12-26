import React, { useState, useEffect } from 'react';
import './EventList.css';

export default function EventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            // Replace with your API endpoint
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Failed to fetch events');
            const data = await response.json();
            setEvents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="event-list loading">Loading events...</div>;
    if (error) return <div className="event-list error">Error: {error}</div>;

    return (
        <div className="event-list">
            <h2>Events</h2>
            {events.length === 0 ? (
                <p>No events found</p>
            ) : (
                <div className="events-grid">
                    {events.map((event) => (
                        <div key={event.id} className="event-card">
                            <h3>{event.title}</h3>
                            <p className="date">{new Date(event.date).toLocaleDateString()}</p>
                            <p className="description">{event.description}</p>
                            <button className="btn-details">View Details</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}