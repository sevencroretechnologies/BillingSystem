# Billing System

A simple full-stack billing / invoice management application.

* **Backend:** Laravel 10 REST API (PHP 8.1+) with SQLite by default
* **Frontend:** React 19 (Create React App) + Bootstrap 5, Axios, React Router

> Note on versions: Laravel 10 is used because this project targets PHP 8.1.
> All features specified in the brief (MVC, migrations, models, controllers,
> validation, try/catch, resources, relationships, PDF, etc.) are implemented
> the same way on Laravel 10 and 11.

## Features

### Customer Module
- Add / edit / delete customer (name, phone, email, address)
- List customers with search (name, phone, email) and pagination

### Item / Product Module
- Add / edit / delete item (name, price, tax %, description)
- List items with search and pagination

### Billing / Invoice Module
- Create invoice:
  - Select customer from dropdown
  - Add multiple items, auto-fill price & tax from the selected item
  - Adjust quantity, price, tax %; totals recalculate live
  - Subtotal, tax and grand total computed on the server
- Auto-generated invoice numbers (`INV-000001`, `INV-000002`, ...)
- View invoice details (clean printable layout)
- List invoices with search (invoice # or customer name) and date range filter

### Invoice PDF
- Server-rendered PDF using [`barryvdh/laravel-dompdf`](https://github.com/barryvdh/laravel-dompdf)
- Includes company details, customer details, item table (qty, price, tax, total), final total
- Streamable or downloadable (`?download=1`)
- `Print` button on the invoice view page uses `window.print()`

## Project Structure

```
BillingSystem/
├── backend/                 # Laravel 10 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── CustomerController.php
│   │   │   │   ├── ItemController.php
│   │   │   │   └── InvoiceController.php
│   │   │   └── Resources/
│   │   │       ├── CustomerResource.php
│   │   │       ├── ItemResource.php
│   │   │       ├── InvoiceResource.php
│   │   │       └── InvoiceItemResource.php
│   │   └── Models/
│   │       ├── Customer.php
│   │       ├── Item.php
│   │       ├── Invoice.php
│   │       └── InvoiceItem.php
│   ├── config/billing.php   # Company display settings
│   ├── database/
│   │   ├── migrations/      # customers, items, invoices, invoice_items
│   │   └── seeders/         # Sample customers + items
│   ├── resources/views/invoices/pdf.blade.php   # PDF template
│   └── routes/api.php
└── frontend/                # React (Create React App) + Bootstrap
    ├── public/              # index.html + static assets
    ├── src/
    │   ├── api/             # Axios client + endpoint helpers
    │   ├── components/      # Reusable UI (Layout, DataTable, FormField, ...)
    │   ├── pages/           # Customer/Item/Invoice pages (list, form, view)
    │   ├── App.jsx          # Route definitions
    │   └── index.js         # React entry point
    └── .env.example
```

## Database Relationships

- `Customer` hasMany `Invoice`
- `Invoice` belongsTo `Customer`, hasMany `InvoiceItem`
- `InvoiceItem` belongsTo `Invoice` and `Item`
- `Item` hasMany `InvoiceItem`

## Step-by-Step Setup

### Prerequisites
- PHP 8.1+
- Composer 2.x
- Node.js 18+ and npm

### 1. Clone
```bash
git clone https://github.com/sevencroretechnologies/BillingSystem.git
cd BillingSystem
```

### 2. Backend (Laravel)
```bash
cd backend

# Install PHP dependencies
composer install

# Environment
cp .env.example .env
php artisan key:generate

# Database (SQLite by default – no extra server required)
touch database/database.sqlite

# Schema + sample data
php artisan migrate --seed

# Start the API (http://localhost:8000)
php artisan serve
```

> To use MySQL instead, set `DB_CONNECTION=mysql` and fill `DB_HOST`, `DB_PORT`,
> `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` in `.env`, then rerun
> `php artisan migrate --seed`.

### 3. Frontend (React)
```bash
cd ../frontend

# Install JS dependencies
npm install

# Environment (optional – defaults to http://localhost:8000)
cp .env.example .env

# Start the dev server (http://localhost:3000)
npm start
```

Open http://localhost:3000 in your browser. The sample seeder creates two
customers and three items so you can create an invoice immediately.

> Environment variables exposed to the React app **must** be prefixed with
> `REACT_APP_` (Create React App convention). See `frontend/.env.example`.

### 4. Production build (frontend)
```bash
cd frontend
npm run build   # outputs build/
```

## API Endpoints

Base URL: `http://localhost:8000/api`

| Method | Endpoint                 | Description                                                      |
|--------|--------------------------|------------------------------------------------------------------|
| GET    | `/health`                | Health check                                                     |
| GET    | `/customers`             | List customers. Query: `search`, `page`, `per_page`              |
| POST   | `/customers`             | Create customer                                                  |
| GET    | `/customers/{id}`        | Get a single customer                                            |
| PUT    | `/customers/{id}`        | Update a customer                                                |
| DELETE | `/customers/{id}`        | Delete a customer                                                |
| GET    | `/items`                 | List items. Query: `search`, `page`, `per_page`                  |
| POST   | `/items`                 | Create item                                                      |
| GET    | `/items/{id}`            | Get a single item                                                |
| PUT    | `/items/{id}`            | Update an item                                                   |
| DELETE | `/items/{id}`            | Delete an item                                                   |
| GET    | `/invoices`              | List invoices. Query: `search`, `from_date`, `to_date`, `page`, `per_page` |
| POST   | `/invoices`              | Create invoice (with `items[]`)                                  |
| GET    | `/invoices/{id}`         | Get a single invoice with its customer and items                 |
| PUT    | `/invoices/{id}`         | Update an invoice                                                |
| DELETE | `/invoices/{id}`         | Delete an invoice (cascades to `invoice_items`)                  |
| GET    | `/invoices/{id}/pdf`     | Stream the invoice as PDF. Append `?download=1` to force a download |

### Sample: create an invoice

```bash
curl -X POST http://localhost:8000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "invoice_date": "2026-04-17",
    "notes": "Thanks for your business!",
    "items": [
      { "item_id": 1, "item_name": "Consulting Hour", "quantity": 2, "price": 1500, "tax_percent": 18 },
      { "item_id": null, "item_name": "Custom service", "quantity": 1, "price": 500, "tax_percent": 18 }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "message": "Invoice created successfully.",
  "data": {
    "id": 1,
    "invoice_number": "INV-000001",
    "customer": { "id": 1, "name": "Acme Corp", ... },
    "invoice_date": "2026-04-17",
    "subtotal": 3500,
    "tax_total": 630,
    "grand_total": 4130,
    "items": [ ... ]
  }
}
```

### Sample: download the PDF
```bash
curl "http://localhost:8000/api/invoices/1/pdf?download=1" -o invoice.pdf
```

## Backend Implementation Notes
- Controllers live under `App\Http\Controllers\Api`; each method validates input
  with Laravel's `validate()` rules and is wrapped in `try/catch` for safe
  error responses.
- Responses go through **API Resources**
  (`CustomerResource`, `ItemResource`, `InvoiceResource`, `InvoiceItemResource`).
- Invoice creation/update runs inside a **DB transaction** and recomputes all
  line totals and invoice totals on the server.
- Invoice numbers are generated by `Invoice::generateInvoiceNumber()`.

## Frontend Implementation Notes
- Functional components only, with hooks (`useState`, `useEffect`, `useMemo`).
- Axios client in `src/api/client.js`; endpoint helpers in `src/api/endpoints.js`.
- Reusable components: `Layout`, `DataTable`, `Pagination`, `FormField`,
  `Alert`, `Loading`.
- Bootstrap 5 is loaded once in `src/main.jsx`.
- A `@media print` CSS block hides the navbar/buttons so the invoice view page
  can be printed directly.

## Commands Cheat Sheet

Backend:
```bash
cd backend
php artisan serve           # run API
php artisan migrate:fresh --seed   # reset DB with sample data
./vendor/bin/pint           # format (Laravel Pint)
./vendor/bin/pint --test    # check formatting (used in CI)
```

Frontend:
```bash
cd frontend
npm run dev                 # dev server
npm run build               # production build
npm run lint                # ESLint
```
