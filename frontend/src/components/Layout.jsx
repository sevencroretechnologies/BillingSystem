import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

// Top-level layout with a Bootstrap navbar and routed page content.
export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? ' active fw-bold' : ''}`;

  const handleNavClick = () => setCollapsed(true);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <NavLink to="/" className="navbar-brand">
            Billing System
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="mainNav"
            aria-expanded={!collapsed}
            aria-label="Toggle navigation"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse${collapsed ? '' : ' show'}`} id="mainNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/customers" className={linkClass} onClick={handleNavClick}>
                  Customers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/items" className={linkClass} onClick={handleNavClick}>
                  Items
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/invoices" className={linkClass} onClick={handleNavClick}>
                  Invoices
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/invoices/new" className={linkClass} onClick={handleNavClick}>
                  New Invoice
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/settings/tax" className={linkClass} onClick={handleNavClick}>
                  Tax
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/settings/company" className={linkClass} onClick={handleNavClick}>
                  Company
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
}
