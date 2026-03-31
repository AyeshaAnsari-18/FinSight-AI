import { useState, useEffect } from "react";
import { Repeat } from "lucide-react";
import { getReconciliations } from "../../services/auditor.api";

const formatIssueText = (notes: any) => {
  if (!notes) return "Variance detected";
  try {
    const parsed = typeof notes === 'string' ? JSON.parse(notes) : notes;
    if (Array.isArray(parsed)) {
       return parsed.join(', ');
    } else if (typeof parsed === 'object' && parsed !== null) {
       return JSON.stringify(parsed).replace(/["{}[\]]/g, '').trim();
    }
  } catch(e) {
    return String(notes).replace(/["\[\]{}]/g, '').trim();
  }
  return String(notes).replace(/["\[\]{}]/g, '').trim();
};

const ReconciliationIssues = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [issuesData, setIssuesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReconciliations()
      .then((res) => {
        const issues = res.filter((r: any) => r.status === 'DISCREPANCY' || r.status === 'PENDING');
        const mappedData = issues.map((r: any) => ({
          id: r.id.substring(0, 6).toUpperCase(),
          type: "Bank Reconciliation",
          account: "Cash Account", 
          issue: formatIssueText(r.notes),
          department: "Finance",
          date: new Date(r.month || r.createdAt).toISOString().split('T')[0],
          status: r.status === 'MATCHED' ? 'Resolved' : 'Open',
        }));
        setIssuesData(mappedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
        {loading ? (
          <div className="p-12 flex justify-center text-gray-400">Loading reconciliation issues...</div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ReconciliationIssues;
