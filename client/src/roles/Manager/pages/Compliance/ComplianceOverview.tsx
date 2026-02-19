/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { complianceApi } from "../../services/compliance.api";

const ComplianceOverview = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await complianceApi.getIssues();
        setIssues(data);
      } catch (error) {
        console.error("Failed to fetch compliance issues", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  if (loading) return <div className="p-6 text-[#0A2342] font-bold">Loading Compliance Data...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Compliance Overview</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Issue</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2 border">{item.id}</td>
                <td className="p-2 border">{item.issue}</td>
                <td className="p-2 border">{item.dept}</td>
                <td className="p-2 border text-sm font-semibold">
                  <span className={`px-2 py-1 rounded-full ${item.status === 'Resolved' ? 'bg-green-100 text-green-800' : item.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
             {issues.length === 0 && (
              <tr><td colSpan={4} className="text-center p-4 text-gray-500">No compliance issues found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceOverview;