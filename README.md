# Vyshnavi MediCare – Online Pharmacy Management System

An educational full-stack pharmacy management demo built with HTML, CSS, JavaScript, Node.js, Express and MySQL 8. The project includes customer pages, administrator pages, local healthcare illustrations, a catalogue table, demo cart/checkout, order history and inventory alerts.

> **Important:** This is a student demonstration, not a real pharmacy or medical advice service. Medicine names and sample orders are illustrative. Payment is simulated; no payment gateway is connected. Prescription-only medicines are not offered as ordinary products.

## Requirements
- Node.js 18+
- MySQL 8 and MySQL Workbench
- VS Code (recommended)

## 1. Extract and open
Extract `Vyshnavi_MediCare.zip`. Open the extracted `Vyshnavi_MediCare` folder in VS Code.

## 2. Create the database
1. Open MySQL Workbench and connect to your local MySQL server.
2. Choose **File → Open SQL Script** and select `schema.sql` from this project.
3. Click the lightning bolt **Execute** button.
4. The script creates `vyshnavi_pharmacy`, exactly four core tables (`users`, `medicines`, `orders`, `order_items`) and sample records.
5. After importing the schema, run `npm run seed` once to generate valid bcrypt hashes for the sample account passwords.

## 3. Configure database connection
Open `config/db.js`. Change `YOUR_MYSQL_PASSWORD` to your own MySQL Workbench root password. Alternatively, set environment variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

For a local student setup, the default database name is `vyshnavi_pharmacy`.

## 4. Install packages
Open the VS Code terminal in the project folder and run:

```bash
npm install
```

The project uses the `mysql8` package as requested. If your npm registry does not provide that package or installation fails, check the package name/version with your instructor before substituting a MySQL driver.

## 5. Start the server

```bash
npm start
```

Open **http://localhost:3000** in your browser.

## Demo accounts
- Admin email: `admin@vyshnavimedicare.demo`
- Customer email: `ananya@example.com`
- Demo password for seeded accounts: `MediCare@123`

The `npm run seed` command writes a real bcrypt hash for the seeded accounts. If the seeded password does not authenticate in your environment, create a customer through Register, then promote that account to admin from Workbench with:
```sql
USE vyshnavi_pharmacy;
UPDATE users SET role='admin' WHERE email='your-email@example.com';
```

## Main pages
- Customer: Home, About, Medicines, Medicine Details, Cart, Checkout, Order Success, My Orders, Profile, Contact, Login, Register.
- Admin: Dashboard, Medicine Management, Add/Edit Medicine, Orders, Customers, Stock & Expiry.
- API routes: `/api/auth`, `/api/medicines`, `/api/orders`, `/api/users`, `/api/admin`.

## Features
- Responsive Clinical Teal interface with Light/Dark theme toggle.
- Catalogue in a **table layout with medicine images**, search, category filter and sorting.
- Session-based login, bcrypt password hashing and admin authorization middleware.
- Medicine CRUD, customer listing and order status updates.
- Cart stored in browser local storage; checkout validates stock and expiry.
- Order creation and stock decrement are performed in a MySQL transaction.
- Low-stock alert below 10 units and upcoming-expiry alert within 30 days.

## Project structure
```text
Vyshnavi_MediCare/
├── public/                 # HTML pages, CSS, JavaScript and images
│   ├── css/style.css
│   ├── js/
│   └── images/             # Local SVG illustrations and product-category images
├── config/db.js
├── middleware/auth.js
├── routes/
├── server.js
├── package.json
├── schema.sql
└── README.md
```

## Security and classroom notes
- Replace the default session secret and database password before any deployment.
- Use HTTPS and secure session cookies in production.
- The demo checkout does not collect or process payment.
- This project is intended for local classroom demonstration only.
