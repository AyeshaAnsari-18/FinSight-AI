import { useState, useEffect } from "react";
import { getComplianceControls } from "../../services/compliance.api";

const ControlTesting = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplianceControls().then(res => {
      setTestResults(res.map((c: any) => ({
        id: c.id,
        control: c.control || "Identity Verification",
        dateTested: c.tested,
        tester: "System Auditor",
        result: c.status === "Compliant" ? "Passed" : "Failed",
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Control Testing History</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading historical test data...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Control</th>
                <th className="p-2 border">Date Tested</th>
                <th className="p-2 border">Tester</th>
                <th className="p-2 border">Result</th>
              </tr>
            </thead>
            <tbody>
              {testResults.length > 0 ? testResults.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.id}</td>
                  <td className="p-2 border">{row.control}</td>
                  <td className="p-2 border">{row.dateTested}</td>
                  <td className="p-2 border">{row.tester}</td>
                  <td className={`p-2 border font-medium ${row.result === 'Passed' ? 'text-green-600' : 'text-red-500'}`}>{row.result}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No test iterations ran for registered controls.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ControlTesting;
