import React, { useState } from 'react';
import './BookingSummary.css';

const BookingSummary = () => {
    const [bookingData, setBookingData] = useState({
        serviceName: 'Hair Styling',
        servicePrice: 50,
        duration: '1 hour',
        date: '2024-01-15',
        time: '10:00 AM',
        stylist: 'Sarah Johnson',
        discount: 5,
    });

    const calculateTotal = () => {
        return bookingData.servicePrice - bookingData.discount;
    };

    return (
        <div className="booking-summary">
            <div className="summary-container">
                <h1>Booking Summary</h1>

                <div className="summary-item">
                    <span className="label">Service:</span>
                    <span className="value">{bookingData.serviceName}</span>
                </div>

                <div className="summary-item">
                    <span className="label">Stylist:</span>
                    <span className="value">{bookingData.stylist}</span>
                </div>

                <div className="summary-item">
                    <span className="label">Date:</span>
                    <span className="value">{bookingData.date}</span>
                </div>

                <div className="summary-item">
                    <span className="label">Time:</span>
                    <span className="value">{bookingData.time}</span>
                </div>

                <div className="summary-item">
                    <span className="label">Duration:</span>
                    <span className="value">{bookingData.duration}</span>
                </div>

                <hr className="divider" />

                <div className="summary-item">
                    <span className="label">Price:</span>
                    <span className="value">${bookingData.servicePrice}</span>
                </div>

                <div className="summary-item">
                    <span className="label">Discount:</span>
                    <span className="value discount">-${bookingData.discount}</span>
                </div>

                <div className="summary-item total">
                    <span className="label">Total:</span>
                    <span className="value">${calculateTotal()}</span>
                </div>

                <button className="confirm-btn">Confirm Booking</button>
            </div>
        </div>
    );
};

export default BookingSummary;