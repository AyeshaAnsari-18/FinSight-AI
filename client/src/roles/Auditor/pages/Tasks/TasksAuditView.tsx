import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { getTasks, createTask } from "../../services/auditor.api";

const TaskAuditView = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tasksData, setTasksData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = () => {
    setLoading(true);
    getTasks()
      .then((res) => {
        const mappedData = res.map((t: any) => ({
          id: t.id.substring(0, 6).toUpperCase(),
          task: t.title,
          assignedTo: t.assignedToId || "Unassigned",
          department: "Operations",
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : "No Due Date",
          status: t.status === 'DONE' ? 'Completed' : 'Pending',
        }));
        setTasksData(mappedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        assignedToId: formData.assignedToId || undefined
      });
      setShowModal(false);
      setFormData({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to assign task.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = tasksData.filter((item) => {
    const matchesSearch =
      item.task.toLowerCase().includes(search.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-[#0A2342]" />
          <h1 className="text-2xl font-bold text-[#0A2342]">Task Audit View</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#0A2342] text-white px-4 py-2 rounded shadow hover:bg-[#113155] transition"
        >
          Assign New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by task, assigned to, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full sm:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        {loading && tasksData.length === 0 ? (
          <div className="p-12 flex justify-center text-gray-400">Loading automated task view...</div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-[#0A2342] text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Task</th>
                <th className="py-3 px-4 text-left">Assigned To</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Due Date</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100 transition">
                    <td className="py-2 px-4">{item.id}</td>
                    <td className="py-2 px-4">{item.task}</td>
                    <td className="py-2 px-4">{item.assignedTo}</td>
                    <td className="py-2 px-4">{item.department}</td>
                    <td className="py-2 px-4">{item.dueDate}</td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        item.status === "Completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {item.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <button className="px-3 py-1 border rounded-l bg-white hover:bg-gray-100">Prev</button>
        <button className="px-3 py-1 border-t border-b bg-white hover:bg-gray-100">1</button>
        <button className="px-3 py-1 border rounded-r bg-white hover:bg-gray-100">Next</button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#0A2342]">Assign New Task</h2>
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
                  type="text" placeholder="e.g. manager@finsight.com"
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
                  {submitting ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAuditView;
