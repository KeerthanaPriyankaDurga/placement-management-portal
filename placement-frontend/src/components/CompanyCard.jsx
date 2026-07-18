import React from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  return (
    <div className="card mb-4 shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title text-primary fw-bold">{company.name}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{company.industry}</h6>
        <p className="card-text small text-truncate" style={{ maxHeight: '60px' }}>
          {company.description || 'No description provided.'}
        </p>
        <ul className="list-unstyled small mb-3">
          <li><strong>Location:</strong> {company.location}</li>
          <li><strong>Package:</strong> {company.packageOffers} LPA</li>
        </ul>
        <Link to={`/companies/${company.id}`} className="btn btn-outline-primary btn-sm w-100">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
