import React from 'react';

const About = () => {
  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10 text-center">
          <h2 className="fw-bold mb-3 text-uppercase" style={{ color: '#002f88' }}>About MRU Placement Cell</h2>
          <div style={{ width: '60px', height: '4px', backgroundColor: '#eb9407', margin: '0 auto 30px' }}></div>
          <p className="lead text-muted mb-5 fs-5" style={{ lineHeight: '1.8' }}>
            Malla Reddy University (MRU) is dedicated to ensuring that our students are well-prepared to enter the corporate world. We facilitate placements by connecting top companies with our talented students. The Placement department functions as a bridge builder between the University’s Schools, Industries and Students.
          </p>
        </div>
      </div>
      <div className="row g-5 align-items-center">
        <div className="col-md-6">
          <h3 className="fw-bold mb-4" style={{ color: '#294a70' }}>Our Vision for 2026-27 Batch</h3>
          <p className="text-muted" style={{ lineHeight: '1.8' }}>
            We expose the students to the corporate work culture by organizing Workshops, Professional Seminars, Guest Lectures and Industrial Training by experienced professionals. 
            Our goal for the 2026-27 batch is to achieve 100% placement in top-tier multinational organizations, fostering a culture of innovation, skill development, and professional competence.
          </p>
          <ul className="list-unstyled mt-4 text-muted">
            <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-2"></i> Industry oriented curriculum</li>
            <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-2"></i> Technology training and certifications</li>
            <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-2"></i> Institution to corporate exposure</li>
            <li><i className="bi bi-check-circle-fill text-success me-2"></i> Interactive learning & Skill development</li>
          </ul>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-0">
            <img src="https://static.wixstatic.com/media/0c0246_8b316cd55b4b42a49b3d40e2fc63f2bd~mv2.jpg" alt="MRU Campus" className="img-fluid" style={{ minHeight: '300px', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
