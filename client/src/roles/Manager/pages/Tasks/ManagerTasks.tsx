/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { tasksApi } from "../../services/tasks.api";

const ManagerTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksApi.getMyTasks(); 
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch manager tasks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <div className="p-6 text-[#0A2342] font-bold">Loading Tasks...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Manager Tasks</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Task</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-2 border font-mono text-xs">{t.id.substring(0, 8).toUpperCase()}</td>
                <td className="p-2 border font-medium">{t.title}</td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 text-xs rounded-full ${t.priority === 'HIGH' || t.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="p-2 border">{t.status.replace('_', ' ')}</td>
                <td className="p-2 border text-gray-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={5} className="text-center p-4 text-gray-500">No pending tasks.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerTasks;