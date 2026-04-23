import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import CompanySettings from './pages/CompanySettings';
import CustomerForm from './pages/CustomerForm';
import CustomerList from './pages/CustomerList';
import Home from './pages/Home';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceList from './pages/InvoiceList';
import InvoiceView from './pages/InvoiceView';
import ItemForm from './pages/ItemForm';
import ItemList from './pages/ItemList';
import TaxSettings from './pages/TaxSettings';
import ChangePassword from './pages/ChangePassword';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Root component: declares every route nested under the Layout.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />

        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id/edit" element={<CustomerForm />} />

        <Route path="items" element={<ItemList />} />
        <Route path="items/new" element={<ItemForm />} />
        <Route path="items/:id/edit" element={<ItemForm />} />

        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id" element={<InvoiceView />} />
        <Route path="invoices/:id/edit" element={<InvoiceForm />} />

        <Route path="settings/tax" element={<TaxSettings />} />
        <Route path="settings/company" element={<CompanySettings />} />
        <Route path="settings/password" element={<ChangePassword />} />
      </Route>
    </Routes>
  );
}
