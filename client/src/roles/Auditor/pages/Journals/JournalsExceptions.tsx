import { useState, useEffect } from "react";
import { Book } from "lucide-react";
import { getJournals } from "../../services/auditor.api";

const JournalsExceptions = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [exceptionsData, setExceptionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJournals()
      .then((res) => {
        const exceptions = res.filter((j: any) => j.status === 'FLAGGED' || j.status === 'REJECTED');
        const mappedData = exceptions.map((j: any) => ({
          id: j.id.substring(0, 6).toUpperCase(),
          journal: j.description || "System Journal",
          issue: j.flagReason || "Validation Error",
          user: j.reference || "Unknown",
          date: new Date(j.date).toISOString().split('T')[0],
          severity: j.riskScore && j.riskScore > 80 ? "High" : "Medium",
        }));
        setExceptionsData(mappedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredData = exceptionsData.filter((item) => {
    const matchesSearch =
      item.journal.toLowerCase().includes(search.toLowerCase()) ||
      item.issue.toLowerCase().includes(search.toLowerCase()) ||
      item.user.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter ? item.severity === severityFilter : true;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Journals Exceptions</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by journal, issue, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full sm:w-1/3"
        />
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
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
        {loading ? (
          <div className="p-12 flex justify-center text-gray-400">Loading journal exceptions...</div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-[#0A2342] text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Journal</th>
                <th className="py-3 px-4 text-left">Issue</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100 transition">
                    <td className="py-2 px-4">{item.id}</td>
                    <td className="py-2 px-4">{item.journal}</td>
                    <td className="py-2 px-4">{item.issue}</td>
                    <td className="py-2 px-4">{item.user}</td>
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
                  <td colSpan={6} className="py-4 text-center text-gray-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default JournalsExceptions;
