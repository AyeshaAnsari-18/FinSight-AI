/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { tasksApi, type Task } from "../services/tasks.api";

export const useAccountantTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getMyTasks();
      setTasks(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateStatus = async (id: string, status: Task['status']) => {
    try {
      await tasksApi.updateTaskStatus(id, status);
      await fetchTasks(); 
    } catch (err) {
      alert("Failed to update task status.");
    }
  };

  return { tasks, loading, error, updateStatus, refetch: fetchTasks };
};
