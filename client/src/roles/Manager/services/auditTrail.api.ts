import api from "../../../lib/api";

export const auditTrailApi = {
  getLogs: async () => {
    const response = await api.get("/audit-trail");
    return response.data;
  },
  createLog: async (data: { action: string, details?: string }) => {
    const response = await api.post("/audit-trail", data);
    return response.data;
  }
};