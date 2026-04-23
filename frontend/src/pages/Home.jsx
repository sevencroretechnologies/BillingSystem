import { Link } from 'react-router-dom';

// Landing page with quick links into the main modules.
export default function Home() {
  const cards = [
    { to: '/customers', title: 'Customers', text: 'Manage the list of customers you bill.' },
    { to: '/items', title: 'Items', text: 'Define the products and services you sell.' },
    { to: '/invoices', title: 'Invoices', text: 'View, search and download your invoices.' },
    { to: '/invoices/new', title: 'New Invoice', text: 'Create a new invoice with multiple items.' },
    { to: '/settings/tax', title: 'Tax Settings', text: 'Configure SGST and CGST rates.' },
    { to: '/settings/company', title: 'Company Settings', text: 'Set company details and logo for invoices.' },
  ];

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
      <div className="row g-3">
        {cards.map((c) => (
          <div className="col-md-6 col-lg-3" key={c.to}>
            <Link to={c.to} className="text-decoration-none">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{c.title}</h5>
                  <p className="card-text text-muted">{c.text}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
