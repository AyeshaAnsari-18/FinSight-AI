const RegulatoryRequirements = () => {
  
  const requirements = [
    { id: 1, regulation: "GDPR", applicableDept: "IT", complianceStatus: "Compliant", lastReview: "2025-11-10" },
    { id: 2, regulation: "SOX", applicableDept: "Finance", complianceStatus: "Partial", lastReview: "2025-11-12" },
    { id: 3, regulation: "HIPAA", applicableDept: "HR", complianceStatus: "Non-Compliant", lastReview: "2025-11-15" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Regulatory Requirements</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Regulation</th>
              <th className="p-2 border">Applicable Department</th>
              <th className="p-2 border">Compliance Status</th>
              <th className="p-2 border">Last Review</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="p-2 border">{req.id}</td>
                <td className="p-2 border">{req.regulation}</td>
                <td className="p-2 border">{req.applicableDept}</td>
                <td className="p-2 border">{req.complianceStatus}</td>
                <td className="p-2 border">{req.lastReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegulatoryRequirements;
