import api, { backendUrl } from "./client";

// -------- Customers --------
export const listCustomers = (params) => api.get("/customers", { params });
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post("/customers", data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// -------- Items --------
export const listItems = (params) => api.get("/items", { params });
export const getItem = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post("/items", data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);

// -------- Invoices --------
export const listInvoices = (params) => api.get("/invoices", { params });
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post("/invoices", data);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);

// URL to the invoice PDF — used directly in <a> / <iframe> tags.
export const invoicePdfUrl = (id, download = false) =>
    `${backendUrl}/api/invoices/${id}/pdf${download ? "?download=1" : ""}`;

// -------- Tax settings (single-row resource) --------
export const getTax = () => api.get("/tax");
export const updateTax = (data) => api.put("/tax", data);

// -------- Company settings (single-row resource) --------
export const getCompany = () => api.get("/company");

/**
 * Update the company record. When a logo file is provided we send a
 * multipart form with `_method=PUT` so the file actually reaches Laravel
 * (browsers cannot send multipart bodies on PUT requests directly).
 */
export const updateCompany = ({
    company_name,
    address,
    phone,
    email,
    logo,
    removeLogo,
    k2_recipient_code,
    gstin,
    pan,
}) => {
    const form = new FormData();
    form.append("_method", "PUT");
    form.append("company_name", company_name ?? "");
    form.append("address", address ?? "");
    form.append("phone", phone ?? "");
    form.append("email", email ?? "");
    form.append("k2_recipient_code", k2_recipient_code ?? "");
    form.append("gstin", gstin ?? "");
    form.append("pan", pan ?? "");
    if (logo instanceof File) {
        form.append("logo", logo);
    }
    if (removeLogo) {
        form.append("remove_logo", "1");
    }
    return api.post("/company", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
