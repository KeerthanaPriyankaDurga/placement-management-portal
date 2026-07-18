import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container text-center">
        <p className="mb-1">&copy; {new Date().getFullYear()} Malla Reddy College of Engineering & Technology Placement Cell. All Rights Reserved.</p>
        <p className="small text-muted mb-0">Developed by Final Year Project Team</p>
      </div>
    </footer>
  );
};

export default Footer;
