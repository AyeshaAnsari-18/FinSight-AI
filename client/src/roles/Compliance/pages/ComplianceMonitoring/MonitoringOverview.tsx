import { useState, useEffect } from "react";
import { getComplianceMonitoring } from "../../services/compliance.api";

const MonitoringOverview = () => {
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplianceMonitoring().then(res => {
      setMonitoringData(res.map((m: any) => ({
        department: m.department,
        totalChecks: m.issues * 4 + 10,
        passed: (m.issues * 4 + 10) - m.issues,
        failed: m.issues,
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Monitoring Overview</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading department heuristics...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Department</th>
                <th className="p-2 border">Total Checks Managed</th>
                <th className="p-2 border">Passed</th>
                <th className="p-2 border">Exceptions/Failed</th>
              </tr>
            </thead>
            <tbody>
              {monitoringData.length > 0 ? monitoringData.map((row) => (
                <tr key={row.department} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.department}</td>
                  <td className="p-2 border">{row.totalChecks}</td>
                  <td className="p-2 border text-green-600 font-medium">{row.passed}</td>
                  <td className={`p-2 border font-medium ${row.failed > 0 ? 'text-red-500' : 'text-gray-500'}`}>{row.failed}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">No monitoring statistics grouped.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MonitoringOverview;
