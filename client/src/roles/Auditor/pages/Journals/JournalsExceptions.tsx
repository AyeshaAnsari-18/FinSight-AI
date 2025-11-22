import { useState } from "react";
import { Book } from "lucide-react";

const JournalsExceptions = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const exceptionsData = [
    { id: 1, journal: "Sales Journal", issue: "Duplicate entry", user: "John Doe", date: "2025-11-22", severity: "High" },
    { id: 2, journal: "Purchase Journal", issue: "Incorrect amount", user: "Jane Smith", date: "2025-11-21", severity: "Medium" },
    { id: 3, journal: "Cash Receipts Journal", issue: "Missing entry", user: "Mark Taylor", date: "2025-11-20", severity: "High" },
  ];

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
      </div>
    </div>
  );
};

export default JournalsExceptions;
