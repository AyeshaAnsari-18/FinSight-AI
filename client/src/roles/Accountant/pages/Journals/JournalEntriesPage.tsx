import { useState } from "react";

const JournalEntriesPage = () => {
  const initialData = [
    { id: "JE-001", date: "2024-01-02", description: "Payroll Payment", debit: 5000, credit: 5000, status: "Posted" },
    { id: "JE-002", date: "2024-01-05", description: "Vendor Invoice #123", debit: 1200, credit: 1200, status: "Draft" },
    { id: "JE-003", date: "2024-01-10", description: "Accrual Adjustment", debit: 900, credit: 900, status: "Posted" },
    { id: "JE-004", date: "2024-01-12", description: "Tax Adjustment", debit: 450, credit: 450, status: "Pending" },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  const statusColor = (status: string) => {
    switch (status) {
      case "Posted":
        return "bg-green-100 text-green-700";
      case "Draft":
        return "bg-yellow-100 text-yellow-700";
      case "Pending":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filter and search
  let filteredData = initialData.filter(
    (item) =>
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
  );

  if (statusFilter !== "All") {
    filteredData = filteredData.filter((i) => i.status === statusFilter);
  }

  // Sorting
  if (sortBy === "date") {
    filteredData = filteredData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } else if (sortBy === "debit") {
    filteredData = filteredData.sort((a, b) => b.debit - a.debit);
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
          <option>All</option>
          <option>Posted</option>
          <option>Draft</option>
          <option>Pending</option>
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
              <th className="border px-4 py-2 text-left">Entry ID</th>
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
                <td className="border px-4 py-2">{entry.id}</td>
                <td className="border px-4 py-2">{entry.date}</td>
                <td className="border px-4 py-2">{entry.description}</td>
                <td className="border px-4 py-2 text-right">{entry.debit.toFixed(2)}</td>
                <td className="border px-4 py-2 text-right">{entry.credit.toFixed(2)}</td>
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
