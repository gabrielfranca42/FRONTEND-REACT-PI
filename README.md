# SIGAC — Web Dashboard (Frontend)

> The administrative and coordination interface for the Integrated Complementary Activities Management System (SIGAC).

---

## 📖 Table of Contents

- [Purpose of Existence](#-purpose-of-existence)
- [Key Features](#-key-features)
- [System Design](#-system-design)
  - [Architecture](#architecture)
  - [User Flows](#user-flows)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Deployment](#-deployment)
- [Related Repositories](#-related-repositories)
- [License](#-license)

---

## 🎯 Purpose of Existence

### The Problem

Managing student complementary activities is traditionally a manual, paper-based process. While the mobile app solves the submission problem for students, institutions still face significant challenges on the administrative side:

1. **Scattered Data:** Coordinators track student hours across multiple Excel spreadsheets, leading to data loss and inconsistencies.
2. **Slow Evaluation:** Reviewing paper certificates or disorganized email attachments is time-consuming.
3. **Lack of Standardization:** Applying complex graduation rules (e.g., maximum hours per category) manually is prone to human error.
4. **Poor Communication:** Students are left in the dark about their evaluation status, leading to constant inquiries.

### The Solution

The **SIGAC Web Dashboard** is the administrative control center of the ecosystem. It provides coordinators and administrators with a centralized, digital workspace to manage the entire lifecycle of complementary activities:

| Pain Point | How the Web Dashboard Solves It |
|---|---|
| Spreadsheet chaos | **Centralized Database:** All student progress and submissions are tracked in a unified system. |
| Slow evaluation | **Evaluation Hub:** Coordinators can preview certificates and approve/reject them in a few clicks. |
| Complex rule application | **Automated Tracking:** System automatically enforces course rules and maximum category hours. |
| Poor communication | **Automated Feedback:** Coordinators can leave feedback on rejected submissions, which instantly updates the student. |

This web frontend ensures that institutional staff can focus on evaluating the quality of activities rather than managing paperwork.

---

## ✨ Key Features

| Role | Features |
|---|---|
| **Administrator** | - **Dashboard:** System-wide metrics and charts.<br>- **Course Management:** Create courses and define graduation rules (categories and hour limits).<br>- **Coordinator Management:** Register and assign coordinators to specific courses. |
| **Coordinator** | - **Dashboard:** Overview of pending certificates and student progress.<br>- **Student Management:** Register new students, generating automated welcome emails.<br>- **Evaluation Hub:** Review submitted certificates (PDF/Image), approve, reject with feedback, or adjust claimed hours. |
| **System** | - **PWA Ready:** Installable as a Progressive Web App on desktops and tablets.<br>- **JWT Authentication:** Secure login sessions with automatic token management.<br>- **Responsive Design:** Optimized for desktops, laptops, and tablets. |

---

## 🏗 System Design

### Architecture

The frontend is built as a **Single Page Application (SPA)** using React 19 and Vite. It follows a modular component-based architecture:

- **Routing:** Handled by `react-router-dom` using `HashRouter` (for compatibility with static hosting like GitHub Pages). Routes are protected based on the user's role (Admin vs. Coordinator).
- **State Management:** Uses React Context and local state hooks (`useState`, `useEffect`). Authentication state is persisted via `localStorage`.
- **API Communication:** An `axios` instance (`src/services/api.js`) centralizes all backend communication, automatically injecting the JWT `Authorization` header and intercepting `401 Unauthorized` responses to handle auto-logout.
- **UI/UX:** Built with vanilla CSS (`index.css` and `App.css`) utilizing a custom design system focused on a modern, dark/light aesthetic, complemented by `lucide-react` icons and `recharts` for data visualization.

### User Flows

1. **Login:** User authenticates -> API returns JWT and Role -> Router redirects to `/admin` or `/coordinator` layout.
2. **Coordinator Flow:** Views pending activities -> Clicks an activity -> Opens modal with certificate preview -> Submits evaluation (Approved/Rejected) -> Backend processes and emails student.
3. **Admin Flow:** Navigates to Courses -> Creates a new course -> Navigates to Course Rules -> Adds categories (e.g., "Internship: 150h max") -> Assigns a Coordinator.

---

## 🛠 Technology Stack

| Technology | Purpose |
|---|---|
| **React 19** | Core UI library |
| **Vite 8** | Extremely fast build tool and development server |
| **React Router DOM 7** | Client-side routing and layout management |
| **Axios** | Promise-based HTTP client for API requests |
| **Recharts** | Declarative charting library for dashboard metrics |
| **Lucide React** | Beautiful, consistent icon set |
| **Vite PWA Plugin** | Progressive Web App manifest and service worker generation |
| **ESLint** | Code linting and quality enforcement |

---

## 📂 Project Structure

```
FRONTEND-REACT-PI/
├── public/                 # Static assets (favicon, PWA icons)
├── src/
│   ├── assets/             # Images and logos
│   ├── layouts/            # Shared layouts with sidebars/navbars
│   │   ├── AdminLayout.jsx
│   │   └── CoordinatorLayout.jsx
│   ├── pages/              # Route components
│   │   ├── admin/          # Admin CRUDs and Dashboard
│   │   ├── coordinator/    # Student management and evaluations
│   │   └── Login.jsx       # Authentication page
│   ├── services/
│   │   └── api.js          # Axios configuration and API wrappers
│   ├── App.jsx             # Router configuration
│   ├── main.jsx            # React entry point
│   ├── App.css             # Component-specific styles
│   └── index.css           # Global design system, tokens, and utilities
├── vite.config.js          # Vite and PWA configuration
└── package.json            # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or 20+
- The **SIGAC Backend** running locally or remotely (configured in `api.js`)

### Installation

```bash
# Clone the repository
git clone https://github.com/gabrielfranca42/FRONTEND-REACT-PI.git
cd FRONTEND-REACT-PI

# Install dependencies
npm install
```

### Environment Setup

By default, the application is configured to point to the production backend on Render.
To point to a local backend for development, update `src/services/api.js`:

```javascript
// src/services/api.js
const api = axios.create({
  // Use this for local development:
  // baseURL: 'http://localhost:3000/api/v1',
  
  // Production URL:
  baseURL: 'https://projeto-senac-geraldo-1.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Running Locally

```bash
# Start the development server with hot-module replacement
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## ☁ Deployment

The application is configured to be deployed as a static site using **GitHub Pages**.
The `vite.config.js` includes the `base: '/FRONTEND-REACT-PI/'` property necessary for GitHub Pages sub-path routing.

To deploy manually (if using gh-pages package):
1. Run `npm run build`
2. Push the `dist` folder to the `gh-pages` branch.

---

## 📦 Related Repositories

| Project | Description |
|---|---|
| [PROJETO-SENAC-GERALDO](https://github.com/gabrielfranca42/PROJETO-SENAC-GERALDO) | Node.js Backend API (Core Business Logic) |
| [REACT-NATIVE-SIGAC](https://github.com/gabrielfranca42/REACT-NATIVE-SIGAC) | Mobile app for students (ValidaUP) |

---

## 📄 License

This project was developed as an academic integrative project (Projeto Integrador) at **SENAC Recife**.
