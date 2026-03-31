import { useState, useEffect } from "react";
import { LayoutDashboard } from "lucide-react";
import { getAuditorDepartmentOverview } from "../../services/auditor.api";

const DepartmentAuditOverview = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentAudits, setDepartmentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditorDepartmentOverview()
      .then((res) => {
        setDepartmentAudits(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredData = departmentAudits.filter((item) => {
    const matchesSearch =
      item.department.toLowerCase().includes(search.toLowerCase()) ||
      item.auditor.toLowerCase().includes(search.toLowerCase()) ||
      item.findings.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Department Audit Overview</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by department, auditor, or findings..."
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

      {/* Department Audit Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center text-gray-400">Loading department overview...</div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-[#0A2342] text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Auditor</th>
                <th className="py-3 px-4 text-left">Last Audit</th>
                <th className="py-3 px-4 text-left">Findings</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100 transition">
                    <td className="py-2 px-4">{item.id}</td>
                    <td className="py-2 px-4">{item.department}</td>
                    <td className="py-2 px-4">{item.auditor}</td>
                    <td className="py-2 px-4">{item.lastAudit}</td>
                    <td className="py-2 px-4">{item.findings}</td>
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
    </div>
  );
};

export default DepartmentAuditOverview;
