import { useState } from "react";
import { CheckCircle } from "lucide-react";

const TaskAuditView = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  
  const tasksData = [
    { id: 1, task: "Accrual Adjustments", assignedTo: "John Doe", department: "Finance", dueDate: "2025-11-25", status: "Completed" },
    { id: 2, task: "Tax Adjustments", assignedTo: "Jane Smith", department: "Finance", dueDate: "2025-11-28", status: "Pending" },
    { id: 3, task: "Bank Reconciliation Review", assignedTo: "Mark Taylor", department: "Accounts Payable", dueDate: "2025-11-24", status: "Completed" },
  ];

  
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
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Task Audit View</h1>
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
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <button className="px-3 py-1 border rounded-l bg-white hover:bg-gray-100">Prev</button>
        <button className="px-3 py-1 border-t border-b bg-white hover:bg-gray-100">1</button>
        <button className="px-3 py-1 border rounded-r bg-white hover:bg-gray-100">Next</button>
      </div>
    </div>
  );
};

export default TaskAuditView;
