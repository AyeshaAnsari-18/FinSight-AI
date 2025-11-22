const ManagerDashboard = () => {
  // Dummy data for summary cards
  const summaryCards = [
    { title: "Audit Trail Entries", count: 12 },
    { title: "Compliance Issues", count: 7 },
    { title: "Departments Overview", count: 5 },
    { title: "Pending Fiscal Closes", count: 3 },
    { title: "Forecast Scenarios", count: 4 },
    { title: "What-If Analyses", count: 2 },
    { title: "Narrative Reports", count: 6 },
    { title: "Manager Tasks", count: 8 },
  ];

  // Dummy data for tables
  const auditTrail = [
    { id: 1, user: "Alice", action: "Approved Report", date: "2025-11-18" },
    { id: 2, user: "Bob", action: "Reviewed Task", date: "2025-11-17" },
    { id: 3, user: "Charlie", action: "Closed Fiscal Period", date: "2025-11-16" },
  ];

  const departments = [
    { id: 1, name: "Finance", head: "David", employees: 12 },
    { id: 2, name: "HR", head: "Eve", employees: 8 },
    { id: 3, name: "IT", head: "Frank", employees: 15 },
  ];

  const managerTasks = [
    { id: 1, task: "Review Audit Trail", status: "Pending", due: "2025-11-20" },
    { id: 2, task: "Approve Forecast", status: "In Progress", due: "2025-11-22" },
    { id: 3, task: "Check Compliance", status: "Completed", due: "2025-11-18" },
  ];

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Manager Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-4 rounded shadow hover:shadow-md transition flex flex-col items-center justify-center"
          >
            <span className="text-gray-500">{card.title}</span>
            <span className="text-3xl font-bold text-[#0A2342]">{card.count}</span>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Audit Trail Table */}
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="text-lg font-semibold mb-4">Recent Audit Trail</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {auditTrail.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{entry.id}</td>
                  <td className="p-2 border">{entry.user}</td>
                  <td className="p-2 border">{entry.action}</td>
                  <td className="p-2 border">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Departments Overview Table */}
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
          <h2 className="text-lg font-semibold mb-4">Departments Overview</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Department</th>
                <th className="p-2 border">Head</th>
                <th className="p-2 border">Employees</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{dept.id}</td>
                  <td className="p-2 border">{dept.name}</td>
                  <td className="p-2 border">{dept.head}</td>
                  <td className="p-2 border">{dept.employees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Manager Tasks Table */}
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Manager Tasks</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Task</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {managerTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{task.id}</td>
                  <td className="p-2 border">{task.task}</td>
                  <td className="p-2 border">{task.status}</td>
                  <td className="p-2 border">{task.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;
