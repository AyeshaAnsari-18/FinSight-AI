import { useState, useEffect } from "react";
import { getComplianceControls, createControl } from "../../services/compliance.api";

const InternalControls = () => {
  const [internalControls, setControls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ riskName: "", controlDesc: "", status: "Compliant" });
  const [submitting, setSubmitting] = useState(false);

  const loadControls = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadControls();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createControl(formData);
      setShowModal(false);
      setFormData({ riskName: "", controlDesc: "", status: "Compliant" });
      loadControls();
    } catch (error) {
      console.error("Failed to create control", error);
      alert("Failed to create control.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0A2342]">Internal Controls</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-[#0A2342] text-white px-4 py-2 rounded shadow hover:bg-[#113155] transition"
        >
          Add Control
        </button>
      </div>

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
                  <td className="p-2 border font-mono text-xs">{row.id}</td>
                  <td className="p-2 border font-medium">{row.control}</td>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#0A2342]">Create New Control</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Risk / Control Name</label>
                <input 
                  type="text" required 
                  className="w-full border p-2 rounded mt-1" 
                  value={formData.riskName} 
                  onChange={(e) => setFormData({...formData, riskName: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Owner)</label>
                <input 
                  type="text" required 
                  className="w-full border p-2 rounded mt-1" 
                  value={formData.controlDesc} 
                  onChange={(e) => setFormData({...formData, controlDesc: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  className="w-full border p-2 rounded mt-1" 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Compliant">Active / Compliant</option>
                  <option value="Failing">Under Review / Failing</option>
                  <option value="Open">Open Issue</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-4 py-2 bg-[#0A2342] text-white rounded hover:bg-[#113155] transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Control"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalControls;
