import api from "../../../lib/api";

export const auditTrailApi = {
  getLogs: async () => {
    const response = await api.get("/audit-trail");
    return response.data;
  }
};