import api from "../../../lib/api";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export const tasksApi = {
  
  getMyTasks: async (): Promise<Task[]> => {
    const response = await api.get("/tasks/me");
    return response.data;
  },

  
  updateTaskStatus: async (id: string, status: Task['status']) => {
    const response = await api.patch(`/tasks/${id}`, { status });
    return response.data;
  }
};