const FiscalCloseAgent = () => {
  const fiscalTasks = [
    { id: 1, task: "Prepare Trial Balance", status: "Pending" },
    { id: 2, task: "Verify Expenses", status: "In Progress" },
    { id: 3, task: "Close Sub-ledgers", status: "Completed" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Fiscal Close Agent Tasks</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Task</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {fiscalTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="p-2 border">{task.id}</td>
                <td className="p-2 border">{task.task}</td>
                <td className="p-2 border">{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FiscalCloseAgent;
