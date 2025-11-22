import { useState } from "react";
import { Repeat } from "lucide-react";

const ReconciliationIssues = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const issuesData = [
    { id: 1, type: "Bank Reconciliation", account: "Cash Account", issue: "Unmatched transaction", department: "Finance", date: "2025-11-22", status: "Open" },
    { id: 2, type: "Vendor Reconciliation", account: "Vendor A", issue: "Payment missing", department: "Procurement", date: "2025-11-21", status: "Open" },
    { id: 3, type: "Bank Reconciliation", account: "Checking Account", issue: "Duplicate entry", department: "Finance", date: "2025-11-20", status: "Resolved" },
  ];

  const filteredData = issuesData.filter((item) => {
    const matchesSearch =
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.account.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase()) ||
      item.issue.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Repeat className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Reconciliation Issues</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by type, account, issue, or department..."
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
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-[#0A2342] text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Account</th>
              <th className="py-3 px-4 text-left">Issue</th>
              <th className="py-3 px-4 text-left">Department</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-2 px-4">{item.id}</td>
                  <td className="py-2 px-4">{item.type}</td>
                  <td className="py-2 px-4">{item.account}</td>
                  <td className="py-2 px-4">{item.issue}</td>
                  <td className="py-2 px-4">{item.department}</td>
                  <td className="py-2 px-4">{item.date}</td>
                  <td className={`py-2 px-4 font-semibold ${item.status === "Open" ? "text-yellow-600" : "text-green-600"}`}>
                    {item.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReconciliationIssues;
