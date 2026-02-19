/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { forecastApi } from "../../services/forecast.api";

const ForecastScenarios = () => {
  const [forecasts, setForecasts] = useState<any[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    fetchPredictiveData(false);
  }, []);

  const fetchPredictiveData = async (force: boolean) => {
    setLoading(true);
    try {
      const data = await forecastApi.getPredictions(force);
      setForecasts(data.forecasts);
      setLastUpdated(data.lastUpdated);
    } catch (error) {
      console.error("AI Forecasting failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2342]">AI Predictive Forecasts</h1>
          <p className="text-gray-600">
            {lastUpdated ? `Last synchronized with AI on: ${new Date(lastUpdated).toLocaleString()}` : 'No forecast generated yet.'}
          </p>
        </div>
        
        {/* 🛡️ MANUAL TRIGGER BUTTON */}
        <button 
          onClick={() => fetchPredictiveData(true)}
          disabled={loading}
          className="bg-[#6a0dad] hover:bg-[#580aaf] text-white px-4 py-2 rounded shadow transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? "🤖 AI Calculating..." : "🔄 Re-Analyze Live Data"}
        </button>
      </div>
      
      {loading && !forecasts ? (
         <div className="p-10 text-center text-gray-500 font-bold">Querying AI Engine...</div>
      ) : forecasts && forecasts.length > 0 ? (
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Scenario</th>
                <th className="p-2 border">Projected Revenue</th>
                <th className="p-2 border">Projected Expenses</th>
                <th className="p-2 border w-1/2">AI Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border font-bold text-[#0A2342]">{f.scenario}</td>
                  <td className="p-2 border text-green-700 font-medium">${f.revenue.toLocaleString()}</td>
                  <td className="p-2 border text-red-600 font-medium">${f.expenses.toLocaleString()}</td>
                  <td className="p-2 border text-gray-600 text-sm">{f.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-10 text-center rounded shadow border border-gray-200">
          <p className="text-gray-500">Click the button above to generate the first AI forecast.</p>
        </div>
      )}
    </div>
  );
};

export default ForecastScenarios;