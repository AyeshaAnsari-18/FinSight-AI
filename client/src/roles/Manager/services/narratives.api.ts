import api from "../../../lib/api";

export const narrativesApi = {
  getReports: async () => {
    const response = await api.get("/narratives");
    return response.data;
  }
};