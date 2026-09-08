# NOVA — Team Productivity Platform
> **Plan. Collaborate. Deliver.**

NOVA is a full-stack project management web application built to streamline team productivity, project tracking, and task management. Designed with a sleek minimalist dark mode aesthetic, it provides robust real-time collaboration tools, Kanban workflows, and comprehensive activity tracking.

---

##  Core Features

* **Secure Authentication:** JWT-based access control with token persistence, refresh mechanisms, and secure password hashing via `bcrypt`.
* **Project Management:** Create, update, view, and organize workspaces with metadata like descriptions, visibility settings, and status tracking.
* **Kanban Task Boards:** Drag-and-drop task management categorized into *To Do*, *In Progress*, and *Completed* columns, complete with priority badges and assignees.
* **Activity Timeline:** Real-time logging of user actions, project updates, and task lifecycles.
* **Responsive Dark-Mode UI:** Built with a modern purplish-neon dark theme optimized for both desktop and mobile viewports.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js (App Router) / React
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Icons & UI:** Lucide React

### Backend & Database
* **Runtime:** Node.js with Express.js & TypeScript
* **Database & ORM:** PostgreSQL managed via Prisma ORM
* **Security:** JSON Web Tokens (JWT), Bcrypt, CORS

---

## 📦 Project Structure

```text
nova/
├── backend/
│   ├── src/
│   │   ├── config/      # Database and environment configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Error handling and authentication guards
│   │   ├── routes/      # Express API routers
│   │   ├── services/    # Business logic layer
│   │   └── app.ts       # Express app setup
│   ├── prisma/          # Prisma schema and migrations
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/         # Next.js app router pages & layouts
    │   ├── components/  # Reusable UI components & modals
    │   ├── store/       # Zustand state stores
    │   └── lib/         # Axios API client setup
    └── package.json