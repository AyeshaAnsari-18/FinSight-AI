import { useState } from "react";

const MyReportsPage = () => {
  const initialReports = [
    {
      id: "RPT-001",
      name: "Monthly Financial Report",
      month: "January 2024",
      revenue: 15000,
      expenses: 8000,
      status: "Completed",
    },
    {
      id: "RPT-002",
      name: "Monthly Financial Report",
      month: "February 2024",
      revenue: 18000,
      expenses: 9500,
      status: "Completed",
    },
    {
      id: "RPT-003",
      name: "Monthly Financial Report",
      month: "March 2024",
      revenue: 16000,
      expenses: 8700,
      status: "Pending",
    },
    {
      id: "RPT-004",
      name: "Quarterly Summary",
      month: "Q1 2024",
      revenue: 49000,
      expenses: 26000,
      status: "Completed",
    },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredReports = initialReports.filter(
  (report) =>
    (report.id.toLowerCase().includes(search.toLowerCase()) ||
     report.name.toLowerCase().includes(search.toLowerCase()) ||
     report.month.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "All" || report.status === statusFilter)
);


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Reports</h1>

      {/* Controls */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search reports..."
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
          <option>Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Report ID</th>
              <th className="border px-4 py-2 text-left">Report Name</th>
              <th className="border px-4 py-2 text-left">Month / Quarter</th>
              <th className="border px-4 py-2 text-right">Revenue ($)</th>
              <th className="border px-4 py-2 text-right">Expenses ($)</th>
              <th className="border px-4 py-2 text-right">Net Profit ($)</th>
              <th className="border px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{report.id}</td>
                <td className="border px-4 py-2">{report.name}</td>
                <td className="border px-4 py-2">{report.month}</td>
                <td className="border px-4 py-2 text-right">{report.revenue.toLocaleString()}</td>
                <td className="border px-4 py-2 text-right">{report.expenses.toLocaleString()}</td>
                <td className="border px-4 py-2 text-right">
                  {(report.revenue - report.expenses).toLocaleString()}
                </td>
                <td className="border px-4 py-2 text-center">
                  <span className={`px-3 py-1 text-sm rounded-full ${statusColor(report.status)}`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyReportsPage;
