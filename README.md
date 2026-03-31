# APRVEL

A cross-platform mobile solution designed to transform the manual, phone-based purchase order approval workflow into an automated, digital process. This system bridges the gap between executive decision-makers and the GAVEL IS ERP system.

## 📋 Project Overview

The Mobile PO Approval System addresses critical operational bottlenecks caused by synchronous, verbal communication. By providing owners with a mobile interface to view and action POs, the system eliminates the need for manual discovery calls and repetitive data entry, reducing the risk of human error and accelerating the procurement cycle.

### Key Stakeholders

* **Approving Managers/Owners:** Mobile users who need 24/7 visibility and one-touch approval capabilities.
* **Procurement Coordinators:** Staff members who benefit from automated ERP updates and reduced administrative interruptions.

---

## 🛠️ Technical Stack

* **Frontend:** Expo (React Native) for iOS and Android.
* **Middleware:** Hono (Node.js) for high-performance API routing and ERP integration.
* **ERP Integration:** GAVEL IS.
* **Architecture:** Event-driven design using standard Domain Events.

---

## 🚀 Roadmap

### Phase 1: Minimum Viable Product (MVP)

*Focus: Eliminating the phone-based bottleneck.*

* **Secure Authentication:** User login linked to GAVEL IS credentials.
* **Pending PO Dashboard:** A centralized list of all items requiring immediate action.
* **Detailed PO View:** Display of vendor names, totals, and line-item details (Qty/Price).
* **Actionable Decisions:** Single-tap Approve/Reject buttons with mandatory comments for rejections.
* **Search & Filter:** Basic functionality to locate specific POs by number or vendor.

### Phase 2: Version 2.0

*Focus: Proactive engagement and enhanced context.*

* **Push Notifications:** Alerts for users when a new PO is assigned for approval.
* **Attachment Viewer:** Support for viewing vendor quotes, PDFs, and images.
* **Decision History:** An audit trail of previously approved or rejected POs.
* **Offline Mode:** Capabilities to review and queue actions without active internet connectivity.
* **Analytics:** High-level dashboards for business intelligence and approval trends.

---

## 🏗️ Domain Events

The system utilizes a structured naming convention (`[Entity][Action][PastTense]`) to ensure consistency across the stack:

| Event Name | Description |
| --- | --- |
| `PurchaseOrderApproved` | Triggered when a manager approves a PO. |
| `PurchaseOrderRejected` | Triggered upon rejection, including a mandatory reason. |
| `GISUpdateSucceeded` | Confirms successful synchronization with the GAVEL IS ERP. |
| `UserAuthenticated` | Logs successful entry into the mobile application. |

---

## 💡 Benefits

* **24/7 Visibility:** Managers can approve items during travel or after hours.
* **Data Integrity:** Eliminates "call-and-response" errors by displaying live ERP data.
* **Operational Speed:** Replaces a fragile, synchronous process with an asynchronous, digital workflow.

