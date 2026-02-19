import { useState, useEffect } from "react";
import api from "../../../../lib/api";
import { Loader2 } from "lucide-react";

interface NarrativeReport {
  id: string;
  title: string;
  period: string;
  content: string;
  createdAt: string;
}

const MyReportsPage = () => {
  const [reports, setReports] = useState<NarrativeReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Hitting your NestJS NarrativesController
        const response = await api.get('/narratives');
        setReports(response.data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#1D4ED8]" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Narrative Reports</h1>
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Report ID</th>
              <th className="border px-4 py-2 text-left">Title</th>
              <th className="border px-4 py-2 text-left">Period</th>
              <th className="border px-4 py-2 text-left">Generated On</th>
              <th className="border px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{report.id}</td>
                <td className="border px-4 py-2 font-medium">{report.title}</td>
                <td className="border px-4 py-2">{report.period}</td>
                <td className="border px-4 py-2">{new Date(report.createdAt).toLocaleDateString()}</td>
                <td className="border px-4 py-2 text-center">
                  <button className="text-blue-600 hover:underline cursor-pointer">View</button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={5} className="text-center py-4 text-gray-500">No reports generated yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyReportsPage;