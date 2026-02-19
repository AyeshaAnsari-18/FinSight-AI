import { useState } from "react";
import { LayoutDashboard } from "lucide-react";

const FullAuditTrail = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const auditData = [
    { id: 1, action: "Created Journal Entry", user: "John Doe", timestamp: "2025-11-22 10:45 AM", status: "Completed" },
    { id: 2, action: "Approved Reconciliation", user: "Jane Smith", timestamp: "2025-11-21 04:30 PM", status: "Pending" },
    { id: 3, action: "Reviewed Task", user: "Mark Taylor", timestamp: "2025-11-20 01:15 PM", status: "Completed" },
  ];

  
  const filteredData = auditData.filter((entry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.user.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? entry.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Audit Trail</h1>
      </div>

      {/* Filters / Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by action or user..."
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

      {/* Audit Trail Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-[#0A2342] text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Action</th>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Timestamp</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-2 px-4">{entry.id}</td>
                  <td className="py-2 px-4">{entry.action}</td>
                  <td className="py-2 px-4">{entry.user}</td>
                  <td className="py-2 px-4">{entry.timestamp}</td>
                  <td
                    className={`py-2 px-4 font-semibold ${
                      entry.status === "Completed" ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {entry.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FullAuditTrail;
