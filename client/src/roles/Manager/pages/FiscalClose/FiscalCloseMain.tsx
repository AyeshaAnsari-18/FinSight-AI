/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { runFiscalAgentFrontend } from "../../services/FiscalApi";

const FiscalCloseMain = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await runFiscalAgentFrontend();
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to connect to the AI Orchestrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      
      {/* 🌟 Header & Agent Description */}
      <div className="bg-white shadow-lg rounded-xl p-8 border-l-8 border-[#3b165f]">
        <h1 className="text-3xl font-extrabold text-[#3b165f] mb-3">AI Fiscal Close Orchestrator</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          This system utilizes a multi-node LangGraph AI architecture. When triggered, the <strong>Journal Auditor Agent</strong> and <strong>Compliance Task Agent</strong> will scan the live database for anomalies, incomplete tasks, and draft entries. Finally, the <strong>AI CFO</strong> will evaluate their findings and generate a real-time Readiness Score.
        </p>
        
        <button
          onClick={handleGenerate}
          className="bg-[#6a0dad] hover:bg-[#580aaf] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 w-full md:w-auto justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing Multi-Agent Audit...
            </>
          ) : (
            <>
              <span>⚡</span> Run Automated Fiscal Close
            </>
          )}
        </button>
      </div>

      {/* 🚨 Error Handling */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r shadow-sm flex items-center gap-3 text-red-700">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold">Pipeline Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 📊 AI Results Render */}
      {result && (
        <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden transform transition-all animate-fade-in-up">
          
          {/* Result Header */}
          <div className="bg-[#3b165f] px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span>🤖</span> CFO Evaluation Report
            </h2>
            <div className="bg-white px-6 py-2 rounded-full flex items-center gap-3 shadow-inner">
              <span className="text-sm font-bold text-gray-500 tracking-wider uppercase">Readiness Score</span>
              <span className={`text-3xl font-black ${result.readiness_score > 80 ? 'text-green-600' : result.readiness_score > 50 ? 'text-yellow-500' : 'text-red-600'}`}>
                {result.readiness_score}/100
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Executive Summary */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📄</span> Executive Summary
              </h3>
              <div className="bg-[#f5f1ff] p-6 rounded-xl border border-purple-100 shadow-inner">
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                  {result.narrative}
                </p>
              </div>
            </section>

            {/* Blockers / Issues */}
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🛑</span> Outstanding Blockers
              </h3>
              
              {result.issues && result.issues.length > 0 ? (
                <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                  <ul className="space-y-3">
                    {result.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-red-800 font-medium bg-white p-3 rounded shadow-sm">
                        <span className="mt-0.5 text-red-500">❌</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 flex items-center gap-4 shadow-sm">
                  <span className="text-4xl">✅</span>
                  <div>
                    <h4 className="text-green-800 font-bold text-lg">Clear to Close</h4>
                    <p className="text-green-700">No blocking issues found. All tasks and journals are resolved.</p>
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>
      )}

    </div>
  );
};

export default FiscalCloseMain;