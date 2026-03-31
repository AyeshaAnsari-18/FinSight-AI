import { useState, useEffect } from "react";
import { getJournals } from "../../services/compliance.api";

const PolicyViolations = () => {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJournals().then(res => {
      const issues = res.filter((j: any) => j.status === 'FLAGGED');
      setViolations(issues.map((j: any) => ({
        id: j.id.substring(0, 6).toUpperCase(),
        policy: j.flagReason || "General Liability Constraint",
        violator: j.reference || "Unknown",
        date: new Date(j.createdAt || j.date).toISOString().split('T')[0],
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
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Policy Violations</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Fetching violations...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Apparent Policy Violation</th>
                <th className="p-2 border">Source Object</th>
                <th className="p-2 border">Date of Violation</th>
                <th className="p-2 border">Severity</th>
              </tr>
            </thead>
            <tbody>
              {violations.length > 0 ? violations.map((violation) => (
                <tr key={violation.id} className="hover:bg-red-50 transition">
                  <td className="p-2 border">{violation.id}</td>
                  <td className="p-2 border">{violation.policy}</td>
                  <td className="p-2 border">{violation.violator}</td>
                  <td className="p-2 border">{violation.date}</td>
                  <td className={`p-2 border font-medium ${violation.severity === 'Critical' ? 'text-red-700' : 'text-orange-600'}`}>{violation.severity}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No active violations on record.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PolicyViolations;
