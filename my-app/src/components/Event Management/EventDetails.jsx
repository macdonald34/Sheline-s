import React, { useState } from 'react';
import './EventDetails.css';

const EventDetails = ({ eventId }) => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            // Replace with your API endpoint
            const response = await fetch(`/api/events/${eventId}`);
            if (!response.ok) throw new Error('Failed to fetch event');
            const data = await response.json();
            setEvent(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!event) return <div>No event found</div>;

    return (
        <div className="event-details">
            <h1>{event.title}</h1>
            <div className="event-info">
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Description:</strong> {event.description}</p>
                <p><strong>Attendees:</strong> {event.attendees}</p>
            </div>
        </div>
    );
};

export default EventDetails;