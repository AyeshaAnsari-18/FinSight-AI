import { useState, useEffect } from "react";
import { getJournals } from "../../services/compliance.api";

const RedFlags = () => {
  const [redFlags, setRedFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJournals().then(res => {
      const flagged = res.filter((j: any) => j.status === 'FLAGGED' || j.riskScore > 60);
      setRedFlags(flagged.map((j: any) => ({
        id: j.id.substring(0, 6).toUpperCase(),
        alert: j.flagReason || "Suspect Activity Detected",
        department: "Finance",
        raisedBy: j.reference || "System Analyst",
        date: new Date(j.date).toISOString().split('T')[0],
        severity: j.riskScore > 80 ? "Critical" : "High"
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Red Flags & Alerts</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
           <div className="p-8 text-center text-gray-400">Loading alerts ledger...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Alert Signature</th>
                <th className="p-2 border">Department Focus</th>
                <th className="p-2 border">Origin Source</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Severity</th>
              </tr>
            </thead>
            <tbody>
              {redFlags.length > 0 ? redFlags.map((flag) => (
                <tr key={flag.id} className="hover:bg-red-50 transition">
                  <td className="p-2 border">{flag.id}</td>
                  <td className="p-2 border">{flag.alert}</td>
                  <td className="p-2 border">{flag.department}</td>
                  <td className="p-2 border">{flag.raisedBy}</td>
                  <td className="p-2 border">{flag.date}</td>
                  <td className={`p-2 border font-bold ${flag.severity === 'Critical' ? 'text-red-700' : 'text-orange-500'}`}>{flag.severity}</td>
                </tr>
              )) : (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">System registers no active red flags.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RedFlags;
