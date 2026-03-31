import { useState, useEffect } from "react";
import { getComplianceControls } from "../../services/compliance.api";

const InternalControls = () => {
  const [internalControls, setControls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplianceControls().then(res => {
      setControls(res.map((c: any) => ({
        id: c.id,
        control: c.control || "System Authentication",
        owner: c.desc || "IT Operations",
        status: c.status === "Compliant" ? "Active" : "Under Review",
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Internal Controls</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading controls registry...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Control</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {internalControls.length > 0 ? internalControls.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.id}</td>
                  <td className="p-2 border">{row.control}</td>
                  <td className="p-2 border">{row.owner}</td>
                  <td className={`p-2 border ${row.status === 'Active' ? 'text-green-600' : 'text-yellow-600'} font-medium`}>{row.status}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No active controls mapped in system.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InternalControls;
