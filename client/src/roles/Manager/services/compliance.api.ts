import api from "../../../lib/api";

export const complianceApi = {
  getIssues: async () => {
    const response = await api.get("/compliance/issues");
    return response.data;
  },
  getMonitoring: async () => {
    const response = await api.get("/compliance/monitoring");
    return response.data;
  }
};