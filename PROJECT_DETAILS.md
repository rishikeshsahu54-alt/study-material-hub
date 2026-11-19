# Study Materials Hub — Project Details & Academic Report 🎓

> **College Mini-Project Documentation**  
> **Domain:** Full-Stack Web Development / Academic Portal  
> **Tech Stack:** Next.js (App Router), JavaScript, Tailwind CSS, MongoDB Atlas, Mongoose  

---

## 1. Project Overview

**Study Materials Hub** is a centralized, responsive web platform designed to streamline the distribution and accessibility of academic study materials for college students. It provides a clean, searchable, and semester-categorized repository for:
- Lecture notes
- Previous year university exam question papers
- Practical / Laboratory manuals
- Assignments and tutorial problem sets
- Course syllabus and reference material

The system eliminates disorganized WhatsApp groups and scattered Google Drive folders by giving students a dedicated one-stop portal and providing faculty/administrators with a secure dashboard to manage course subjects, upload PDF files, track download statistics, and curate course content.

---

## 2. Key Objectives

1. **Student Accessibility:** Allow students to search by subject or keyword and filter by semester (1 to 8) without requiring login.
2. **Instant Controlled Downloads:** Serve real PDF files with on-the-fly download count tracking.
3. **Faculty / Admin Control:** Empower administrators to add, edit, replace, and delete study materials and subjects.
4. **Data Integrity & Storage Safety:** Prevent orphaned PDF files by deleting local files from disk when a material record is removed or replaced.
5. **Zero Paid Services:** Built with open-source technologies (Next.js, MongoDB Atlas, Tailwind CSS) without third-party auth locks (no Clerk, no Firebase, no Prisma).

---

## 3. Technology Stack

| Layer | Technology | Purpose / Reasoning |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | Modern React server & client components, fast routing, and SEO optimization. |
| **Language** | **JavaScript (ES6+)** | Pure JS/JSX without TypeScript complexity — easy to understand and explain in college vivas. |
| **Styling** | **Tailwind CSS** | Utility-first CSS for a clean, light-themed academic design with subtle blue accents. |
| **Typography** | **Inter (Google Fonts)** | Clean, highly legible sans-serif typography across desktop and mobile devices. |
| **Icons** | **Lucide React** | Lightweight, modern icon library. |
| **Backend & APIs** | **Next.js Route Handlers** | Serverless API routes replacing a separate Express server. |
| **Database** | **MongoDB Atlas** | Cloud-hosted NoSQL database with flexible document schemas and indexing. |
| **Object Data Modeling** | **Mongoose ODM** | Schema validation, type checking, population (`ref`), and connection caching. |
| **Authentication** | **HMAC-SHA256 Signed Cookies** | Secure, stateless, HttpOnly cookies for admin authentication without third-party dependencies. |
| **File Storage** | **Local Filesystem (`uploads/`)** | Secure local storage with path-traversal protection and disk cleanup on file replacement/deletion. |

---

## 4. User Roles & Capabilities

### 👨‍🎓 1. Students (Public / No Login Needed)
- **Search:** Search materials by title, subject name, or keywords.
- **Filter by Semester:** Quick 1-click filters for Semesters 1 through 8.
- **Filter by Subject:** Select from active college subjects.
- **Filter by Material Type:** Filter by Notes, Question Paper, Assignment, Lab Manual, Reference Book, Syllabus, etc.
- **View Material Details:** View description, associated subject, upload date, file size (in KB/MB), and download counters.
- **Download PDF:** Direct streaming download of the real document.

### 🛡️ 2. Administrators (Protected by Server-Side Auth)
- **Secure Sign-In:** Authenticate with credentials configured in `.env.local`.
- **Metrics Dashboard:** View real-time statistics (Total Materials, Registered Subjects, Cumulative Downloads).
- **Upload Materials:** Form with client & server validation (PDF files only, 10 MB maximum limit).
- **Edit & Replace PDF:** Update material details and optionally upload a replacement PDF (automatically deletes the old file).
- **Delete Materials:** Remove database records and immediately purge the associated PDF file from disk.
- **Subject Management:** Create and edit semester-wise subjects; deletion is protected against subjects that have linked materials.

---

## 5. System Architecture & Workflows

### A. Database Connection Caching (`lib/mongodb.js`)
Next.js in development hot-reloads modules frequently. To prevent exhausting database connections, a cached Mongoose instance is maintained on the `global` object:
```javascript
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
```

### B. Admin Session Security (`lib/auth.js`)
- Admin login validates against server environment variables using `crypto.timingSafeEqual` to prevent timing attacks.
- A signed token containing the admin payload and timestamp is hashed with `SESSION_SECRET` using `HMAC-SHA256`.
- The token is set in an `HttpOnly`, `SameSite=Lax` cookie.
- Admin dashboard pages enforce server-side validation via `getServerSession()` in `app/admin/dashboard/layout.js`.

### C. File Upload & Download Pipeline
1. **Upload:** Files are uploaded via `multipart/form-data` to `/api/materials`. The server validates extension (`.pdf`), MIME type, and size (`<= 10MB`), generates a sanitized unique filename (`timestamp_token_cleanName.pdf`), and writes the file into `uploads/`.
2. **Download:** Served via `/api/downloads/[id]`. Validates path containment within `uploads/` (preventing directory traversal like `../../`), increments the download counter in MongoDB, and streams the file with attachment headers.
3. **Deletion:** When `DELETE /api/materials/[id]` is called, `fs.unlink` deletes the physical PDF from disk before removing the MongoDB document.

---

## 6. Database Schemas

### 1. `Subject` Schema (`models/Subject.js`)
| Field | Type | Rules | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trim, Max 100 | Subject title (e.g. Data Structures) |
| `semester` | String | Required, Enum ['1'..'8'] | Associated semester |
| `description` | String | Max 500 chars | Optional syllabus overview |
| `timestamps` | Date | Auto-generated | `createdAt` and `updatedAt` |

*Index:* Unique compound index `{ name: 1, semester: 1 }` prevents duplicate subjects in the same semester.

### 2. `Material` Schema (`models/Material.js`)
| Field | Type | Rules | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required, Trim, Max 200 | Name of the study resource |
| `description` | String | Max 1000 chars | Syllabus topics and chapters covered |
| `subject` | ObjectId | Required, Ref `Subject` | Foreign key referencing `Subject` |
| `semester` | String | Required, Enum ['1'..'8'] | Academic semester |
| `materialType` | String | Required, Enum | Notes, Question Paper, Assignment, etc. |
| `fileName` | String | Required | Generated safe filename on disk |
| `filePath` | String | Required | Absolute local disk path in `uploads/` |
| `fileSize` | Number | Required | File size in bytes |
| `downloads` | Number | Default: 0 | Live counter incremented on download |
| `timestamps` | Date | Auto-generated | `createdAt` and `updatedAt` |

---

## 7. REST API Endpoints

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/materials` | `GET` | Public | List materials with search query, semester, and type filters |
| `/api/materials` | `POST` | Admin | Upload new PDF and create material record |
| `/api/materials/[id]` | `GET` | Public | Retrieve single material populated with subject info |
| `/api/materials/[id]` | `PUT` | Admin | Edit material metadata and optionally replace attached PDF |
| `/api/materials/[id]` | `DELETE` | Admin | Delete material and unlinks local PDF file |
| `/api/subjects` | `GET` | Public | List subjects (filterable by `?semester=N`) |
| `/api/subjects` | `POST` | Admin | Create new subject (checks unique semester compound) |
| `/api/subjects/[id]` | `PUT` | Admin | Edit subject details |
| `/api/subjects/[id]` | `DELETE` | Admin | Delete subject (protected if materials are linked) |
| `/api/downloads/[id]` | `GET` | Public | Controlled stream download & atomic count increment |
| `/api/admin/login` | `POST` | Public | Authenticate admin credentials and set session cookie |
| `/api/admin/logout` | `POST` | Admin | Clear session cookie |
| `/api/admin/me` | `GET` | Admin | Verify active session status |
| `/api/admin/stats` | `GET` | Admin | Returns aggregate metrics for admin overview |

---

## 8. Project Structure

```text
study-materials-hub/
├── app/                                     # Next.js App Router
│   ├── page.js                              # Clean Student Landing Page (Search, Filters, Grid)
│   ├── layout.js                            # Root layout (Inter font, Navbar, Footer)
│   ├── globals.css                          # Tailwind CSS styling and theme
│   ├── not-found.js                         # Custom 404 page
│   ├── materials/[id]/page.js               # Material detail & download view
│   ├── admin/
│   │   ├── login/page.js                    # Admin sign-in screen
│   │   └── dashboard/
│   │       ├── layout.js                    # Server-side auth guard & sidebar shell
│   │       ├── page.js                      # Admin statistics & quick actions
│   │       ├── materials/page.js            # Materials management & search table
│   │       ├── materials/add/page.js        # PDF upload & validation form
│   │       ├── materials/edit/[id]/page.js  # Metadata editor & PDF replacer
│   │       └── subjects/page.js             # Subject CRUD management
│   └── api/                                 # Backend Route Handlers
│       ├── materials/route.js
│       ├── materials/[id]/route.js
│       ├── subjects/route.js
│       ├── subjects/[id]/route.js
│       ├── admin/login/route.js
│       ├── admin/logout/route.js
│       ├── admin/me/route.js
│       ├── admin/stats/route.js
│       └── downloads/[id]/route.js
├── components/                              # Reusable UI Components
│   ├── Navbar.jsx                           # Top navigation bar
│   ├── Footer.jsx                           # Public footer
│   ├── MaterialCard.jsx                     # Material card with live download counter
│   ├── SearchBar.jsx                        # Debounced search input
│   ├── FilterBar.jsx                        # Dropdown filter toolbar
│   ├── AdminSidebar.jsx                     # Left navigation menu for admin
│   ├── AdminHeader.jsx                      # Top bar with title & top-right Sign Out
│   └── AdminDashboardShell.jsx              # Responsive layout container
├── lib/
│   ├── mongodb.js                           # Cached Mongoose connection helper
│   └── auth.js                              # HMAC-SHA256 cookie session manager
├── models/
│   ├── Material.js                          # Mongoose Material schema
│   └── Subject.js                           # Mongoose Subject schema
├── scripts/
│   └── seed.js                              # Database seeder (Subjects + 10 Materials)
├── uploads/                                 # Physical storage for PDF documents
├── .env.local                               # Environment variables (Credentials & DB URI)
├── jsconfig.json                            # Path alias configuration (@/*)
├── next.config.mjs                          # Next.js compiler settings
├── tailwind.config.js                       # Tailwind theme & Inter font stack
├── package.json                             # Dependencies & npm scripts
├── README.md                                # Full setup & developer guide
└── PROJECT_DETAILS.md                       # Academic project report & viva reference
```

---

## 9. Quick Start Guide

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables (`.env.local`):**
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=change_this_password
   SESSION_SECRET=replace_with_a_long_random_secret_at_least_32_chars
   ```

3. **Seed Database (10 Materials + 8 Subjects):**
   ```bash
   npm run seed
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   - **Student Portal:** `http://localhost:3000`
   - **Admin Portal:** `http://localhost:3000/admin/login` (Username: `admin`, Password: `change_this_password`)

---
