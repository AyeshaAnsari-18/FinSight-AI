const RedFlags = () => {
  // Dummy data for red flags (7 as on dashboard)
  const redFlags = [
    { id: 1, department: "Finance", issue: "Unauthorized transaction", date: "2025-11-20" },
    { id: 2, department: "HR", issue: "Incomplete employee records", date: "2025-11-18" },
    { id: 3, department: "IT", issue: "Access violation", date: "2025-11-19" },
    { id: 4, department: "Operations", issue: "Delayed report submission", date: "2025-11-17" },
    { id: 5, department: "Finance", issue: "Reconciliation mismatch", date: "2025-11-16" },
    { id: 6, department: "IT", issue: "Missing audit logs", date: "2025-11-15" },
    { id: 7, department: "HR", issue: "Policy violation", date: "2025-11-14" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Red Flags</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Issue</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {redFlags.map((flag) => (
              <tr key={flag.id} className="hover:bg-gray-50">
                <td className="p-2 border">{flag.id}</td>
                <td className="p-2 border">{flag.department}</td>
                <td className="p-2 border">{flag.issue}</td>
                <td className="p-2 border">{flag.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RedFlags;
