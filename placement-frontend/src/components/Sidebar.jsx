import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ menuItems }) => {
  return (
    <div className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse shadow-sm" style={{ minHeight: '80vh' }}>
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          {menuItems.map((item, index) => (
            <li className="nav-item mb-2" key={index}>
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`}
                to={item.path}
                end
              >
                <i className={`bi bi-${item.icon} me-2`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
