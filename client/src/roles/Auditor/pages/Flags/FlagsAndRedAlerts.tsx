import { useState } from "react";
import { AlertTriangle } from "lucide-react";

const FlagsAndRedAlerts = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sample dummy flags / alerts data
  const alertsData = [
    { id: 1, alert: "Missing invoice approval", department: "Finance", raisedBy: "John Doe", date: "2025-11-22", severity: "High" },
    { id: 2, alert: "Unreconciled bank transactions", department: "Accounts Payable", raisedBy: "Jane Smith", date: "2025-11-21", severity: "Medium" },
    { id: 3, alert: "Expired contract not renewed", department: "Procurement", raisedBy: "Mark Taylor", date: "2025-11-20", severity: "Low" },
  ];

  // Filtered data
  const filteredData = alertsData.filter((item) => {
    const matchesSearch =
      item.alert.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase()) ||
      item.raisedBy.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.severity === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Flags & Red Alerts</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by alert, department, or raised by..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full sm:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-[#0A2342] text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Alert</th>
              <th className="py-3 px-4 text-left">Department</th>
              <th className="py-3 px-4 text-left">Raised By</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Severity</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-2 px-4">{item.id}</td>
                  <td className="py-2 px-4">{item.alert}</td>
                  <td className="py-2 px-4">{item.department}</td>
                  <td className="py-2 px-4">{item.raisedBy}</td>
                  <td className="py-2 px-4">{item.date}</td>
                  <td
                    className={`py-2 px-4 font-semibold ${
                      item.severity === "High"
                        ? "text-red-600"
                        : item.severity === "Medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.severity}
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

export default FlagsAndRedAlerts;
