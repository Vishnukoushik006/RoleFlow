const APPLICATION_STATUSES = [
  'Saved',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn'
];

const APPLICATION_SOURCES = [
  'LinkedIn',
  'Naukri',
  'Indeed',
  'Company Website',
  'Greenhouse',
  'Lever',
  'Glassdoor',
  'Wellfound',
  'Referral',
  'Other'
];

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Remote'
];

const EVENT_TYPES = [
  'Application Created',
  'Status Changed',
  'Assessment Received',
  'Assessment Completed',
  'Interview Scheduled',
  'Interview Completed',
  'Recruiter Contacted',
  'Offer Received',
  'Rejected',
  'Note Added',
  'Custom'
];

const INTERVIEW_TYPES = [
  'Phone Screen',
  'Technical Screening',
  'System Design',
  'Behavioral / HR',
  'Take-home Assessment',
  'Onsite',
  'Final Round',
  'Other'
];

const INTERVIEW_STATUSES = [
  'Scheduled',
  'Completed',
  'Cancelled',
  'Rescheduled'
];

module.exports = {
  APPLICATION_STATUSES,
  APPLICATION_SOURCES,
  JOB_TYPES,
  EVENT_TYPES,
  INTERVIEW_TYPES,
  INTERVIEW_STATUSES
};
