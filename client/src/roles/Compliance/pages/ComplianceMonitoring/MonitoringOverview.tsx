const MonitoringOverview = () => {
  // Dummy monitoring data
  const monitoringData = [
    { department: "Finance", totalChecks: 25, passed: 20, failed: 5 },
    { department: "HR", totalChecks: 15, passed: 12, failed: 3 },
    { department: "IT", totalChecks: 18, passed: 16, failed: 2 },
    { department: "Operations", totalChecks: 10, passed: 9, failed: 1 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Monitoring Overview</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Total Checks</th>
              <th className="p-2 border">Passed</th>
              <th className="p-2 border">Failed</th>
            </tr>
          </thead>
          <tbody>
            {monitoringData.map((row) => (
              <tr key={row.department} className="hover:bg-gray-50">
                <td className="p-2 border">{row.department}</td>
                <td className="p-2 border">{row.totalChecks}</td>
                <td className="p-2 border">{row.passed}</td>
                <td className="p-2 border">{row.failed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonitoringOverview;
