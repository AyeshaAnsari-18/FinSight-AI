import { useState, useEffect } from "react";
import { getCompliancePolicies } from "../../services/compliance.api";

const ComplianceReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompliancePolicies().then(res => {
      setReports(res.map((p: any) => ({
        id: "REP-" + p.id.substring(0, 4).toUpperCase(),
        title: `${p.title} Review Summary`,
        department: p.category || "Organization",
        generator: "System AI Engine",
        generatedDate: new Date(p.createdAt).toISOString().split('T')[0],
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Available Compliance Reports</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
           <div className="p-8 text-center text-gray-400">Loading generated reports suite...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Report ID</th>
                <th className="p-2 border">Report Identity</th>
                <th className="p-2 border">Department Scope</th>
                <th className="p-2 border">Origin Framework</th>
                <th className="p-2 border">Date of Run</th>
                <th className="p-2 border">Extract</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? reports.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition">
                  <td className="p-2 border">{row.id}</td>
                  <td className="p-2 border">{row.title}</td>
                  <td className="p-2 border">{row.department}</td>
                  <td className="p-2 border">{row.generator}</td>
                  <td className="p-2 border">{row.generatedDate}</td>
                  <td className="p-2 border hover:underline cursor-pointer text-blue-600">Download .PDF</td>
                </tr>
              )) : (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">No active reports produced in system.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ComplianceReports;
