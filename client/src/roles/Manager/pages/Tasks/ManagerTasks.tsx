/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { tasksApi } from "../../services/tasks.api";
import { CheckCircle } from "lucide-react";

const ManagerTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getMyTasks(); 
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch manager tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCompleteTask = async (id: string) => {
    try {
      await tasksApi.updateTask(id, 'DONE');
      await fetchTasks();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // NOTE: We're reusing updateTask's pattern, but we need createTask in tasksApi.
      // If createTask doesn't exist on tasksApi, we'll need to use api.post
      await tasksApi.createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        assignedToId: formData.assignedToId || undefined
      });
      setShowModal(false);
      setFormData({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to assign task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && tasks.length === 0) return <div className="p-6 text-[#0A2342] font-bold">Loading Tasks...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0A2342]">Manager Tasks</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#0A2342] text-white px-4 py-2 rounded shadow hover:bg-[#113155] transition"
        >
          Delegate Task
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Task</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border text-right">Action</th>
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
                <td className="p-2 border text-right">
                  {t.status !== 'DONE' && (
                    <button
                      onClick={() => handleCompleteTask(t.id)}
                      className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={6} className="text-center p-4 text-gray-500">No pending tasks.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#0A2342]">Delegate New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Title</label>
                <input 
                  type="text" required 
                  className="w-full border p-2 rounded mt-1" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded mt-1" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select 
                    className="w-full border p-2 rounded mt-1" 
                    value={formData.priority} 
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input 
                    type="date" required
                    className="w-full border p-2 rounded mt-1" 
                    value={formData.dueDate} 
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To (User ID / Email)</label>
                <input 
                  type="text" placeholder="e.g. accountant@finsight.com"
                  className="w-full border p-2 rounded mt-1" 
                  value={formData.assignedToId} 
                  onChange={(e) => setFormData({...formData, assignedToId: e.target.value})} 
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-4 py-2 bg-[#0A2342] text-white rounded hover:bg-[#113155] transition disabled:opacity-50"
                >
                  {submitting ? "Delegating..." : "Delegate Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTasks;