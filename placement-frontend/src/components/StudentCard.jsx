import React from 'react';
import { Link } from 'react-router-dom';

const StudentCard = ({ student }) => {
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body text-center">
        <div className="mb-3">
          <i className="bi bi-person-bounding-box text-secondary" style={{ fontSize: '3rem' }}></i>
        </div>
        <h5 className="card-title fw-bold">{student.name}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{student.department} - {student.batch}</h6>
        <p className="card-text small mb-1"><strong>CGPA:</strong> {student.cgpa}</p>
        <p className="card-text small mb-3"><strong>Skills:</strong> {student.skills}</p>
        <Link to={`/admin/students/${student.id}`} className="btn btn-outline-secondary btn-sm w-100">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default StudentCard;
