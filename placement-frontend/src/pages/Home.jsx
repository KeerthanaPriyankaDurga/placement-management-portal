import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* MRU Specific Clean Header */}
      <div className="container py-5 text-center mt-3 animate-fade-up">
        <h1 className="fw-bolder mb-3 text-uppercase" style={{ color: '#324158', letterSpacing: '1px', fontSize: '3.5rem' }}>
          Placement Cell
        </h1>
        <div style={{ width: '80px', height: '4px', backgroundColor: '#ec691f', margin: '0 auto 30px' }}></div>
      </div>

      {/* NEW: Key Highlights Section */}
      <div className="container pb-5">
        <div className="row g-4 justify-content-center text-center">
          <div className="col-md-3 col-6 animate-fade-up delay-100">
            <div className="p-4 bg-light rounded-4 hover-lift h-100 border-bottom border-4 border-warning">
              <h2 className="fw-bold mb-1" style={{ color: '#ec691f', fontSize: '2.5rem' }}>₹22.4L</h2>
              <p className="text-secondary fw-semibold mb-0 text-uppercase small">Highest Package</p>
            </div>
          </div>
          <div className="col-md-3 col-6 animate-fade-up delay-200">
            <div className="p-4 bg-light rounded-4 hover-lift h-100 border-bottom border-4" style={{ borderColor: '#324158' }}>
              <h2 className="fw-bold mb-1" style={{ color: '#324158', fontSize: '2.5rem' }}>₹5.0L</h2>
              <p className="text-secondary fw-semibold mb-0 text-uppercase small">Average Package</p>
            </div>
          </div>
          <div className="col-md-3 col-6 animate-fade-up delay-300">
            <div className="p-4 bg-light rounded-4 hover-lift h-100 border-bottom border-4 border-warning">
              <h2 className="fw-bold mb-1" style={{ color: '#ec691f', fontSize: '2.5rem' }}>'A'</h2>
              <p className="text-secondary fw-semibold mb-0 text-uppercase small">NAAC Grade</p>
            </div>
          </div>
          <div className="col-md-3 col-6 animate-fade-up delay-400">
            <div className="p-4 bg-light rounded-4 hover-lift h-100 border-bottom border-4" style={{ borderColor: '#324158' }}>
              <h2 className="fw-bold mb-1" style={{ color: '#324158', fontSize: '2.5rem' }}>4★</h2>
              <p className="text-secondary fw-semibold mb-0 text-uppercase small">IIC Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Placement Data from MRU Website */}
      <div className="container pb-5 animate-fade-up delay-100">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <p className="text-start fs-5" style={{ color: '#4a4a4a', lineHeight: '1.8' }}>
              Malla Reddy University has a well laid-out systematic process of meeting student’s career aspirations and the corporate expectations. The Placement department functions as a bridge builder between the University’s Schools, Industries and Students. The process is transparent and commences with the uploading students profiles on placement portal. Each student, faculty coordinator and Training and Placement official has access to the portal.
            </p>
            <p className="text-start mt-4 fs-5" style={{ color: '#4a4a4a', lineHeight: '1.8' }}>
              A result oriented approach is DNA of our placement cell. We have ensured that every stream of engineering and other disciplines of our University is aptly represented in their core domains. All the senior members of our placement cell have more than a decade of industrial and academic exposure, which enables our students to get placed in top-notch companies of national and international arena.
            </p>
          </div>
        </div>

        {/* Process Points */}
        <div className="row g-4 mt-5 justify-content-center">
          {[
            "The experienced members know the exact requirements of a particular sector and the job, grooming our students with an objective of a sure placement.",
            "We regularly observe the on-going market trends in order to make the students familiar with the latest happenings in the Industry.",
            "We organize and participate in business events with an aim to stay connected with the coveted companies.",
            "We regularly invite Industrial stalwarts as guest lecturers, helping students gain first-hand knowledge about industry practices."
          ].map((text, index) => (
            <div key={index} className={`col-md-6 animate-fade-up delay-${(index + 1) * 100}`}>
              <div className="d-flex align-items-start p-4 bg-light h-100 rounded-3 hover-lift border-start border-4 border-warning">
                <h2 className="fw-bold me-4 mb-0" style={{ color: '#324158', fontSize: '2.5rem', opacity: '0.5' }}>
                  0{index + 1}.
                </h2>
                <p className="mb-0 fs-6 text-secondary" style={{ lineHeight: '1.6' }}>
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training & Certifications (Codetantra) */}
      <div className="bg-light py-5 animate-fade-up">
        <div className="container text-center">
          <h2 className="fw-bold text-uppercase mb-3" style={{ color: '#324158' }}>Training & Certifications</h2>
          <div style={{ width: '60px', height: '4px', backgroundColor: '#ec691f', margin: '0 auto 40px' }}></div>
          <div className="row justify-content-center align-items-center g-4">
            <div className="col-md-4 hover-lift">
              <img src="https://static.wixstatic.com/media/6685d7_3b4e102827dd4cf5923c02369973185d~mv2.png" alt="CodeTantra" className="img-fluid mb-3" style={{ maxHeight: '60px' }} />
            </div>
            <div className="col-md-4 hover-lift">
              <img src="https://static.wixstatic.com/media/6685d7_2d0abf21b3e54d0ea8d52a6661a8a015~mv2.jpg" alt="Training 1" className="img-fluid shadow-sm rounded-3" />
            </div>
            <div className="col-md-4 hover-lift">
              <img src="https://static.wixstatic.com/media/6685d7_9aec090391cf4df7b32b871e177d4457~mv2.jpg" alt="Training 2" className="img-fluid shadow-sm rounded-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Exact MRU Recruiters Image */}
      <div className="container py-5 mt-3 text-center animate-fade-up">
        <h2 className="fw-bold text-uppercase mb-3" style={{ color: '#324158' }}>Our Recruiters</h2>
        <div style={{ width: '60px', height: '4px', backgroundColor: '#ec691f', margin: '0 auto 40px' }}></div>
        
        <img 
          src="https://static.wixstatic.com/media/0c0246_db6ac3dc637e4748a30a7a0567c672d8~mv2.jpeg" 
          alt="Top Recruiters" 
          className="img-fluid rounded-4 shadow-lg w-100 hover-lift" 
          style={{ maxWidth: '900px' }}
        />
      </div>

      {/* Contact Section */}
      <div className="container pb-5 text-center animate-fade-up">
        <p className="text-muted fs-5">
          To know more about our training and placement cell, you may send us an email on <br/>
          <a href="mailto:placements@mallareddyuniversity.ac.in" className="fw-bold text-decoration-none" style={{ color: '#ec691f' }}>
            placements@mallareddyuniversity.ac.in
          </a>
        </p>
        
        <div className="mt-5 d-flex gap-3 justify-content-center">
          <Link to="/login" className="btn text-white fw-bold px-5 py-3 rounded-0 shadow-sm text-uppercase animate-pulse-btn hover-lift" style={{ backgroundColor: '#ec691f' }}>
            Portal Login
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;
