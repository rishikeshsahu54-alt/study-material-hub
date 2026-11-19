# Study Materials Hub 🎓

> A complete, modern, full-stack college mini-project built with **Next.js (App Router)**, **JavaScript**, **Tailwind CSS**, and **MongoDB Atlas with Mongoose**.

Study Materials Hub allows college students to browse, search, filter, preview, and download semester study materials (notes, previous year question papers, assignments, lab manuals, and syllabus). Faculty and administrators can log in to a dedicated Admin Portal to upload PDF documents, edit metadata, replace files, and manage academic subjects across 8 semesters.

---

## 📋 Table of Contents

1. [Key Features](#1-key-features)
2. [Technology Stack](#2-technology-stack)
3. [Prerequisites](#3-prerequisites)
4. [Installation & Setup](#4-installation--setup)
5. [Environment Variables Setup](#5-environment-variables-setup)
6. [MongoDB Atlas Setup Guide](#6-mongodb-atlas-setup-guide)
7. [Running the Application](#7-running-the-application)
8. [Database Seeding (Sample Subjects)](#8-database-seeding-sample-subjects)
9. [Admin Portal & Credentials](#9-admin-portal--credentials)
10. [Project Structure](#10-project-structure)
11. [REST API Documentation](#11-rest-api-documentation)
12. [Database Schema & Collections](#12-database-schema--collections)
13. [Local PDF Storage Architecture](#13-local-pdf-storage-architecture)
14. [Manual Testing Checklist](#14-manual-testing-checklist)
15. [Limitations & Future Enhancements](#15-limitations--future-enhancements)

---

## 1. Key Features

### 👨‍🎓 For Students
- **Smart Hero Search:** Instantly search study materials by document title, keywords, or subject name.
- **Multi-Level Filters:** Filter materials by **Semester (1–8)**, **Material Type** (Notes, Question Papers, Assignments, Lab Manuals, Syllabus, Reference Books), and **Specific Subject**.
- **Browse by Semester:** Quick grid shortcuts to view curriculum materials for any semester (1–8).
- **Subject Directory:** Browse by registered engineering and academic subjects.
- **Popular & Recent Sections:** Automatic sorting to highlight the most downloaded documents and newly added resources.
- **Material Details Page:** Full page with syllabus breakdown, file size in KB/MB, upload date, download counter, and share link.
- **Instant Secure Downloads:** Controlled file streaming with automatic download count increments.

### 🛡️ For Administrators
- **Secure Server-Side Authentication:** Protected routes with cryptographic HMAC-SHA256 signed session cookies (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
- **Admin Statistics Dashboard:** Real-time counters for Total Materials, Total Subjects, and Cumulative Downloads, plus recent upload activity.
- **Material Management:** Full CRUD operations on study materials — search, preview, edit metadata, delete, or replace attached PDF files.
- **Automatic File Cleanup:** When a material is deleted or a PDF is replaced, the old local PDF file is deleted from disk to prevent storage leaks.
- **Subject Management:** Create, edit, and delete curriculum subjects by semester. Enforces referential safety (prevents deleting subjects that still have linked study materials).
- **PDF File Validation:** Validates PDF extension, MIME type (`application/pdf`), and enforces a strict 10 MB file size limit on the server.

---

## 2. Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** JavaScript & JSX (No TypeScript)
- **Database:** MongoDB Atlas (Cloud NoSQL Database)
- **ODM:** Mongoose (Connection caching for Next.js hot-reload)
- **Styling:** Tailwind CSS (Modern, clean light theme with subtle blue accents)
- **Icons:** Lucide React
- **Storage:** Local Filesystem (`uploads/` directory with path traversal defense)
- **Authentication:** Custom Session Tokens with HMAC-SHA256 signatures stored in `HttpOnly` cookies.

> **Clean Architecture:** No third-party auth services (Clerk, Firebase, Supabase), no heavy ORMs (Prisma), no Redux, and no paid APIs. Easy to explain in a college project viva!

---

## 3. Prerequisites

Before running the project, make sure you have:
- **Node.js**: Version 18.17.0 or higher (recommended: LTS 20.x).
- **npm**: Version 9.x or higher (comes with Node.js).
- **MongoDB Atlas Account**: A free MongoDB Atlas M0 cluster (or a local MongoDB instance).

---

## 4. Installation & Setup

1. Open your terminal or PowerShell in the project directory:
   ```bash
   cd "c:\vk\study material hub"
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

---

## 5. Environment Variables Setup

Create a file named `.env.local` in the project root directory:

```bash
# On Windows PowerShell:
Copy-Item .env.local.example .env.local
```

Open `.env.local` and configure your credentials:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/study_materials_hub?retryWrites=true&w=majority

# Admin Credentials for Login (/admin/login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_password

# Secret key used to sign session cookies (minimum 32 characters)
SESSION_SECRET=c8e71b29a1b94e339d1b0981e4b830d5f47a61d8ef31a987c02b115e87a942cd
```

---

## 6. MongoDB Atlas Setup Guide

If you do not have a MongoDB connection string yet, follow these steps:

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in or create a free account.
2. Create a free **Shared M0 Cluster**.
3. Under **Security → Database Access**, create a database user:
   - Example Username: `hubadmin`
   - Set a secure password and remember it.
   - User Privileges: `Read and write to any database`.
4. Under **Security → Network Access**, add an IP Access entry:
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. Under **Database → Deployment → Clusters**, click **Connect**:
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/study_materials_hub?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Paste it into your `.env.local` file as `MONGODB_URI`.

---

## 7. Running the Application

### Development Mode
Start the Next.js local development server:
```bash
npm run dev
```

Open your browser at:
- **Student Portal:** [http://localhost:3000](http://localhost:3000)
- **Admin Portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Production Build
To create an optimized production build:
```bash
npm run build
npm start
```

---

## 8. Database Seeding (Sample Subjects)

To quickly populate standard engineering subjects across semesters:

```bash
npm run seed
```

This runs `scripts/seed.js` and creates:
- Data Structures (Semester 3)
- Database Management Systems (Semester 4)
- Operating Systems (Semester 4)
- Computer Networks (Semester 5)
- Web Development (Semester 5)
- Software Engineering (Semester 6)
- Artificial Intelligence (Semester 6)
- Engineering Mathematics I (Semester 1)

*(Note: Real study materials with PDF files can then be uploaded directly through the Admin Portal).*

---

## 9. Admin Portal & Credentials

- **Login URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Default Username:** `admin` *(configured in `.env.local`)*
- **Default Password:** `change_this_password` *(configured in `.env.local`)*

### Admin Capabilities:
1. **Upload New Material:** `/admin/dashboard/materials/add`
   - Select Subject from dropdown, select semester, material type, title, optional description, and select a local `.pdf` file (max 10 MB).
2. **Manage Materials:** `/admin/dashboard/materials`
   - Search, filter, view download counts, edit metadata, replace attached PDF files, and delete documents.
3. **Manage Subjects:** `/admin/dashboard/subjects`
   - Create, edit, and safely delete course subjects.

---

## 10. Project Structure

```text
study-materials-hub/
├── app/
│   ├── page.js                              # Homepage with Hero, Search, Filters, Overview
│   ├── layout.js                            # Root layout with Navbar and Footer
│   ├── globals.css                          # Tailwind CSS styling and theme
│   ├── not-found.js                         # Custom 404 page
│   ├── materials/
│   │   └── [id]/
│   │       └── page.js                      # Material details & direct download
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.js                      # Admin authentication login page
│   │   └── dashboard/
│   │       ├── layout.js                    # Server-side auth verification guard
│   │       ├── page.js                      # Admin metrics & quick action dashboard
│   │       ├── materials/
│   │       │   ├── page.js                  # Material management & search table
│   │       │   ├── add/
│   │       │   │   └── page.js              # PDF file upload & material creator
│   │       │   └── edit/
│   │       │       └── [id]/
│   │       │           └── page.js          # Material metadata & PDF replacer
│   │       └── subjects/
│   │           └── page.js                  # Subject CRUD management
│   └── api/
│       ├── materials/
│       │   ├── route.js                     # GET (search/filter/list), POST (upload PDF)
│       │   └── [id]/
│       │       └── route.js                 # GET, PUT (update/replace PDF), DELETE
│       ├── subjects/
│       │   ├── route.js                     # GET (list/filter), POST (create)
│       │   └── [id]/
│       │       └── route.js                 # PUT (edit), DELETE (with integrity checks)
│       ├── admin/
│       │   ├── login/
│       │   │   └── route.js                 # POST (verify credentials & set session)
│       │   ├── logout/
│       │   │   └── route.js                 # POST (clear session cookie)
│       │   ├── me/
│       │   │   └── route.js                 # GET (check admin session)
│       │   └── stats/
│       │       └── route.js                 # GET (dashboard counts and analytics)
│       └── downloads/
│           └── [id]/
│               └── route.js                 # GET (controlled streaming download)
├── components/
│   ├── Navbar.jsx                           # Responsive top navigation
│   ├── Footer.jsx                           # Project footer
│   ├── MaterialCard.jsx                     # Educational material card
│   ├── SearchBar.jsx                        # Search input with clear button
│   ├── FilterBar.jsx                        # Dropdown filters (Semester, Type, Subject)
│   ├── AdminSidebar.jsx                     # Admin navigation drawer
│   ├── AdminHeader.jsx                      # Admin top header bar
│   └── AdminDashboardShell.jsx              # Admin client wrapper
├── lib/
│   ├── mongodb.js                           # Cached Mongoose connection utility
│   └── auth.js                              # HMAC-SHA256 signed session engine
├── models/
│   ├── Material.js                          # Material Mongoose schema
│   └── Subject.js                           # Subject Mongoose schema
├── scripts/
│   └── seed.js                              # Sample subjects database seeder
├── uploads/                                 # Local filesystem PDF storage
│   └── .gitkeep
├── .env.local.example                       # Environment variables template
├── .gitignore                               # Git ignore configuration
├── next.config.mjs                          # Next.js configuration
├── tailwind.config.js                       # Tailwind CSS configuration
├── postcss.config.mjs                       # PostCSS configuration
├── package.json                             # Project dependencies and scripts
└── README.md                                # Comprehensive documentation
```

---

## 11. REST API Documentation

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/materials` | `GET` | Public | Search, filter (semester, materialType, subject), and paginate materials. |
| `/api/materials` | `POST` | Admin Only | Upload PDF and save new material record (`multipart/form-data`). |
| `/api/materials/:id` | `GET` | Public | Retrieve single material details with populated subject information. |
| `/api/materials/:id` | `PUT` | Admin Only | Update material metadata and optionally replace the attached PDF file. |
| `/api/materials/:id` | `DELETE` | Admin Only | Delete material record and remove associated local PDF file from disk. |
| `/api/subjects` | `GET` | Public | Retrieve list of academic subjects (optional `?semester=N` filter). |
| `/api/subjects` | `POST` | Admin Only | Create a new subject (prevents duplicates per semester). |
| `/api/subjects/:id` | `PUT` | Admin Only | Update subject details. |
| `/api/subjects/:id` | `DELETE` | Admin Only | Delete subject (blocked if materials are assigned to it). |
| `/api/downloads/:id` | `GET` | Public | Controlled PDF file download. Increments download counter. |
| `/api/admin/login` | `POST` | Public | Authenticate admin credentials and set signed `HttpOnly` cookie. |
| `/api/admin/logout` | `POST` | Admin Only | Invalidate session by clearing `HttpOnly` cookie. |
| `/api/admin/stats` | `GET` | Admin Only | Retrieve total materials, subjects, and download counts. |

---

## 12. Database Schema & Collections

### 1. `materials` Collection
```javascript
{
  title: String,          // Required, trim, max 200 chars
  description: String,    // Optional, max 1000 chars
  subject: ObjectId,      // Reference to 'Subject' model
  semester: String,       // Enum: ['1','2','3','4','5','6','7','8']
  materialType: String,   // Enum: ['Notes', 'Question Paper', 'Assignment', 'Lab Manual', 'Reference Book', 'Syllabus', 'Other']
  fileName: String,       // Generated unique filename on disk
  filePath: String,       // Absolute path inside project's uploads/ folder
  fileSize: Number,       // Size in bytes
  downloads: Number,      // Counter, defaults to 0
  createdAt: Date,        // Timestamps
  updatedAt: Date
}
```

### 2. `subjects` Collection
```javascript
{
  name: String,           // Required, trim, max 100 chars
  semester: String,       // Enum: ['1','2','3','4','5','6','7','8']
  description: String,    // Optional, max 500 chars
  createdAt: Date,
  updatedAt: Date
}
// Unique compound index: { name: 1, semester: 1 }
```

---

## 13. Local PDF Storage Architecture

During local development, files are saved directly inside the project root `uploads/` directory.

### Security & Integrity Measures:
1. **No Direct Public Serving:** Files inside `uploads/` are **not** placed in `/public` and are not directly accessible via public URL.
2. **Controlled Download Stream:** Downloads are served only through `/api/downloads/[id]`.
3. **Path Traversal Defense:** The download route verifies with `path.resolve` that the file resides strictly within the `uploads/` directory.
4. **Sanitized Unique Filenames:** Files are renamed using `timestamp_randomToken_sanitizedName.pdf` to eliminate dangerous characters and name collisions.
5. **Disk Clean-up on Delete:** Deleting a material automatically calls `fs.unlink` to purge the physical file from the hard drive.
6. **Clean-up on PDF Replace:** When an admin uploads a replacement PDF, the previous file is removed as soon as the new file is written.

> **Deployment Notice:** Local filesystem storage is specifically designed for local development and academic demonstrations. In a serverless production environment (like Vercel), local filesystem writes are ephemeral; production deployments typically integrate cloud object storage such as AWS S3 or Cloudinary.

---

## 14. Manual Testing Checklist

| Test Item | Steps to Test | Expected Result |
| :--- | :--- | :--- |
| **1. Database Seeding** | Run `npm run seed` in terminal. | Sample subjects are inserted into MongoDB Atlas. |
| **2. Homepage Loading** | Visit `http://localhost:3000`. | Hero section, semester shortcuts, search bar, and subject cards render cleanly. |
| **3. Admin Login (Bad Password)** | Visit `/admin/login`, enter wrong password. | Error alert: "Invalid credentials. Access denied." |
| **4. Admin Login (Valid)** | Enter `admin` and `change_this_password`. | Redirects to `/admin/dashboard`. Cookie set. |
| **5. Route Guard Check** | Open an incognito tab and navigate directly to `/admin/dashboard`. | Automatically redirected to `/admin/login`. |
| **6. Create Subject** | Go to **Manage Subjects**, click **Add New Subject**, fill details. | Subject appears in the grid immediately. |
| **7. Duplicate Subject** | Try adding the same subject name to the same semester. | 409 Conflict error with descriptive alert. |
| **8. Upload PDF Material** | Go to **Upload Material**, fill form, attach a `.pdf` under 10MB. | File saved to `uploads/` and appears in materials table. |
| **9. File Size Limit** | Attempt to attach a file larger than 10MB. | Blocked with clear error message. |
| **10. Search & Filters** | On student homepage, search by title or click a semester filter. | Live results update correctly from MongoDB. |
| **11. Material Details** | Click **View Details** on any card. | Navigates to `/materials/[id]` showing file specs and syllabus info. |
| **12. PDF Download** | Click **Download PDF** button. | Browser triggers PDF download; counter increments. |
| **13. Material Edit / Replace** | In Admin, edit a material and choose a replacement PDF. | New file replaces the old one; old file is removed from disk. |
| **14. Delete Material** | Click trash icon on material and confirm. | Record removed from MongoDB and file removed from `uploads/`. |
| **15. Subject Integrity** | Try deleting a subject that has materials linked to it. | Deletion prevented with error message explaining linked materials. |
| **16. Admin Logout** | Click **Sign Out** in Admin sidebar. | Session cleared; redirected to `/admin/login`. |

---

## 15. Limitations & Future Enhancements

- **Local Storage:** Files are stored on the local filesystem. For distributed cloud hosting (e.g. AWS / Vercel), replace the local disk write in `/api/materials/route.js` with Amazon S3 or Google Cloud Storage.
- **Single Admin Account:** Currently configured for a single administrator via environment variables. Future versions could add faculty accounts with role-based access control (RBAC).
- **In-Browser PDF Viewer:** Future versions can embed PDF.js or an `<iframe />` to preview PDFs inline directly in the browser prior to downloading.
- **Ratings & Reviews:** Adding star ratings and student reviews to study notes.

---

## 📄 License & Academic Attribution
This project is created as an academic college mini-project. Feel free to use and modify it for learning and academic demonstration purposes!
#   s t u d y m a t e r i a l h u b  
 