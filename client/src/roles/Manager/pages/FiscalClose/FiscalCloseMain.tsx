const FiscalCloseMain = () => {
  const fiscalSummary = [
    { id: 1, period: "October 2025", status: "Closed" },
    { id: 2, period: "November 2025", status: "Pending" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Fiscal Close Main</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Period</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {fiscalSummary.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2 border">{item.id}</td>
                <td className="p-2 border">{item.period}</td>
                <td className="p-2 border">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FiscalCloseMain;
