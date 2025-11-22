const ForecastScenarios = () => {
  const forecasts = [
    { id: 1, scenario: "Best Case", revenue: "$500k", expenses: "$300k" },
    { id: 2, scenario: "Worst Case", revenue: "$350k", expenses: "$400k" },
    { id: 3, scenario: "Most Likely", revenue: "$450k", expenses: "$350k" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Forecast Scenarios</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Scenario</th>
              <th className="p-2 border">Revenue</th>
              <th className="p-2 border">Expenses</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="p-2 border">{f.id}</td>
                <td className="p-2 border">{f.scenario}</td>
                <td className="p-2 border">{f.revenue}</td>
                <td className="p-2 border">{f.expenses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForecastScenarios;
