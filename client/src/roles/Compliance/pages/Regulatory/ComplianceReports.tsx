const ComplianceReports = () => {
  // Dummy compliance report data
  const reports = [
    { id: 1, title: "Quarterly IT Compliance", department: "IT", status: "Completed", date: "2025-11-15" },
    { id: 2, title: "HR Policy Review", department: "HR", status: "In Progress", date: "2025-11-18" },
    { id: 3, title: "Finance Audit", department: "Finance", status: "Pending", date: "2025-11-20" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Compliance Reports</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="p-2 border">{report.id}</td>
                <td className="p-2 border">{report.title}</td>
                <td className="p-2 border">{report.department}</td>
                <td className="p-2 border">{report.status}</td>
                <td className="p-2 border">{report.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceReports;
