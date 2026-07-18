import React from 'react';

const DashboardCard = ({ title, count, icon, color }) => {
  return (
    <div className="col-md-3 mb-4">
      <div className={`card text-white bg-${color} h-100 shadow-sm border-0`}>
        <div className="card-body d-flex flex-column justify-content-center align-items-center">
          <i className={`bi bi-${icon} display-4 mb-2`}></i>
          <h2 className="card-title fw-bold">{count}</h2>
          <p className="card-text">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
