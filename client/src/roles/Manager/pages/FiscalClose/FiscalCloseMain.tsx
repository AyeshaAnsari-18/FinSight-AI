// src/roles/manager/pages/FiscalCloseMain.tsx

import { useState } from "react";
import { runFiscalAgentFrontend } from "../../services/FiscalApi";

const dummyFiscalJson = {
  months: [
    { month: "January", income: 12000, expense: 8000 },
    { month: "February", income: 15000, expense: 7000 },
    { month: "March", income: 13000, expense: 9000 },
    { month: "April", income: 14000, expense: 8500 },
    { month: "May", income: 16000, expense: 9500 },
    { month: "June", income: 15500, expense: 9000 },
    { month: "July", income: 17000, expense: 10000 },
    { month: "August", income: 16500, expense: 9500 },
    { month: "September", income: 17500, expense: 10500 },
    { month: "October", income: 18000, expense: 11000 },
    { month: "November", income: 18500, expense: 1500 },
    { month: "December", income: 20000, expense: 12000 }
  ]
};

const FiscalCloseMain = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await runFiscalAgentFrontend(dummyFiscalJson);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fiscal Close</h1>

      {/* 1️⃣ Show Monthly JSON Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Monthly Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Month</th>
                <th className="px-4 py-2 border">Income</th>
                <th className="px-4 py-2 border">Expense</th>
              </tr>
            </thead>
            <tbody>
              {dummyFiscalJson.months.map((m) => (
                <tr key={m.month}>
                  <td className="px-4 py-2 border">{m.month}</td>
                  <td className="px-4 py-2 border">${m.income.toLocaleString()}</td>
                  <td className="px-4 py-2 border">${m.expense.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2️⃣ Button to Generate Fiscal Report */}
      <div className="mb-4">
        <button
          onClick={handleGenerate}
          className="bg-purple-700 text-white px-4 py-2 rounded shadow"
          disabled={loading}
        >
          {loading ? "Processing..." : "Generate Fiscal Close Report"}
        </button>
      </div>

      {/* 3️⃣ Show Result */}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}

      {result && (
        <div className="mt-5 p-4 bg-white shadow rounded">
          <h2 className="text-xl font-semibold mb-2">Fiscal Summary</h2>

          <div className="mb-4">
            <strong>Total Income:</strong> ${result.total_income.toLocaleString()} <br />
            <strong>Total Expense:</strong> ${result.total_expense.toLocaleString()} <br />
            <strong>Profit / Loss:</strong> ${result.profit_loss.toLocaleString()}
          </div>

          <h3 className="mt-4 font-semibold">KPIs</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">Average Monthly Income</td>
                  <td className="px-4 py-2 border">${result.kpis.avg_monthly_income.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Average Monthly Expense</td>
                  <td className="px-4 py-2 border">${result.kpis.avg_monthly_expense.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Highest Income Month</td>
                  <td className="px-4 py-2 border">{result.kpis.highest_income_month}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Highest Expense Month</td>
                  <td className="px-4 py-2 border">{result.kpis.highest_expense_month}</td>
                </tr>
                {result.kpis.profit_margin !== undefined && (
                  <tr>
                    <td className="px-4 py-2 border">Profit Margin (%)</td>
                    <td className="px-4 py-2 border">{result.kpis.profit_margin}%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 className="mt-4 font-semibold">Summary</h3>
          <p className="bg-gray-100 p-2 rounded text-sm">{result.summary}</p>
        </div>
      )}
    </div>
  );
};

export default FiscalCloseMain;
