/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { forecastApi } from "../../services/forecast.api";

const WhatIfAnalysis = () => {
  const [analyses, setAnalyses] = useState<any[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWhatIfs(false);
  }, []);

  const fetchWhatIfs = async (force: boolean) => {
    setLoading(true);
    try {
      const data = await forecastApi.getWhatIfs(force);
      setAnalyses(data.analyses);
      setLastUpdated(data.lastUpdated);
    } catch (error) {
      console.error("AI What-If failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2342]">AI What-If Analysis</h1>
          <p className="text-gray-600">
             {lastUpdated ? `Last synchronized with AI on: ${new Date(lastUpdated).toLocaleString()}` : 'No scenarios modeled yet.'}
          </p>
        </div>
        
        {/* 🛡️ MANUAL TRIGGER BUTTON */}
        <button 
          onClick={() => fetchWhatIfs(true)}
          disabled={loading}
          className="bg-[#0A2342] hover:bg-[#133863] text-white px-4 py-2 rounded shadow transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? "🧠 Modeling..." : "🔄 Run AI Scenarios"}
        </button>
      </div>

      {loading && !analyses ? (
         <div className="p-10 text-center text-gray-500 font-bold">Financial Strategist Agent is thinking...</div>
      ) : analyses && analyses.length > 0 ? (
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Trigger Scenario</th>
                <th className="p-2 border">Financial Outcome</th>
                <th className="p-2 border w-1/2">Strategic AI Insight</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border font-bold text-red-800 bg-red-50">{item.scenario}</td>
                  <td className="p-2 border font-medium text-[#0A2342]">{item.outcome}</td>
                  <td className="p-2 border text-gray-600 text-sm bg-blue-50/30">{item.insight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-10 text-center rounded shadow border border-gray-200">
          <p className="text-gray-500">Click the button above to run the LangChain strategist.</p>
        </div>
      )}
    </div>
  );
};

export default WhatIfAnalysis;