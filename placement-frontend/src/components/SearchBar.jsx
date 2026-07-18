import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form className="d-flex mb-4" onSubmit={handleSubmit}>
      <div className="input-group">
        <span className="input-group-text bg-white" id="search-icon">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0 ps-0"
          placeholder={placeholder || 'Search...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search"
          aria-describedby="search-icon"
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </div>
    </form>
  );
};

export default SearchBar;
