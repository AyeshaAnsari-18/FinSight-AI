const ComplianceDashboard = () => {
  const monitoringData = [
    { department: "Finance", issues: 12 },
    { department: "HR", issues: 5 },
    { department: "IT", issues: 8 },
    { department: "Operations", issues: 3 },
  ];

  const controlsData = [
    { control: "Access Control", tested: 20 },
    { control: "Segregation of Duties", tested: 15 },
    { control: "Approval Workflow", tested: 25 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Compliance Dashboard</h1>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Dept Clearance Panels</h2>
          <p className="text-2xl font-bold mt-2">3 Pending Reviews</p>
          <p className="text-sm text-gray-500 mt-1">Last updated 2 hours ago</p>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Red Flags</h2>
          <p className="text-2xl font-bold mt-2">7 Active Alerts</p>
          <p className="text-sm text-gray-500 mt-1">Across all departments</p>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Compliance Reports</h2>
          <p className="text-2xl font-bold mt-2">5 Reports Generated</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Monitoring & Controls tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">Monitoring Overview</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Department</th>
                <th className="p-2 border">Issues</th>
              </tr>
            </thead>
            <tbody>
              {monitoringData.map((row) => (
                <tr key={row.department} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.department}</td>
                  <td className="p-2 border">{row.issues}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">Controls Tested</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Control</th>
                <th className="p-2 border">Tested</th>
              </tr>
            </thead>
            <tbody>
              {controlsData.map((row) => (
                <tr key={row.control} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.control}</td>
                  <td className="p-2 border">{row.tested}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policies & Regulatory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">Policies</h2>
          <ul className="list-disc ml-5 text-gray-700">
            <li>All Policies (20)</li>
            <li>Policy Details (10)</li>
            <li>Policy Violations (2)</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">Regulatory Requirements</h2>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Compliance Reports (5)</li>
            <li>Regulatory Requirements (8)</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">AI Copilot</h2>
          <p className="text-gray-700">
            Get AI assistance for policy reviews, control testing, and monitoring analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
