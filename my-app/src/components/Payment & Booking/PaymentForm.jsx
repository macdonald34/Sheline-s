import React, { useState } from 'react';
import './PaymentForm.css';

export default function PaymentForm() {
    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        email: '',
        phone: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
        if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
        if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
        if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Add your API call here
            console.log('Processing payment:', formData);
            alert('Payment processed successfully!');
            setFormData({ cardName: '', cardNumber: '', expiryDate: '', cvv: '', email: '', phone: '' });
        } catch (error) {
            console.error('Payment failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="payment-form-container">
            <h1>Payment Form</h1>
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <label htmlFor="cardName">Cardholder Name</label>
                    <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="John Doe"
                    />
                    {errors.cardName && <span className="error">{errors.cardName}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                    />
                    {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            maxLength="5"
                        />
                        {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength="4"
                        />
                        {errors.cvv && <span className="error">{errors.cvv}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="user@example.com"
                    />
                    {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Complete Payment'}
                </button>
            </form>
        </div>
    );
}