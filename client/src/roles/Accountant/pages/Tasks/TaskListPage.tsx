/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAccountantTasks } from "../../hooks/useAccountantTasks";

const TaskListPage = () => {
  const { tasks, loading, error, updateStatus } = useAccountantTasks();

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-100 text-red-800 border-red-200";
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) return <div className="p-10 text-center text-[#3b165f] font-bold">Loading Tasks...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#3b165f]">My Month-End Tasks</h1>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-[#f5f1ff] text-[#3b165f]">
              <th className="px-6 py-4 text-left font-semibold">Task</th>
              <th className="px-6 py-4 text-left font-semibold">Due Date</th>
              <th className="px-6 py-4 text-center font-semibold">Priority</th>
              <th className="px-6 py-4 text-center font-semibold">Status</th>
              <th className="px-6 py-4 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">{task.title}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${priorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <select
                    className="border border-gray-300 rounded-md text-sm p-1.5 focus:outline-purple-600"
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value as any)}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    className="text-[#6a0dad] hover:text-[#580aaf] font-semibold text-sm transition-colors"
                    onClick={() => {
                      if (task.title.toLowerCase().includes('accrual')) window.location.href = '/accountant/tasks/accruals';
                      else if (task.title.toLowerCase().includes('tax')) window.location.href = '/accountant/tasks/tax';
                    }}
                  >
                    Open Tool &rarr;
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  You have no pending tasks. Great job!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskListPage;