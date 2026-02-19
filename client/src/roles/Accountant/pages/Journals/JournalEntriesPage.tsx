import { useState } from "react";
import { useJournals } from "../../hooks/useJournals";

const JournalEntriesPage = () => {
  
  const { journals, loading, error } = useJournals();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  
  const statusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "POSTED":
        return "bg-green-100 text-green-700";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-700";
      case "FLAGGED": 
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  
  if (loading) return <div className="p-10 text-center">Loading Financial Data...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  
  let filteredData = journals.filter(
    (item) =>
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.reference.toLowerCase().includes(search.toLowerCase()) 
  );

  if (statusFilter !== "All") {
    
    filteredData = filteredData.filter((i) => i.status.toUpperCase() === statusFilter.toUpperCase());
  }

  
  if (sortBy === "date") {
    filteredData = filteredData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } else if (sortBy === "debit") {
    
    filteredData = filteredData.sort((a, b) => Number(b.debit) - Number(a.debit));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Journal Entries</h1>

      {/* Controls */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-wrap gap-4 items-center">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add New Journal Entry
        </button>

        <input
          type="text"
          placeholder="Search entries..."
          className="border px-3 py-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="POSTED">Posted</option>
          <option value="DRAFT">Draft</option>
          <option value="FLAGGED">Flagged (AI)</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="debit">Sort by Debit Amount</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Ref ID</th>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Description</th>
              <th className="border px-4 py-2 text-right">Debit ($)</th>
              <th className="border px-4 py-2 text-right">Credit ($)</th>
              <th className="border px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                {/* Display Reference instead of UUID for readability */}
                <td className="border px-4 py-2 text-sm">{entry.reference || entry.id.substring(0,8)}</td>
                <td className="border px-4 py-2 text-sm">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">
                  {entry.description}
                  {/* Visual indicator for AI Risk */}
                  {entry.riskScore && entry.riskScore > 50 && (
                     <span className="ml-2 text-xs text-red-500 font-bold">⚠️ Risk: {entry.riskScore}%</span>
                  )}
                </td>
                <td className="border px-4 py-2 text-right">{Number(entry.debit).toFixed(2)}</td>
                <td className="border px-4 py-2 text-right">{Number(entry.credit).toFixed(2)}</td>
                <td className="border px-4 py-2 text-center">
                  <span className={`px-3 py-1 text-sm rounded-full ${statusColor(entry.status)}`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No journal entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalEntriesPage;