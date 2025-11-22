const NarrativeReports = () => {
  const reports = [
    { id: 1, title: "Q3 Financial Summary", author: "Alice", status: "Completed" },
    { id: 2, title: "Operational Insights", author: "Bob", status: "Draft" },
    { id: 3, title: "Compliance Overview", author: "Charlie", status: "Completed" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Narrative Reports</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Author</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-2 border">{r.id}</td>
                <td className="p-2 border">{r.title}</td>
                <td className="p-2 border">{r.author}</td>
                <td className="p-2 border">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NarrativeReports;
