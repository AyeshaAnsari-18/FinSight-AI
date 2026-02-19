import api from "../../../lib/api";

export const tasksApi = {
  getMyTasks: async () => {
    const response = await api.get("/tasks/me");
    return response.data;
  }
};