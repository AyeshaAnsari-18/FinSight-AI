import { useState } from "react";
import { Repeat } from "lucide-react";

const ReconciliationReview = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const reviewData = [
    { id: 1, type: "Bank Reconciliation", reviewer: "John Doe", reviewDate: "2025-11-22", status: "Approved" },
    { id: 2, type: "Vendor Reconciliation", reviewer: "Jane Smith", reviewDate: "2025-11-21", status: "Pending" },
    { id: 3, type: "Bank Reconciliation", reviewer: "Mark Taylor", reviewDate: "2025-11-20", status: "Rejected" },
  ];

  const filteredData = reviewData.filter((item) => {
    const matchesSearch =
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.reviewer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Repeat className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Reconciliation Review</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by type or reviewer..."
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
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-[#0A2342] text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Reviewer</th>
              <th className="py-3 px-4 text-left">Review Date</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-2 px-4">{item.id}</td>
                  <td className="py-2 px-4">{item.type}</td>
                  <td className="py-2 px-4">{item.reviewer}</td>
                  <td className="py-2 px-4">{item.reviewDate}</td>
                  <td
                    className={`py-2 px-4 font-semibold ${
                      item.status === "Approved"
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
                <td colSpan={5} className="py-4 text-center text-gray-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReconciliationReview;
