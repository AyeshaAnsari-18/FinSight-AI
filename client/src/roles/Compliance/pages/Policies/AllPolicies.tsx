import { useState, useEffect } from "react";
import { getCompliancePolicies, createPolicy } from "../../services/compliance.api";

const AllPolicies = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", category: "Finance", content: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadPolicies = () => {
    setLoading(true);
    getCompliancePolicies().then(res => {
      setPolicies(res.map((p: any) => ({
        id: p.id.substring(0, 6).toUpperCase(),
        title: p.title,
        department: p.category || "General",
        status: "Active"
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPolicy(formData);
      setShowModal(false);
      setFormData({ title: "", category: "Finance", content: "" });
      loadPolicies();
    } catch (error) {
      console.error("Failed to create policy", error);
      alert("Failed to create policy.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0A2342]">All Policies</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-[#0A2342] text-white px-4 py-2 rounded shadow hover:bg-[#113155] transition"
        >
          Add Policy
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading active policies...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {policies.length > 0 ? policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="p-2 border font-mono text-xs">{policy.id}</td>
                  <td className="p-2 border font-medium">{policy.title}</td>
                  <td className="p-2 border">{policy.department}</td>
                  <td className="p-2 border text-green-600 font-medium">{policy.status}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No active policies found in system.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#0A2342]">Create New Policy</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Title</label>
                <input 
                  type="text" required 
                  className="w-full border p-2 rounded mt-1" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category (Department)</label>
                <select 
                  className="w-full border p-2 rounded mt-1" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Content</label>
                <textarea 
                  required 
                  className="w-full border p-2 rounded mt-1 h-24" 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                ></textarea>
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
                  {submitting ? "Saving..." : "Save Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPolicies;
