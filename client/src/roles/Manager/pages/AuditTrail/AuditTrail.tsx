/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { auditTrailApi } from "../../services/auditTrail.api";

const AuditTrail = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await auditTrailApi.getLogs();
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch audit trail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-6 text-[#0A2342] font-bold">Loading Audit Trail...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Audit Trail</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="p-2 border">{entry.id}</td>
                <td className="p-2 border">{entry.user}</td>
                <td className="p-2 border">{entry.action}</td>
                <td className="p-2 border">{new Date(entry.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="text-center p-4 text-gray-500">No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;