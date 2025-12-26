import React from 'react';
import './Receipt.css';

const Receipt = ({ order }) => {
    const {
        id,
        date,
        items,
        subtotal,
        tax,
        total,
        paymentMethod,
        customerName,
    } = order || {};

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="receipt-container">
            <div className="receipt-header">
                <h1>Receipt</h1>
                <p className="receipt-id">Order #{id}</p>
            </div>

            <div className="receipt-info">
                <p><strong>Customer:</strong> {customerName}</p>
                <p><strong>Date:</strong> {formatDate(date)}</p>
                <p><strong>Payment:</strong> {paymentMethod}</p>
            </div>

            <table className="receipt-items">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{formatCurrency(item.quantity * item.price)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="receipt-summary">
                <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="summary-row">
                    <span>Tax:</span>
                    <span>{formatCurrency(tax)}</span>
                </div>
                <div className="summary-row total">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>

            <button className="print-btn" onClick={() => window.print()}>
                Print Receipt
            </button>
        </div>
    );
};

export default Receipt;