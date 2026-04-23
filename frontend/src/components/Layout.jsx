import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as apiLogout } from '../api/endpoints';

// Top-level layout with a Bootstrap navbar and routed page content.
export default function Layout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error('Logout failed on server', e);
    } finally {
      logoutUser();
      navigate('/login');
    }
  };

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? ' active fw-bold' : ''}`;

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setIsDrawerOpen(false);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
  }, [isDrawerOpen]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
        <div className="container-fluid">
          <NavLink to="/" className="navbar-brand fw-bold me-auto">
            Billing System
          </NavLink>

          {/* Desktop Navbar (Hidden on Mobile) */}
          <div className="collapse navbar-collapse" id="desktopNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <NavLink to="/" className={linkClass} end>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers" className={linkClass}>
                  Customers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/items" className={linkClass}>
                  Items
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/invoices" className={linkClass}>
                  Invoices
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/invoices/new" className={linkClass}>
                  New
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/settings/tax" className={linkClass}>
                  Tax
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/settings/company" className={linkClass}>
                  Company
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/settings/password" className={linkClass}>
                  Change Password
                </NavLink>
              </li>
              <li className="nav-item ms-lg-2">
                <button className="btn btn-sm btn-outline-light fw-bold" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>



      {/* Bottom Navigation Bar (Mobile Only) */}
      <div className="bottom-nav d-lg-none">
        <NavLink to="/" className="bottom-nav-link" end>
          <div className="bottom-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <span>Home</span>
        </NavLink>
        <NavLink to="/customers" className="bottom-nav-link">
          <div className="bottom-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <span>Customers</span>
        </NavLink>
        <NavLink to="/items" className="bottom-nav-link">
          <div className="bottom-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
          </div>
          <span>Items</span>
        </NavLink>
        <NavLink to="/invoices" className="bottom-nav-link">
          <div className="bottom-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
          </div>
          <span>Invoices</span>
        </NavLink>
        <button className="bottom-nav-link border-0 bg-transparent" onClick={toggleDrawer}>
          <div className="bottom-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
          <span>Settings</span>
        </button>
      </div>

      {/* Mobile Offcanvas Drawer (Now for Settings) */}
      <div
        className={`mobile-drawer-overlay ${isDrawerOpen ? 'show' : ''}`}
        onClick={closeDrawer}
      ></div>
      <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header border-bottom">
          <div className="drawer-user-card">
            <div className="drawer-avatar">{(user?.name || 'A')[0]}</div>
            <div>
              <div className="fw-bold fs-6">{user?.name || 'Admin User'}</div>
              <div className="small opacity-75">{user?.email || 'admin@example.com'}</div>
            </div>
          </div>
        </div>

        <div className="drawer-body">
          <div className="text-uppercase text-secondary x-small fw-bold mb-3 px-2" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            System & Settings
          </div>
          <ul className="nav flex-column">
            <li className="nav-item">
              <NavLink to="/settings/password" className="nav-link-custom py-2" onClick={closeDrawer}>
                <div className="nav-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div className="nav-link-text">
                  <span className="nav-link-title">Change Password</span>
                  <span className="nav-link-sub">Secure your account</span>
                </div>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/settings/tax" className="nav-link-custom py-2" onClick={closeDrawer}>
                <div className="nav-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div className="nav-link-text">
                  <span className="nav-link-title">Tax Settings</span>
                  <span className="nav-link-sub">Manage GST rates</span>
                </div>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/settings/company" className="nav-link-custom py-2" onClick={closeDrawer}>
                <div className="nav-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
                </div>
                <div className="nav-link-text">
                  <span className="nav-link-title">Company Settings</span>
                  <span className="nav-link-sub">Branding and details</span>
                </div>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="drawer-footer border-top p-3 bg-light text-center">
          <button className="btn btn-outline-danger btn-sm w-100 mb-2" onClick={handleLogout}>Logout</button>
          {/* <div className="text-muted x-small" style={{ fontSize: '0.65rem' }}>
            Billing System v1.1.0
          </div> */}
        </div>
      </div>

      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
}
