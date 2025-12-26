import React, { useState } from 'react';
import './SearchBar & Filter.css';

const SearchBarAndFilter = ({ onSearch, onFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = ['all', 'recent', 'popular', 'archived'];

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch?.(value);
    };

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        onFilter?.(filter);
    };

    return (
        <div className="search-filter-container">
            <div className="search-wrapper">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                    aria-label="Search input"
                />
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
            </div>

            <div className="filter-buttons">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => handleFilterClick(filter)}
                        className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchBarAndFilter;