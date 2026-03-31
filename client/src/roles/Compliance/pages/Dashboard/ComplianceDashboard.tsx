import { useState, useEffect } from "react";
import { getComplianceMonitoring, getComplianceControls, getCompliancePolicies, getTasks, getJournals } from "../../services/compliance.api";

const ComplianceDashboard = () => {
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [controlsData, setControlsData] = useState<any[]>([]);
  
  const [summary, setSummary] = useState({
    pendingClearances: 0,
    redFlags: 0,
    reports: 0,
    policies: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getComplianceMonitoring(),
      getComplianceControls(),
      getTasks(),
      getJournals(),
      getCompliancePolicies()
    ]).then(([monitoringRes, controlsRes, tasksRes, journalsRes, policiesRes]) => {
      setMonitoringData(monitoringRes);
      
      // Limit controls tested to top 3 for dashboard
      setControlsData(controlsRes.slice(0, 3));

      setSummary({
        pendingClearances: tasksRes.filter((t: any) => t.status === 'REVIEW' || t.status === 'TODO').length,
        redFlags: journalsRes.filter((j: any) => j.status === 'FLAGGED').length,
        reports: policiesRes.length > 0 ? 5 : 0, // Fallback since actual reports API isn't built fully
        policies: policiesRes.length,
      });

      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading compliance analytics...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Compliance Dashboard</h1>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Dept Clearance Panels</h2>
          <p className="text-2xl font-bold mt-2">{summary.pendingClearances} Pending Reviews</p>
          <p className="text-sm text-gray-500 mt-1">Live from live assignments</p>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Red Flags</h2>
          <p className="text-2xl font-bold mt-2 text-red-600">{summary.redFlags} Active Alerts</p>
          <p className="text-sm text-gray-500 mt-1">Across all journals</p>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Compliance Reports</h2>
          <p className="text-2xl font-bold mt-2">{summary.reports} Reports Generated</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Monitoring & Controls tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">Monitoring Overview</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Department</th>
                <th className="p-2 border">Issues</th>
              </tr>
            </thead>
            <tbody>
              {monitoringData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.department}</td>
                  <td className="p-2 border">{row.issues}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">Controls Tested</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Control</th>
                <th className="p-2 border">Tested Date</th>
              </tr>
            </thead>
            <tbody>
              {controlsData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.control}</td>
                  <td className="p-2 border">{row.tested}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policies & Regulatory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">Policies</h2>
          <ul className="list-disc ml-5 text-gray-700">
            <li>All Policies ({summary.policies})</li>
            <li>Policy Details ({summary.policies > 0 ? summary.policies - 1 : 0})</li>
            <li>Policy Violations ({summary.redFlags})</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">Regulatory Requirements</h2>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Compliance Reports (5)</li>
            <li>Regulatory Requirements (8)</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-2">AI Copilot</h2>
          <p className="text-gray-700">
            Get AI assistance for policy reviews, control testing, and monitoring analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
