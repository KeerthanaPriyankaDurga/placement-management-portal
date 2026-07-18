import React from 'react';

const Contact = () => {
  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-5">Contact Us</h2>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <h4 className="fw-bold mb-4">Get in Touch</h4>
            <div className="d-flex mb-3">
              <i className="bi bi-geo-alt-fill text-primary fs-4 me-3"></i>
              <div>
                <h6 className="fw-bold mb-1">Address</h6>
                <p className="text-muted mb-0">Training & Placement Cell,<br/>ABC College of Engineering,<br/>City, State, 123456</p>
              </div>
            </div>
            <div className="d-flex mb-3">
              <i className="bi bi-envelope-fill text-primary fs-4 me-3"></i>
              <div>
                <h6 className="fw-bold mb-1">Email</h6>
                <p className="text-muted mb-0">placement@abccollege.edu.in</p>
              </div>
            </div>
            <div className="d-flex mb-3">
              <i className="bi bi-telephone-fill text-primary fs-4 me-3"></i>
              <div>
                <h6 className="fw-bold mb-1">Phone</h6>
                <p className="text-muted mb-0">+91 9876543210</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <h4 className="fw-bold mb-4">Send a Message</h4>
            <form>
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Your Name" />
              </div>
              <div className="mb-3">
                <input type="email" className="form-control" placeholder="Your Email" />
              </div>
              <div className="mb-3">
                <textarea className="form-control" rows="4" placeholder="Your Message"></textarea>
              </div>
              <button type="button" className="btn btn-primary w-100">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
