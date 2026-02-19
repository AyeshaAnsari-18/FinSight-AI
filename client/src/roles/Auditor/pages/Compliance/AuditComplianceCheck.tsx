import { useState } from "react";
import { CheckCircle } from "lucide-react";

const AuditComplianceCheck = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  
  const complianceData = [
    {
      id: 1,
      policy: "Data Privacy Policy",
      auditor: "John Doe",
      department: "IT",
      lastChecked: "2025-11-22",
      status: "Compliant",
    },
    {
      id: 2,
      policy: "Financial Reporting Standards",
      auditor: "Jane Smith",
      department: "Finance",
      lastChecked: "2025-11-21",
      status: "Pending",
    },
    {
      id: 3,
      policy: "Vendor Approval Policy",
      auditor: "Mark Taylor",
      department: "Procurement",
      lastChecked: "2025-11-20",
      status: "Non-Compliant",
    },
  ];

  
  const filteredData = complianceData.filter((item) => {
    const matchesSearch =
      item.policy.toLowerCase().includes(search.toLowerCase()) ||
      item.auditor.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Audit Compliance Check</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by policy, auditor, or department..."
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
          <option value="Compliant">Compliant</option>
          <option value="Non-Compliant">Non-Compliant</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Compliance Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-[#0A2342] text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Policy</th>
              <th className="py-3 px-4 text-left">Auditor</th>
              <th className="py-3 px-4 text-left">Department</th>
              <th className="py-3 px-4 text-left">Last Checked</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-2 px-4">{item.id}</td>
                  <td className="py-2 px-4">{item.policy}</td>
                  <td className="py-2 px-4">{item.auditor}</td>
                  <td className="py-2 px-4">{item.department}</td>
                  <td className="py-2 px-4">{item.lastChecked}</td>
                  <td
                    className={`py-2 px-4 font-semibold ${
                      item.status === "Compliant"
                        ? "text-green-600"
                        : item.status === "Pending"
                        ? "text-yellow-600"
                        : "text-red-600"
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

export default AuditComplianceCheck;
