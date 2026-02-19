/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { reconcileApi } from "../../services/reconcile.api";



const BankReconcilePage = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  
  const [bankBalance, setBankBalance] = useState("");
  const [ledgerBalance, setLedgerBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [runningAI, setRunningAI] = useState(false);

  const fetchRecords = async () => {
    try {
      const data = await reconcileApi.getReconciliations();
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch reconciliations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleRunAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunningAI(true);
    try {
      await reconcileApi.runReconciliation({
        month: new Date().toISOString(),
        bankBalance: Number(bankBalance),
        ledgerBalance: Number(ledgerBalance),
        notes: notes
      });
      
      setBankBalance("");
      setLedgerBalance("");
      setNotes("");
      await fetchRecords();
    } catch (error) {
      alert("AI Analysis failed. Check console.");
    } finally {
      setRunningAI(false);
    }
  };

  if (loading) return <div className="p-10">Loading Reconciliations...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bank Reconciliation (AI Assisted)</h1>

      {/* AI Trigger Form */}
      <form onSubmit={handleRunAI} className="bg-white p-6 shadow rounded-lg flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600">Bank Balance ($)</label>
          <input type="number" required value={bankBalance} onChange={e => setBankBalance(e.target.value)} className="border p-2 rounded w-40" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Ledger Balance ($)</label>
          <input type="number" required value={ledgerBalance} onChange={e => setLedgerBalance(e.target.value)} className="border p-2 rounded w-40" />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Context Notes (for AI)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Missing deposit from TechCorp..." className="border p-2 rounded w-full" />
        </div>
        <button type="submit" disabled={runningAI} className="bg-[#6a0dad] text-white px-6 py-2 rounded hover:bg-[#580aaf] transition disabled:opacity-50">
          {runningAI ? "AI Analyzing..." : "Run AI Reconciliation"}
        </button>
      </form>

      {/* Display Results */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Reconciliation History</h2>
        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec.id} className={`p-4 border-l-4 rounded bg-gray-50 ${rec.status === 'MATCHED' ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-700">{new Date(rec.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                <span className={`px-3 py-1 text-xs rounded-full ${rec.status === 'MATCHED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{rec.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Bank: <span className="font-mono">${Number(rec.bankBalance).toFixed(2)}</span></div>
                <div>Ledger: <span className="font-mono">${Number(rec.ledgerBalance).toFixed(2)}</span></div>
                <div>Variance: <span className="font-mono font-bold text-red-600">${Number(rec.variance).toFixed(2)}</span></div>
              </div>
              {/* AI Discrepancy Notes */}
             {/* AI Discrepancy Notes - CLEANED UP UI */}
              {rec.status === 'DISCREPANCY' && rec.notes && (
                <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded border border-red-100 shadow-sm">
                  <strong className="text-red-800 flex items-center gap-1">
                    <span className="text-lg">🤖</span> AI Analysis:
                  </strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    {(() => {
                      try {
                        
                        const parsedNotes = JSON.parse(rec.notes);
                        if (Array.isArray(parsedNotes)) {
                          return parsedNotes.map((note, idx) => (
                            <li key={idx} className="text-gray-700">{note}</li>
                          ));
                        }
                        
                        return <li className="text-gray-700">{rec.notes}</li>;
                      } catch {
                        
                        return <li className="text-gray-700">{rec.notes}</li>;
                      }
                    })()}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {records.length === 0 && <p className="text-gray-500 text-center">No reconciliations run yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default BankReconcilePage;