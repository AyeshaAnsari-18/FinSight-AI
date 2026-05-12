import { useState, useEffect } from "react";
import { reconcileApi } from "../../services/reconcile.api";
import { Loader2 } from "lucide-react";

interface ReconcileRecord {
  id: string;
  month: string;
  bankBalance: number; 
  ledgerBalance: number;
  variance: number;
  status: string;
}

const VendorReconcilePage = () => {
  const [data, setData] = useState<ReconcileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [vendorBalance, setVendorBalance] = useState("");
  const [ledgerBalance, setLedgerBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [runningAI, setRunningAI] = useState(false);

  const fetchReconciliations = async () => {
    try {
      const response = await reconcileApi.getReconciliations();
      setData(response);
    } catch (error) {
      console.error("Failed to fetch reconciliations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliations();
  }, []);

  const handleRunAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunningAI(true);
    try {
      await reconcileApi.runReconciliation({
        month: new Date().toISOString(),
        bankBalance: Number(vendorBalance),
        ledgerBalance: Number(ledgerBalance),
        notes: notes
      });
      
      setVendorBalance("");
      setLedgerBalance("");
      setNotes("");
      await fetchReconciliations();
    } catch (error) {
      alert("AI Analysis failed. Check console.");
    } finally {
      setRunningAI(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "MATCHED") return "bg-green-100 text-green-700";
    if (status === "DISCREPANCY") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const filteredData = data.filter((item) =>
    (statusFilter === "All" || item.status === statusFilter) &&
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#1D4ED8]" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vendor/Ledger Reconciliation (AI Assisted)</h1>
      
      {/* AI Trigger Form */}
      <form onSubmit={handleRunAI} className="bg-white p-6 shadow rounded-lg flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600">Vendor Balance ($)</label>
          <input type="number" required value={vendorBalance} onChange={e => setVendorBalance(e.target.value)} className="border p-2 rounded w-40" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Ledger Balance ($)</label>
          <input type="number" required value={ledgerBalance} onChange={e => setLedgerBalance(e.target.value)} className="border p-2 rounded w-40" />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Context Notes (for AI)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Missing vendor payment receipt..." className="border p-2 rounded w-full" />
        </div>
        <button type="submit" disabled={runningAI} className="bg-[#6a0dad] text-white px-6 py-2 rounded hover:bg-[#580aaf] transition disabled:opacity-50">
          {runningAI ? "AI Analyzing..." : "Run AI Reconciliation"}
        </button>
      </form>

      <div className="bg-white shadow rounded-lg p-4 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search ID..."
          className="border px-3 py-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border px-3 py-2 rounded" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="MATCHED">Matched</option>
          <option value="DISCREPANCY">Discrepancy</option>
        </select>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="space-y-3">
          {filteredData.map((rec) => (
            <div key={rec.id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <div className="font-semibold">Record: {rec.id}</div>
                <div className="text-sm text-gray-600">Period: {new Date(rec.month).toLocaleDateString()}</div>
                <div className="text-sm text-gray-600">
                  Variance: <span className={rec.variance > 0 ? "text-red-500 font-medium" : ""}>${rec.variance}</span>
                </div>
              </div>
              <div className={`px-3 py-1 text-sm rounded-full ${statusColor(rec.status)}`}>
                {rec.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorReconcilePage;