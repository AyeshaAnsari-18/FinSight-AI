import { useState } from "react";

const VendorReconcilePage = () => {
  const initialData = [
    { id: "VR-001", vendor: "ABC Supplies", date: "2024-01-04", status: "Completed", variance: 0 },
    { id: "VR-002", vendor: "Global Traders Inc.", date: "2024-01-11", status: "In Progress", variance: 89.5 },
    { id: "VR-003", vendor: "Prime Manufacturing", date: "2024-01-17", status: "Variance Detected", variance: 230 },
    { id: "VR-004", vendor: "Metro Logistics", date: "2024-01-20", status: "Completed", variance: 0 },
    { id: "VR-005", vendor: "Skyline Retail", date: "2024-01-22", status: "Pending Review", variance: 45.2 },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Variance Detected":
        return "bg-red-100 text-red-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Pending Review":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filter + Search
  let filteredData = initialData.filter((item) =>
    item.vendor.toLowerCase().includes(search.toLowerCase())
  );

  if (statusFilter !== "All") {
    filteredData = filteredData.filter((item) => item.status === statusFilter);
  }

  // Sorting logic
  if (sortBy === "date") {
    filteredData = filteredData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } else if (sortBy === "variance") {
    filteredData = filteredData.sort((a, b) => b.variance - a.variance);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vendor Reconciliation</h1>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 flex gap-4 flex-wrap">

        {/* Search */}
        <input
          type="text"
          placeholder="Search vendor..."
          className="border px-3 py-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Status filter */}
        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Completed</option>
          <option>In Progress</option>
          <option>Variance Detected</option>
          <option>Pending Review</option>
        </select>

        {/* Sort */}
        <select
          className="border px-3 py-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="variance">Sort by Variance</option>
        </select>

      </div>

      {/* List */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Vendor Reconciliations</h2>

        <div className="space-y-3">
          {filteredData.map((rec) => (
            <div
              key={rec.id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{rec.id}</div>
                <div className="text-sm text-gray-600">Vendor: {rec.vendor}</div>
                <div className="text-sm text-gray-600">Date: {rec.date}</div>
                <div className="text-sm text-gray-600">
                  Variance: ${rec.variance.toFixed(2)}
                </div>
              </div>

              <div
                className={`px-3 py-1 text-sm rounded-full ${statusColor(
                  rec.status
                )}`}
              >
                {rec.status}
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            No matching vendor reconciliations found.
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorReconcilePage;
