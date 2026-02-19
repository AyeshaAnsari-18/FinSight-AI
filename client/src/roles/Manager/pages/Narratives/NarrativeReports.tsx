/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { narrativesApi } from "../../services/narratives.api";

const NarrativeReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await narrativesApi.getReports();
        setReports(data);
      } catch (error) {
        console.error("Failed to load narrative reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-6 text-[#0A2342] font-bold">Loading Narrative Reports...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Narrative Reports</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Author</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-2 border font-mono text-xs">{r.id}</td>
                <td className="p-2 border font-medium text-[#0A2342]">{r.title}</td>
                <td className="p-2 border text-gray-600">{r.author}</td>
                <td className="p-2 border">
                   <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {r.status}
                   </span>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No narrative reports found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NarrativeReports;