const WhatIfAnalysis = () => {
  const analyses = [
    { id: 1, scenario: "Revenue +10%", outcome: "Profit: $480k" },
    { id: 2, scenario: "Expenses +15%", outcome: "Profit: $420k" },
    { id: 3, scenario: "Revenue -5%", outcome: "Profit: $430k" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">What-If Analysis</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Scenario</th>
              <th className="p-2 border">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2 border">{item.id}</td>
                <td className="p-2 border">{item.scenario}</td>
                <td className="p-2 border">{item.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WhatIfAnalysis;
