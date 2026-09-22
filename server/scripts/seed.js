#!/usr/bin/env node
/**
 * seed.js — JobTrack Demo Data Seeder
 *
 * Creates a demo user + realistic sample applications so the dashboard
 * is non-empty on first run.
 *
 * Usage:
 *   cd server
 *   node scripts/seed.js
 *   node scripts/seed.js --reset   ← wipes ALL data first, then seeds
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User        = require('../models/User');
const Application = require('../models/Application');

const DEMO_EMAIL    = 'demo@jobtrack.io';
const DEMO_PASSWORD = 'demo1234';
const RESET         = process.argv.includes('--reset');

const apps = [
  {
    companyName: 'Stripe',
    jobTitle: 'Software Engineer, Payments Infrastructure',
    location: 'San Francisco, CA (Hybrid)',
    source: 'LinkedIn',
    jobType: 'Full-time',
    status: 'Interview',
    salary: '$180k – $240k',
    skills: ['Go', 'Distributed Systems', 'gRPC', 'Postgres'],
    appliedDate: daysAgo(12)
  },
  {
    companyName: 'Vercel',
    jobTitle: 'Frontend Engineer',
    location: 'Remote',
    source: 'LinkedIn',
    jobType: 'Full-time',
    status: 'Assessment',
    salary: '$150k – $200k',
    skills: ['React', 'Next.js', 'TypeScript', 'Rust'],
    appliedDate: daysAgo(8)
  },
  {
    companyName: 'Linear',
    jobTitle: 'Product Engineer',
    location: 'Remote',
    source: 'Company Website',
    jobType: 'Full-time',
    status: 'Applied',
    salary: 'Competitive',
    skills: ['React', 'TypeScript', 'Design Systems'],
    appliedDate: daysAgo(5)
  },
  {
    companyName: 'Figma',
    jobTitle: 'Senior Software Engineer, Editor',
    location: 'New York, NY',
    source: 'Greenhouse',
    jobType: 'Full-time',
    status: 'Applied',
    salary: '$200k – $260k',
    skills: ['C++', 'WebAssembly', 'React'],
    appliedDate: daysAgo(3)
  },
  {
    companyName: 'Notion',
    jobTitle: 'Backend Engineer',
    location: 'Remote',
    source: 'Indeed',
    jobType: 'Full-time',
    status: 'Rejected',
    salary: '$160k – $210k',
    skills: ['Node.js', 'Postgres', 'Redis'],
    appliedDate: daysAgo(20)
  },
  {
    companyName: 'Loom',
    jobTitle: 'Full Stack Engineer',
    location: 'San Francisco, CA',
    source: 'LinkedIn',
    jobType: 'Full-time',
    status: 'Saved',
    salary: '$140k – $180k',
    skills: ['React', 'Node.js', 'WebRTC'],
    appliedDate: daysAgo(1)
  },
  {
    companyName: 'PlanetScale',
    jobTitle: 'Software Engineer, Developer Experience',
    location: 'Remote',
    source: 'Company Website',
    jobType: 'Full-time',
    status: 'Offer',
    salary: '$175k – $225k',
    skills: ['Go', 'MySQL', 'Kubernetes'],
    appliedDate: daysAgo(25)
  }
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobtrack';

  console.log('');
  console.log('⟡  JobTrack Seeder');
  console.log(`   Connecting to: ${uri}`);
  console.log('');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('✓  MongoDB connected.');

  if (RESET) {
    await Application.deleteMany({});
    await User.deleteMany({ email: DEMO_EMAIL });
    console.log('✓  Cleared existing demo data.');
  }

  // Upsert demo user
  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(DEMO_PASSWORD, salt);
    user = await User.create({
      name: 'Demo User',
      email: DEMO_EMAIL,
      password: hashed,
      targetRole: 'Software Engineer'
    });
    console.log(`✓  Demo user created → ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log(`✓  Demo user already exists → ${DEMO_EMAIL}`);
  }

  // Create applications (skip if already seeded)
  const existing = await Application.countDocuments({ user: user._id });
  if (existing > 0 && !RESET) {
    console.log(`✓  ${existing} applications already seeded. Use --reset to re-seed.`);
  } else {
    const docs = apps.map((a) => ({ ...a, user: user._id }));
    await Application.insertMany(docs);
    console.log(`✓  ${docs.length} sample applications seeded.`);
  }

  console.log('');
  console.log('Done. Run the server with: node server.js');
  console.log('Then open: http://localhost:5173');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n✗  Seeding failed:', err.message);
  console.error('   Make sure MongoDB is running and MONGODB_URI is correct in server/.env');
  process.exit(1);
});
