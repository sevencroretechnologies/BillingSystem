import { NavLink, Outlet } from 'react-router-dom';

// Top-level layout with a Bootstrap navbar and routed page content.
export default function Layout() {
  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? ' active fw-bold' : ''}`;

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <NavLink to="/" className="navbar-brand">
            Billing System
          </NavLink>
          <div>
            <ul className="navbar-nav flex-row gap-3">
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
                  New Invoice
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
