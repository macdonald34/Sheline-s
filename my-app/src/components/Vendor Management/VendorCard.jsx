import React from 'react';
import './VendorCard.css';

const VendorCard = ({ vendor, onEdit, onDelete, onContact }) => {
    const { id, name, email, phone, category, rating, status } = vendor;

    return (
        <div className="vendor-card">
            <div className="vendor-header">
                <h3 className="vendor-name">{name}</h3>
                <span className={`status-badge status-${status?.toLowerCase()}`}>
                    {status}
                </span>
            </div>

            <div className="vendor-info">
                <p className="info-item">
                    <strong>Category:</strong> {category}
                </p>
                <p className="info-item">
                    <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
                </p>
                <p className="info-item">
                    <strong>Phone:</strong> <a href={`tel:${phone}`}>{phone}</a>
                </p>
                <p className="info-item">
                    <strong>Rating:</strong> {'⭐'.repeat(Math.floor(rating))} ({rating}/5)
                </p>
            </div>

            <div className="vendor-actions">
                <button className="btn btn-primary" onClick={() => onContact(id)}>
                    Contact
                </button>
                <button className="btn btn-secondary" onClick={() => onEdit(id)}>
                    Edit
                </button>
                <button className="btn btn-danger" onClick={() => onDelete(id)}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default VendorCard;