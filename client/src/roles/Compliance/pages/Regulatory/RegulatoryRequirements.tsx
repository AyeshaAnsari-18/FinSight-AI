import { useState, useEffect } from "react";
import { getComplianceControls } from "../../services/compliance.api";

const RegulatoryRequirements = () => {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplianceControls().then(res => {
      setRequirements(res.map((c: any) => ({
         id: "REG-" + c.id.substring(0,4),
         regulation: c.control,
         applicableDept: "Enterprise Focus",
         complianceStatus: c.status === "Compliant" ? "Full Control" : "Gap Observed",
         lastReview: c.tested
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Regulatory Requirements</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
             <div className="p-8 text-center text-gray-400">Loading regulations and requirements map...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Regulatory ID</th>
                <th className="p-2 border">Regulation Framework</th>
                <th className="p-2 border">Applicability Sphere</th>
                <th className="p-2 border">System Status</th>
                <th className="p-2 border">Verification Check</th>
              </tr>
            </thead>
            <tbody>
              {requirements.length > 0 ? requirements.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition">
                  <td className="p-2 border">{req.id}</td>
                  <td className="p-2 border">{req.regulation}</td>
                  <td className="p-2 border">{req.applicableDept}</td>
                  <td className={`p-2 border font-medium ${req.complianceStatus === 'Full Control' ? 'text-green-600' : 'text-orange-500'}`}>{req.complianceStatus}</td>
                  <td className="p-2 border">{req.lastReview}</td>
                </tr>
              )) : (
                 <tr><td colSpan={5} className="p-8 text-center text-gray-500">No regulatory directives configured via core.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RegulatoryRequirements;
