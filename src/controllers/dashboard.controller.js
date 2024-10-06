// controllers/dashboardController.js
import DashboardService from '../services/dashboard.service.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';

class DashboardController {
  async getInnovationOverview(req, res, next) {
    try {
      const data = await DashboardService.getInnovationOverview();
      return ResponseApi.success(res, data);
    } catch (error) {
      next(ResponseError.internal(res, error.message));
    }
  }

  async getUserAnalytics(req, res, next) {
    try {
      const data = await DashboardService.getUserAnalytics();
      return ResponseApi.success(res, data);
    } catch (error) {
      next(ResponseError.internal(res, error.message));
    }
  }
}

export default new DashboardController();
