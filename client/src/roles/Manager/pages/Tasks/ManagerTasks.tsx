const ManagerTasks = () => {
  const tasks = [
    { id: 1, task: "Review Audit Trail", status: "Pending", due: "2025-11-20" },
    { id: 2, task: "Approve Forecast", status: "In Progress", due: "2025-11-22" },
    { id: 3, task: "Check Compliance", status: "Completed", due: "2025-11-18" },
    { id: 4, task: "Finalize Fiscal Close", status: "Pending", due: "2025-11-23" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Manager Tasks</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
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
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-2 border">{t.id}</td>
                <td className="p-2 border">{t.task}</td>
                <td className="p-2 border">{t.status}</td>
                <td className="p-2 border">{t.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerTasks;
