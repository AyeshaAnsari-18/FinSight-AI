const ComplianceOverview = () => {
  const complianceData = [
    { id: 1, issue: "Policy Violation", dept: "Finance", status: "Open" },
    { id: 2, issue: "Internal Control Gap", dept: "IT", status: "Resolved" },
    { id: 3, issue: "Incomplete Documentation", dept: "HR", status: "Pending" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Compliance Overview</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Issue</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {complianceData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2 border">{item.id}</td>
                <td className="p-2 border">{item.issue}</td>
                <td className="p-2 border">{item.dept}</td>
                <td className="p-2 border">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceOverview;
