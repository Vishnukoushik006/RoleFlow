const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');
const { APPLICATION_STATUSES, APPLICATION_SOURCES, JOB_TYPES } = require('../config/constants');

// @desc    Get aggregated analytics & dashboard metrics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Start of this week (Sunday or Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run parallel counts
    const [
      totalApplications,
      applicationsThisWeek,
      applicationsThisMonth,
      allApplications,
      totalInterviews,
      upcomingInterviews,
      pendingReminders
    ] = await Promise.all([
      Application.countDocuments({ user: userId }),
      Application.countDocuments({ user: userId, appliedDate: { $gte: startOfWeek } }),
      Application.countDocuments({ user: userId, appliedDate: { $gte: startOfMonth } }),
      Application.find({ user: userId }).select('status source jobType location appliedDate companyName'),
      Interview.countDocuments({ user: userId }),
      Interview.countDocuments({ user: userId, date: { $gte: startOfWeek }, status: 'Scheduled' }),
      Reminder.countDocuments({ user: userId, completed: false })
    ]);

    // Status Distribution
    const statusCounts = {};
    APPLICATION_STATUSES.forEach(st => { statusCounts[st] = 0; });
    allApplications.forEach(app => {
      const s = app.status || 'Applied';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // Source Distribution
    const sourceCounts = {};
    allApplications.forEach(app => {
      const src = app.source || 'Other';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    // Job Type Distribution
    const jobTypeCounts = {};
    allApplications.forEach(app => {
      const jt = app.jobType || 'Full-time';
      jobTypeCounts[jt] = (jobTypeCounts[jt] || 0) + 1;
    });

    // Top Locations
    const locationCounts = {};
    allApplications.forEach(app => {
      const loc = app.location || 'Remote';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Weekly Application Cadence (Past 6 Weeks)
    const weeklyCadence = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const count = allApplications.filter(app => {
        const d = new Date(app.appliedDate);
        return d >= weekStart && d <= weekEnd;
      }).length;

      const label = `Week ${6 - i} (${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      weeklyCadence.push({ label, count, weekStart, weekEnd });
    }

    const totalIn6Weeks = weeklyCadence.reduce((sum, w) => sum + w.count, 0);
    const averageApplicationsPerWeek = Math.round((totalIn6Weeks / 6) * 10) / 10;

    // Interview & Offer Rates
    const interviewCount = statusCounts['Interview'] || 0;
    const offerCount = statusCounts['Offer'] || 0;
    const rejectedCount = statusCounts['Rejected'] || 0;
    const interviewRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0;
    const offerRate = totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalApplications,
        applicationsThisWeek,
        applicationsThisMonth,
        interviews: interviewCount,
        offers: offerCount,
        rejected: rejectedCount,
        averageApplicationsPerWeek,
        interviewRate,
        offerRate,
        upcomingInterviews,
        pendingReminders,
        statusDistribution: statusCounts,
        sourceDistribution: sourceCounts,
        jobTypeDistribution: jobTypeCounts,
        topLocations,
        weeklyCadence
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics
};
