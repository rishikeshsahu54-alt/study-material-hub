/**
 * Database Seed Script for Study Materials Hub
 * Seeds both Subjects and up to 10 Study Materials with valid local PDF files
 * Run with: npm run seed
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from .env.local if present
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n❌ ERROR: MONGODB_URI is not defined.');
  console.error('Please configure your MongoDB Atlas connection string in .env.local first.\n');
  process.exit(1);
}

// Schemas
const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    semester: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);
SubjectSchema.index({ name: 1, semester: 1 }, { unique: true });
const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

const MaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    semester: { type: String, required: true },
    materialType: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);

const sampleSubjects = [
  {
    name: 'Data Structures',
    semester: '3',
    description: 'Arrays, linked lists, stacks, queues, trees, graphs, and algorithmic complexity analysis.',
  },
  {
    name: 'Database Management Systems',
    semester: '4',
    description: 'Relational database design, ER modeling, SQL, normalization, ACID properties, and indexing.',
  },
  {
    name: 'Operating Systems',
    semester: '4',
    description: 'Process management, CPU scheduling, deadlocks, memory management, and file systems.',
  },
  {
    name: 'Computer Networks',
    semester: '5',
    description: 'OSI reference model, TCP/IP protocol suite, subnetting, routing algorithms, and network security.',
  },
  {
    name: 'Web Development',
    semester: '5',
    description: 'HTML5, CSS3, modern JavaScript, frontend frameworks, REST APIs, and backend architectures.',
  },
  {
    name: 'Software Engineering',
    semester: '6',
    description: 'SDLC models, agile methodologies, requirements engineering, UML design, and software testing.',
  },
  {
    name: 'Artificial Intelligence',
    semester: '6',
    description: 'Search algorithms, knowledge representation, machine learning basics, and neural networks.',
  },
  {
    name: 'Engineering Mathematics I',
    semester: '1',
    description: 'Calculus, linear algebra, matrices, and differential equations for engineering fundamentals.',
  },
];

// Helper to create a valid minimal PDF buffer with document title
function createSamplePdfBuffer(documentTitle) {
  const safeText = (documentTitle || 'Sample Study Document').replace(/[\(\)\\]/g, '');
  const contentStream = `BT /F1 18 Tf 50 720 Td (${safeText}) Tj ET`;
  const streamLength = Buffer.byteLength(contentStream, 'utf8');

  return Buffer.from(
    `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${contentStream}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000288 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
393
%%EOF\n`,
    'utf-8'
  );
}

const sampleMaterialsData = [
  {
    title: 'Complete Unit 1-5 Lecture Notes on Trees & Graphs',
    subjectName: 'Data Structures',
    semester: '3',
    materialType: 'Notes',
    description: 'Detailed handwritten and typed explanations covering Binary Trees, AVL Trees, Red-Black Trees, Dijkstra Algorithm, and Graph Traversals with diagrams.',
    downloads: 42,
  },
  {
    title: '2023 End-Semester Examination Question Paper with Solutions',
    subjectName: 'Data Structures',
    semester: '3',
    materialType: 'Question Paper',
    description: 'Official university end-semester question paper with model answers and step-by-step trace for time complexity analysis.',
    downloads: 68,
  },
  {
    title: 'ER Diagrams & Relational Algebra Practice Assignment',
    subjectName: 'Database Management Systems',
    semester: '4',
    materialType: 'Assignment',
    description: 'Comprehensive assignment problems covering Entity-Relationship mapping, Cardinality, Relational Calculus, and Tuple Relational Algebra queries.',
    downloads: 27,
  },
  {
    title: 'SQL Queries, Joins & Normalization Complete Study Guide',
    subjectName: 'Database Management Systems',
    semester: '4',
    materialType: 'Notes',
    description: 'Cheat sheet and in-depth guide to 1NF, 2NF, 3NF, BCNF decomposition, indexing algorithms, and complex nested SQL subqueries.',
    downloads: 85,
  },
  {
    title: 'Process Synchronization & CPU Scheduling Lab Manual',
    subjectName: 'Operating Systems',
    semester: '4',
    materialType: 'Lab Manual',
    description: 'Lab experiments implementing FCFS, SJF, Round Robin, Banker Algorithm for deadlock avoidance, and Producer-Consumer problem using Semaphores in C.',
    downloads: 34,
  },
  {
    title: 'Previous 5-Year Solved Question Bank (2019-2023)',
    subjectName: 'Operating Systems',
    semester: '4',
    materialType: 'Question Paper',
    description: 'Compiled university exam questions with marked answers on Virtual Memory, Paging, Page Replacement Algorithms, and File Allocation.',
    downloads: 59,
  },
  {
    title: 'TCP/IP Protocol Suite, OSI Model & Subnetting Handout',
    subjectName: 'Computer Networks',
    semester: '5',
    materialType: 'Notes',
    description: 'Class notes detailing IP addressing, CIDR subnet calculations, TCP sliding window flow control, and routing protocols (OSPF, BGP).',
    downloads: 41,
  },
  {
    title: 'Full-Stack Web Development Handbook with React & Node.js',
    subjectName: 'Web Development',
    semester: '5',
    materialType: 'Reference Book',
    description: 'Practical guide to developing modern web applications using React hooks, Next.js routing, Express REST endpoints, and MongoDB integration.',
    downloads: 93,
  },
  {
    title: 'Agile Methodologies & UML Architecture Case Studies',
    subjectName: 'Software Engineering',
    semester: '6',
    materialType: 'Assignment',
    description: 'Case study assignment analyzing Sprint planning, Scrum ceremonies, Class diagrams, Sequence diagrams, and software testing matrices.',
    downloads: 19,
  },
  {
    title: 'Calculus & Linear Algebra Comprehensive Formula Sheet',
    subjectName: 'Engineering Mathematics I',
    semester: '1',
    materialType: 'Notes',
    description: 'Quick-reference formulas for Eigenvalues, Eigenvectors, Cayley-Hamilton Theorem, Partial Differentiation, and Multiple Integrals.',
    downloads: 112,
  },
];

async function runSeed() {
  console.log('\n=======================================');
  console.log('🌱 Study Materials Hub - Database Seeder');
  console.log('=======================================\n');

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!\n');

    // 1. Seed Subjects
    console.log('1. Checking and seeding subjects:');
    const subjectMap = {};

    for (const sub of sampleSubjects) {
      let existing = await Subject.findOne({ name: sub.name, semester: sub.semester });
      if (!existing) {
        existing = await Subject.create(sub);
        console.log(`  ✓ Created Subject: ${sub.name} (Semester ${sub.semester})`);
      } else {
        console.log(`  ℹ Subject already exists: ${sub.name} (Semester ${sub.semester})`);
      }
      subjectMap[sub.name] = existing._id;
    }

    // 2. Ensure uploads directory exists
    const uploadsDir = path.resolve(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 3. Seed Study Materials
    console.log('\n2. Seeding sample study materials (up to 10 items):');
    let materialsSeeded = 0;

    for (let i = 0; i < sampleMaterialsData.length; i++) {
      const item = sampleMaterialsData[i];
      const subjectId = subjectMap[item.subjectName];

      if (!subjectId) {
        console.log(`  ⚠ Skipping '${item.title}': Subject '${item.subjectName}' not found.`);
        continue;
      }

      // Check if material with same title exists
      const existingMat = await Material.findOne({ title: item.title });
      if (existingMat) {
        console.log(`  ℹ Material already exists: "${item.title}"`);
        materialsSeeded++;
        continue;
      }

      // Generate a safe unique filename and write a valid physical PDF
      const safePrefix = item.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      const safeFileName = `seed_${Date.now()}_${i + 1}_${safePrefix}.pdf`;
      const physicalFilePath = path.join(uploadsDir, safeFileName);

      const pdfBuffer = createSamplePdfBuffer(item.title);
      fs.writeFileSync(physicalFilePath, pdfBuffer);

      // Create Material document
      await Material.create({
        title: item.title,
        description: item.description,
        subject: subjectId,
        semester: item.semester,
        materialType: item.materialType,
        fileName: safeFileName,
        filePath: physicalFilePath,
        fileSize: pdfBuffer.length,
        downloads: item.downloads || 0,
      });

      console.log(`  ✓ Added Material: "${item.title}" [${item.materialType}, Sem ${item.semester}]`);
      materialsSeeded++;
    }

    console.log(`\n✅ Database seeding complete! Total materials available: ${materialsSeeded}`);
    console.log('You can now open http://localhost:3000 to search, filter, view details, and download PDFs.\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.\n');
  }
}

runSeed();
