const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');
const fs = require('fs');
const path = require('path');

test('JobTrack Comprehensive End-to-End Simulation & Parser Test', async (t) => {
  let token = '';
  let userId = '';
  let appId = '';

  await t.test('1. User Registration Flow', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Lee',
        email: `jordan_${Date.now()}@example.com`,
        password: 'password123',
        targetRole: 'Senior Full Stack Engineer'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    token = res.body.token;
    userId = res.body.user.id;
  });

  await t.test('2. Extension API Tracking - LinkedIn Job Mock', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Stripe',
        companyWebsite: 'https://stripe.com',
        jobTitle: 'Staff Backend Engineer - Cloud Platforms',
        location: 'San Francisco, CA (Hybrid)',
        jobUrl: 'https://www.linkedin.com/jobs/view/987654321',
        source: 'LinkedIn',
        jobType: 'Full-time',
        salary: '$190,000 - $230,000',
        status: 'Applied',
        notes: 'Captured via JobTrack Chrome Extension with 1-click.',
        jobDescription: 'Architect distributed systems with Go, Node.js, PostgreSQL, Distributed Systems, Redis, and Microservices.'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.companyName, 'Stripe');
    assert.equal(res.body.data.source, 'LinkedIn');
    assert.ok(res.body.data.skills.includes('Node.js'));
    assert.ok(res.body.data.skills.includes('PostgreSQL'));
    appId = res.body.data._id;
  });

  await t.test('3. Extension API Tracking - Greenhouse Job Mock', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Airbnb',
        companyWebsite: 'https://airbnb.com',
        jobTitle: 'Senior Frontend Engineer, Design Systems',
        location: 'Remote, US',
        jobUrl: 'https://boards.greenhouse.io/airbnb/jobs/12345',
        source: 'Greenhouse',
        jobType: 'Full-time',
        status: 'Saved',
        notes: 'Captured from Greenhouse career board.',
        jobDescription: 'Develop reusable React, TypeScript, and CSS component libraries for millions of travelers.'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.companyName, 'Airbnb');
    assert.equal(res.body.data.source, 'Greenhouse');
  });

  await t.test('4. Kanban Board State Transition & Event Logging', async () => {
    // Transition 1: Applied -> Interview
    const res1 = await request(app)
      .patch(`/api/applications/${appId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Interview' });

    assert.equal(res1.status, 200);
    assert.equal(res1.body.data.status, 'Interview');

    // Transition 2: Interview -> Offer
    const res2 = await request(app)
      .patch(`/api/applications/${appId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Offer' });

    assert.equal(res2.status, 200);
    assert.equal(res2.body.data.status, 'Offer');

    // Verify chronological event timeline
    const eventsRes = await request(app)
      .get(`/api/applications/${appId}/events`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(eventsRes.status, 200);
    assert.ok(eventsRes.body.data.length >= 3); // Created, Interview, Offer
    assert.ok(eventsRes.body.data.some(e => e.eventType === 'Offer Received' || e.newStatus === 'Offer'));
  });

  await t.test('5. Interview Scheduling & Reminder Lifecycle', async () => {
    // Schedule interview
    const ivRes = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicationId: appId,
        round: 'System Architecture & Concurrency',
        date: new Date(Date.now() + 86400000 * 2).toISOString(),
        time: '3:00 PM PST',
        type: 'System Design',
        meetingUrl: 'https://meet.google.com/xyz-uvwx-rst',
        interviewer: 'Alex Rivera (Staff Infrastructure Eng)',
        topics: ['Distributed Locks', 'Redis Sharding', 'Raft Consensus']
      });

    assert.equal(ivRes.status, 201);
    assert.equal(ivRes.body.data.round, 'System Architecture & Concurrency');

    // Create Reminder
    const remRes = await request(app)
      .post('/api/reminders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicationId: appId,
        title: 'Review Stripe Payment Concurrency Docs',
        description: 'Read idempotency key architecture paper',
        reminderDate: new Date(Date.now() + 86400000).toISOString()
      });

    assert.equal(remRes.status, 201);
    assert.equal(remRes.body.data.title, 'Review Stripe Payment Concurrency Docs');
  });

  await t.test('6. AI Career Copilot Services', async () => {
    const jd = `Looking for a Senior Backend Engineer.
    Requirements:
    - 5+ years building scalable services in Node.js, Express, Go, MongoDB, Redis, Docker, and AWS.
    - Strong understanding of Microservices and Distributed Systems.
    - Bachelor's degree in Computer Science.`;

    // Parse JD
    const parseRes = await request(app)
      .post('/api/ai/parse-jd')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobDescription: jd });

    assert.equal(parseRes.status, 200);
    assert.ok(parseRes.body.data.skills.includes('Node.js'));
    assert.ok(parseRes.body.data.skills.includes('MongoDB'));

    // Summarize JD
    const sumRes = await request(app)
      .post('/api/ai/summarize-jd')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobDescription: jd });

    assert.equal(sumRes.status, 200);
    assert.ok(sumRes.body.data.shortSummary.length > 10);

    // Match Resume with JD
    const matchRes = await request(app)
      .post('/api/ai/match-resume')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resumeText: 'Senior Full Stack Software Engineer experienced in JavaScript, Node.js, Express, MongoDB, Docker, React.',
        jobDescription: jd
      });

    assert.equal(matchRes.status, 200);
    assert.ok(matchRes.body.data.matchPercentage > 50);
    assert.ok(matchRes.body.data.matchingSkills.includes('Node.js'));
    assert.ok(matchRes.body.data.matchingSkills.includes('MongoDB'));
  });

  await t.test('7. Analytics Pipeline Accuracy', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.totalApplications >= 2);
    assert.ok(res.body.data.offers >= 1);
    assert.equal(res.body.data.sourceDistribution['LinkedIn'], 1);
    assert.equal(res.body.data.sourceDistribution['Greenhouse'], 1);
  });
});
