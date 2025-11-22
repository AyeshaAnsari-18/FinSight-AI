const AuditTrail = () => {
  const auditTrailData = [
    { id: 1, user: "Alice", action: "Approved Report", date: "2025-11-18" },
    { id: 2, user: "Bob", action: "Reviewed Task", date: "2025-11-17" },
    { id: 3, user: "Charlie", action: "Closed Fiscal Period", date: "2025-11-16" },
    { id: 4, user: "David", action: "Updated Compliance", date: "2025-11-15" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Audit Trail</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {auditTrailData.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="p-2 border">{entry.id}</td>
                <td className="p-2 border">{entry.user}</td>
                <td className="p-2 border">{entry.action}</td>
                <td className="p-2 border">{entry.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;
