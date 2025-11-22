const ControlEvidence = () => {
  // Dummy data for control evidence
  const evidenceData = [
    { control: "Access Control", evidenceType: "Screenshot", status: "Verified" },
    { control: "Segregation of Duties", evidenceType: "Report", status: "Pending" },
    { control: "Approval Workflow", evidenceType: "Log File", status: "Verified" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Control Evidence</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Control</th>
              <th className="p-2 border">Evidence Type</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {evidenceData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border">{row.control}</td>
                <td className="p-2 border">{row.evidenceType}</td>
                <td className="p-2 border">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlEvidence;
