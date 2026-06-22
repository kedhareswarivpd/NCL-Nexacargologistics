# NexaCargo — Portal Walkthrough Screenshots

Captured via an automated Playwright session that logs in (admin, which is
permitted in every portal layout) and visits each page against the live
backend (`/api/v1`). All data shown is real (fetched from Supabase Postgres).

| # | Screenshot | Page |
|---|---|---|
| 01 | `01-customer-dashboard.png` | Customer dashboard (live stat cards) |
| 02 | `02-customer-quotes.png` | Request a quote + priced history |
| 03 | `03-customer-invoices.png` | Invoices (PDF + Pay) |
| 04 | `04-customer-payment.png` | Payment checkout |
| 05 | `05-customer-support.png` | Support tickets |
| 06 | `06-customer-insurance.png` | Cargo insurance |
| 07 | `07-customer-track.png` | Shipment tracking |
| 08 | `08-logistics-dashboard.png` | Logistics dashboard |
| 09 | `09-logistics-shipments.png` | Shipment management |
| 10 | `10-logistics-team.png` | Logistics team (real staff w/ fallback) |
| 11 | `11-warehouse-dashboard.png` | Warehouse dashboard |
| 12 | `12-warehouse-inventory.png` | Inventory |
| 13 | `13-warehouse-outbound.png` | Outbound shipments |
| 14 | `14-finance-dashboard.png` | Finance dashboard (monthly chart) |
| 15 | `15-finance-invoices.png` | Invoices |
| 16 | `16-finance-revenue.png` | Revenue (profit/loss, chart, top clients) |
| 17 | `17-finance-reports.png` | Reports + CSV export |
| 18 | `18-customs.png` | Customs clearance |
| 19 | `19-driver-dashboard.png` | Driver dashboard |
| 20 | `20-driver-routes.png` | Driver routes (real deliveries) |
| 21 | `21-support.png` | Support dashboard |
| 22 | `22-admin-dashboard.png` | Super Admin dashboard |
| 23 | `23-admin-users.png` | User management (suspend/delete) |
| 24 | `24-admin-branches.png` | Branch management |
| 25 | `25-admin-analytics.png` | Analytics (real KPIs) |
| 26 | `26-admin-access.png` | Access control (real role counts) |

Regenerate: `node walkthrough.mjs` in the Playwright harness dir
(`C:\Users\DELL\pw-walkthrough`), with both servers running.
