import { useNavigate } from "react-router-dom";

interface TaskSummaryProps {
  tasks: { title: string; count: number; path: string }[];
}

export default function TaskSummary({ tasks }: TaskSummaryProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-bold mb-2">Pending Tasks</h2>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li
            key={task.title}
            className="flex justify-between p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => navigate(task.path)}
          >
            <span>{task.title}</span>
            <span className="font-bold">{task.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
