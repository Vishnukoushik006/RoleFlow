const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

test('JobTrack Backend End-to-End API Test Suite', async (t) => {
  let authToken = '';
  let testUserId = '';
  let createdApplicationId = '';
  let createdResumeId = '';
  let createdInterviewId = '';
  let createdReminderId = '';
  const testEmail = `testuser_${Date.now()}@example.com`;

  await t.test('1. Health Check Endpoint', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  await t.test('2. Auth - Register New User', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Johnson',
        email: testEmail,
        password: 'password123',
        targetRole: 'Senior Full Stack Engineer'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.name, 'Alex Johnson');
    authToken = res.body.token;
    testUserId = res.body.user.id;
  });

  await t.test('3. Auth - Login User', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'password123'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
  });

  await t.test('4. Auth - Get Current Profile (/api/auth/me)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, testEmail);
    assert.equal(res.body.user.targetRole, 'Senior Full Stack Engineer');
  });

  await t.test('5. Applications - Create Application & Trigger Auto Event', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyName: 'Google',
        companyWebsite: 'https://careers.google.com',
        jobTitle: 'Software Engineer III, Cloud AI',
        location: 'Mountain View, CA (Hybrid)',
        jobUrl: 'https://careers.google.com/jobs/results/12345',
        source: 'LinkedIn',
        jobType: 'Full-time',
        salary: '$180,000 - $220,000',
        status: 'Applied',
        notes: 'Applied with tailored ML resume. Contacted hiring manager on LinkedIn.',
        jobDescription: 'Looking for a Software Engineer experienced in React, Node.js, Python, MongoDB, and Distributed Systems.'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.companyName, 'Google');
    assert.ok(res.body.data._id);
    createdApplicationId = res.body.data._id;
  });

  await t.test('6. Applications - Fetch Application List with Filters & Search', async () => {
    const res = await request(app)
      .get('/api/applications?search=Google&status=Applied')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
    assert.equal(res.body.data[0].companyName, 'Google');
  });

  await t.test('7. Applications - Get Detail & Verify Auto Created Timeline Event', async () => {
    const res = await request(app)
      .get(`/api/applications/${createdApplicationId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.jobTitle, 'Software Engineer III, Cloud AI');
    assert.ok(res.body.data.events.length >= 1);
    assert.equal(res.body.data.events[0].eventType, 'Application Created');
  });

  await t.test('8. Applications - Update Status & Verify Status Change Event', async () => {
    const res = await request(app)
      .patch(`/api/applications/${createdApplicationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Interview' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'Interview');

    // Verify events list now has Status Changed / Interview Scheduled
    const eventsRes = await request(app)
      .get(`/api/applications/${createdApplicationId}/events`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(eventsRes.status, 200);
    assert.ok(eventsRes.body.data.some(e => e.eventType === 'Interview Scheduled' || e.eventType === 'Status Changed'));
  });

  await t.test('9. Interviews - Schedule Interview Round', async () => {
    const interviewDate = new Date();
    interviewDate.setDate(interviewDate.getDate() + 5);

    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        applicationId: createdApplicationId,
        round: 'Round 1: System Design & Coding',
        date: interviewDate.toISOString(),
        time: '2:00 PM PST',
        type: 'Technical Screening',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        interviewer: 'Sarah Connor (Staff Eng)',
        topics: ['System Design', 'Node.js', 'Distributed Caching']
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.round, 'Round 1: System Design & Coding');
    createdInterviewId = res.body.data._id;
  });

  await t.test('10. Reminders - Create Follow-up Reminder', async () => {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3);

    const res = await request(app)
      .post('/api/reminders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        applicationId: createdApplicationId,
        title: 'Review System Design notes before Google interview',
        description: 'Read DynamoDB paper and review rate limiting algorithms',
        reminderDate: reminderDate.toISOString()
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    createdReminderId = res.body.data._id;
  });

  await t.test('11. Analytics - Verify Aggregated Dashboard Metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.totalApplications >= 1);
    assert.equal(res.body.data.statusDistribution['Interview'], 1);
  });

  await t.test('12. AI - Parse Job Description & Match Skills', async () => {
    const jdSample = `We are looking for a Senior Full Stack Engineer with 4+ years of experience.
    Requirements:
    - Strong proficiency in JavaScript, TypeScript, React, Node.js, Express, MongoDB, Docker, and AWS.
    - Experience designing RESTful APIs and Microservices.
    - Bachelor's degree in Computer Science.`;

    const parseRes = await request(app)
      .post('/api/ai/parse-jd')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ jobDescription: jdSample });

    assert.equal(parseRes.status, 200);
    assert.ok(parseRes.body.data.skills.includes('React'));
    assert.ok(parseRes.body.data.skills.includes('Node.js'));

    const matchRes = await request(app)
      .post('/api/ai/match-resume')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        resumeText: 'Experienced Software Engineer with React, Node.js, JavaScript, MongoDB, Git, SQL.',
        jobDescription: jdSample
      });

    assert.equal(matchRes.status, 200);
    assert.ok(matchRes.body.data.matchPercentage > 0);
    assert.ok(matchRes.body.data.matchingSkills.includes('React'));
  });
});
