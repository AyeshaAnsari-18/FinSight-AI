import { useState, useEffect } from "react";
import { getComplianceControls } from "../../services/compliance.api";

const ControlEvidence = () => {
  const [evidenceData, setEvidenceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplianceControls().then(res => {
      setEvidenceData(res.map((c: any) => ({
        id: c.id,
        control: c.control,
        document: c.control.replace(' ', '_').toLowerCase() + "_evidence.pdf",
        uploadedBy: "System Auditor",
        uploadDate: c.tested,
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Control Evidence Box</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading verification evidence logs...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Control ID</th>
                <th className="p-2 border">Control Name</th>
                <th className="p-2 border">Evidence Artifact</th>
                <th className="p-2 border">Uploaded By</th>
                <th className="p-2 border">Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {evidenceData.length > 0 ? evidenceData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.id}</td>
                  <td className="p-2 border">{row.control}</td>
                  <td className="p-2 border text-blue-600 hover:underline cursor-pointer">{row.document}</td>
                  <td className="p-2 border">{row.uploadedBy}</td>
                  <td className="p-2 border">{row.uploadDate}</td>
                </tr>
              )) : (
                 <tr><td colSpan={5} className="p-4 text-center text-gray-500">No registered evidence artifacts.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ControlEvidence;
