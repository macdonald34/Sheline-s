import React, { useState } from 'react';
import './BookingForm.css';

export default function BookingForm() {
    const [formData, setFormData] = useState({
        vendorName: '',
        email: '',
        phone: '',
        serviceType: '',
        bookingDate: '',
        bookingTime: '',
        description: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Booking Data:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setFormData({
                vendorName: '',
                email: '',
                phone: '',
                serviceType: '',
                bookingDate: '',
                bookingTime: '',
                description: '',
            });
            setSubmitted(false);
        }, 2000);
    };

    return (
        <div className="booking-form-container">
            <h2>Book a Vendor</h2>
            {submitted ? (
                <p className="success-message">✓ Booking submitted successfully!</p>
            ) : (
                <form onSubmit={handleSubmit} className="booking-form">
                    <input
                        type="text"
                        name="vendorName"
                        placeholder="Vendor Name"
                        value={formData.vendorName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Service Type</option>
                        <option value="catering">Catering</option>
                        <option value="photography">Photography</option>
                        <option value="decoration">Decoration</option>
                    </select>
                    <input
                        type="date"
                        name="bookingDate"
                        value={formData.bookingDate}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="time"
                        name="bookingTime"
                        value={formData.bookingTime}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Additional Details"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                    />
                    <button type="submit">Submit Booking</button>
                </form>
            )}
        </div>
    );
}