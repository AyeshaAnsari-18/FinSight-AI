/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { auditTrailApi } from "../../services/auditTrail.api";
import { complianceApi } from "../../services/compliance.api";
import { tasksApi } from "../../services/tasks.api";

const ManagerDashboard = () => {
  
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<any[]>([]);
  const [managerTasks, setManagerTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        
        const [logsRes, complianceRes, tasksRes] = await Promise.all([
          auditTrailApi.getLogs(),
          complianceApi.getIssues(),
          tasksApi.getMyTasks()
        ]);

        setAuditLogs(logsRes);
        setComplianceIssues(complianceRes);
        setManagerTasks(tasksRes);
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <span className="text-xl font-bold text-[#0A2342] animate-pulse">Loading Live Metrics...</span>
      </div>
    );
  }

  
  const summaryCards = [
    { title: "Audit Trail Entries", count: auditLogs.length },
    { title: "Compliance Issues", count: complianceIssues.length },
    { title: "Manager Tasks", count: managerTasks.filter(t => t.status !== 'DONE').length },
    
    { title: "Departments Overview", count: 3 }, 
    { title: "Pending Fiscal Closes", count: 1 },
    { title: "Forecast Scenarios", count: 0 },
    { title: "What-If Analyses", count: 0 },
    { title: "Narrative Reports", count: 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#0A2342]">Manager Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-4 rounded shadow hover:shadow-md transition flex flex-col items-center justify-center border border-gray-100"
          >
            <span className="text-gray-500 text-sm font-medium text-center">{card.title}</span>
            <span className="text-3xl font-bold text-[#0A2342] mt-1">{card.count}</span>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1️⃣ Live Audit Trail Table (Showing top 5 recent) */}
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-[#0A2342]">Recent Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-2 border-b">ID</th>
                  <th className="p-2 border-b">User</th>
                  <th className="p-2 border-b">Action</th>
                  <th className="p-2 border-b">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {auditLogs.slice(0, 5).map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 border-b font-mono text-xs">{entry.id}</td>
                    <td className="p-2 border-b font-medium">{entry.user}</td>
                    <td className="p-2 border-b text-gray-600">{entry.action}</td>
                    <td className="p-2 border-b text-gray-500">{new Date(entry.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">No recent audit logs.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2️⃣ Live Compliance / Departments Table */}
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-[#0A2342]">Active Compliance Issues</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-2 border-b">ID</th>
                  <th className="p-2 border-b">Issue</th>
                  <th className="p-2 border-b">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {complianceIssues.slice(0, 5).map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 border-b font-mono text-xs">{issue.id}</td>
                    <td className="p-2 border-b text-gray-700">{issue.issue}</td>
                    <td className="p-2 border-b">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${issue.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {complianceIssues.length === 0 && (
                  <tr><td colSpan={3} className="p-4 text-center text-gray-500">No compliance issues found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3️⃣ Live Manager Tasks Table */}
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition md:col-span-2 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-[#0A2342]">My Tasks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-2 border-b">Task</th>
                  <th className="p-2 border-b text-center">Priority</th>
                  <th className="p-2 border-b text-center">Status</th>
                  <th className="p-2 border-b text-center">Due Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {managerTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 border-b font-medium text-gray-800">{task.title}</td>
                    <td className="p-2 border-b text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${task.priority === 'HIGH' || task.priority === 'URGENT' ? 'text-red-600 bg-red-50 border border-red-200' : 'text-blue-600 bg-blue-50 border border-blue-200'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-2 border-b text-center">
                      <span className="text-gray-600 font-semibold">{task.status.replace('_', ' ')}</span>
                    </td>
                    <td className="p-2 border-b text-center text-gray-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </td>
                  </tr>
                ))}
                {managerTasks.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">You have no pending tasks.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;