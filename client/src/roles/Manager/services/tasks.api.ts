import api from "../../../lib/api";

export const tasksApi = {
  getMyTasks: async () => {
    const response = await api.get('/tasks/me');
    return response.data;
  },

  updateTask: async (id: string, status: string) => {
    const response = await api.patch(`/tasks/${id}`, { status });
    return response.data;
  },

  createTask: async (data: any) => {
    const response = await api.post('/tasks', data);
    return response.data;
  }
};