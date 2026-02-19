const PolicyViolations = () => {
  
  const violations = [
    { id: 1, policy: "Data Privacy Policy", department: "IT", issue: "Unauthorized access", date: "2025-11-18" },
    { id: 2, policy: "Employee Conduct Policy", department: "HR", issue: "Late submission of reports", date: "2025-11-16" },
    { id: 3, policy: "Financial Reporting Policy", department: "Finance", issue: "Incorrect ledger entry", date: "2025-11-15" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Policy Violations</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Policy</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Issue</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="p-2 border">{v.id}</td>
                <td className="p-2 border">{v.policy}</td>
                <td className="p-2 border">{v.department}</td>
                <td className="p-2 border">{v.issue}</td>
                <td className="p-2 border">{v.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PolicyViolations;
