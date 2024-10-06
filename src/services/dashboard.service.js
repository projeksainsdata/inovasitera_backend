// services/dashboardService.js
import Innovation from '../models/inovation.model.js';
import User from '../models/user.model.js';

class DashboardService {
  // Innovation Overview Dashboard
  async getInnovationOverview() {
    const [
      totalInnovations,
      statusDistribution,
      monthlySubmissions,
      categoryDistribution,
      averageRatings,
    ] = await Promise.all([
      // Total Innovations
      Innovation.countDocuments(),

      // Status Distribution
      Innovation.aggregate([
        {
          $group: {
            _id: '$status',
            count: {$sum: 1},
          },
        },
      ]),

      // Monthly Submissions (Last 12 months)
      Innovation.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
            },
          },
        },
        {
          $group: {
            _id: {
              month: {$month: '$createdAt'},
              year: {$year: '$createdAt'},
            },
            count: {$sum: 1},
          },
        },
        {$sort: {'_id.year': 1, '_id.month': 1}},
      ]),

      // Category Distribution
      Innovation.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category_info',
          },
        },
        {
          $unwind: '$category_info',
        },
        {
          $group: {
            _id: '$category_info.name',
            count: {$sum: 1},
          },
        },
      ]),

      // Average Ratings per Category
      Innovation.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category_info',
          },
        },
        {
          $unwind: '$category_info',
        },
        {
          $unwind: '$rating',
        },
        {
          $group: {
            _id: '$category_info.name',
            averageRating: {$avg: '$rating.rating'},
          },
        },
      ]),
    ]);

    return {
      totalInnovations,
      statusDistribution,
      monthlySubmissions,
      categoryDistribution,
      averageRatings,
    };
  }

  // User Analytics Dashboard
  async getUserAnalytics() {
    const [
      userRoleDistribution,
      newUserTrend,
      innovatorStats,
      authMethodStats,
    ] = await Promise.all([
      // User Role Distribution
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: {$sum: 1},
          },
        },
      ]),

      // New User Registration Trend (Last 12 months)
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
            },
          },
        },
        {
          $group: {
            _id: {
              month: {$month: '$createdAt'},
              year: {$year: '$createdAt'},
            },
            count: {$sum: 1},
          },
        },
        {$sort: {'_id.year': 1, '_id.month': 1}},
      ]),

      // Innovator Statistics
      User.aggregate([
        {
          $match: {role: 'innovator'},
        },
        {
          $group: {
            _id: null,
            fakultasDistribution: {
              $addToSet: '$inovator.fakultas',
            },
            unitDistribution: {
              $addToSet: '$inovator.prodi',
            },
            statusDistribution: {
              $push: '$inovator.status',
            },
          },
        },
      ]),

      // Authentication Method Stats
      User.aggregate([
        {
          $group: {
            _id: '$provider',
            count: {$sum: 1},
          },
        },
      ]),
    ]);

    return {
      userRoleDistribution,
      newUserTrend,
      innovatorStats,
      authMethodStats,
    };
  }
}

export default new DashboardService();
