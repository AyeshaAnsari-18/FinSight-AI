import { useState, useEffect } from "react";
import { getComplianceControls } from "../../services/compliance.api";
import api from "../../../../lib/api";
import { auditTrailApi } from "../../../Manager/services/auditTrail.api";

const ControlEvidence = () => {
  const [evidenceData, setEvidenceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvidence = () => {
    getComplianceControls().then(res => {
      setEvidenceData(res.map((c: any) => ({
        id: c.id,
        control: c.control,
        document: c.documentName || "No Evidence Attached",
        documentUrl: c.documentUrl,
        uploadedBy: c.uploadedBy || (c.documentName ? "System Auditor" : "N/A"),
        uploadDate: c.uploadDate || c.tested,
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post(`/compliance/controls/${id}/evidence`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await auditTrailApi.createLog({ action: `Uploaded evidence for control ${id}` });
      fetchEvidence();
    } catch (error) {
      console.error("Upload failed", error);
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await auditTrailApi.createLog({ action: `Downloaded evidence ${filename}` });
    } catch (error) {
      console.error("Download failed", error);
    }
  };

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
                <th className="p-2 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {evidenceData.length > 0 ? evidenceData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.id}</td>
                  <td className="p-2 border">{row.control}</td>
                  <td className="p-2 border">
                    {row.documentUrl ? (
                      <span onClick={() => handleDownload(row.documentUrl, row.document)} className="text-blue-600 hover:underline cursor-pointer">
                        {row.document}
                      </span>
                    ) : (
                      <span className="text-gray-500">{row.document}</span>
                    )}
                  </td>
                  <td className="p-2 border">{row.uploadedBy}</td>
                  <td className="p-2 border">{row.uploadDate}</td>
                  <td className="p-2 border text-center">
                    <label className="cursor-pointer bg-[#0A2342] text-white px-3 py-1 rounded text-sm hover:bg-[#113155] transition">
                      Upload
                      <input type="file" className="hidden" onChange={(e) => handleUpload(row.id, e)} />
                    </label>
                  </td>
                </tr>
              )) : (
                 <tr><td colSpan={6} className="p-4 text-center text-gray-500">No registered evidence artifacts.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ControlEvidence;
