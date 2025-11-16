import { useState } from "react";

const TaxAdjustmentPage = () => {
  const initialData = [
    { id: "TX-201", category: "GST Adjustment", date: "2024-01-02", status: "Completed", amount: 300 },
    { id: "TX-202", category: "Corporate Tax True-up", date: "2024-01-15", status: "Variance Detected", amount: 1200 },
    { id: "TX-203", category: "Withholding Adjustment", date: "2024-01-21", status: "In Progress", amount: 450 },
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
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Search by category or ID
  let filteredData = initialData.filter(
    (item) =>
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
  );

  // Filter
  if (statusFilter !== "All") {
    filteredData = filteredData.filter((i) => i.status === statusFilter);
  }

  // Sort
  if (sortBy === "date") {
    filteredData = filteredData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } else if (sortBy === "amount") {
    filteredData = filteredData.sort((a, b) => b.amount - a.amount);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tax Adjustments</h1>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 flex gap-4 flex-wrap">

        <input
          type="text"
          placeholder="Search tax adjustments..."
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
          <option>Completed</option>
          <option>In Progress</option>
          <option>Variance Detected</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

      </div>

      {/* List */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Tax Adjustments</h2>

        <div className="space-y-3">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{item.id}</div>
                <div className="text-sm text-gray-600">{item.category}</div>
                <div className="text-sm text-gray-600">Date: {item.date}</div>
                <div className="text-sm text-gray-600">
                  Amount: ${item.amount.toFixed(2)}
                </div>
              </div>

              <div
                className={`px-3 py-1 text-sm rounded-full ${statusColor(
                  item.status
                )}`}
              >
                {item.status}
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No tax adjustments found.
          </p>
        )}
      </div>
    </div>
  );
};

export default TaxAdjustmentPage;
