import { useState, useEffect } from "react";
import { getCompliancePolicies } from "../../services/compliance.api";

const AllPolicies = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">All Policies</h1>

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
                  <td className="p-2 border">{policy.id}</td>
                  <td className="p-2 border">{policy.title}</td>
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
    </div>
  );
};

export default AllPolicies;
