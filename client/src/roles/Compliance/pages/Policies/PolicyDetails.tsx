import { useState, useEffect } from "react";
import { getCompliancePolicies } from "../../services/compliance.api";

const PolicyDetails = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompliancePolicies().then(res => {
      setPolicies(res.map((p: any) => ({
        id: p.id.substring(0, 6).toUpperCase(),
        title: p.title,
        description: p.content,
        lastUpdated: new Date(p.createdAt).toISOString().split('T')[0],
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Policy Details</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading policy details...</div>
        ) : (
          <div className="space-y-6">
            {policies.length > 0 ? policies.map((policy) => (
              <div key={policy.id} className="border-b pb-4">
                <h2 className="text-xl font-semibold text-[#0A2342]">{policy.title} <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 rounded-full">ID: {policy.id}</span></h2>
                <p className="mt-2 text-gray-700">{policy.description}</p>
                <p className="mt-2 text-sm text-gray-500">Last Updated: {policy.lastUpdated}</p>
              </div>
            )) : (
               <div className="text-center text-gray-500">No policy configurations detected.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyDetails;
