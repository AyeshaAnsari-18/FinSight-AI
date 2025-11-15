interface AlertsSummaryProps {
  alerts: { message: string; severity: "high" | "medium" | "low"; id: string }[];
}

export default function AlertsSummary({ alerts }: AlertsSummaryProps) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-bold mb-2">Alerts Overview</h2>
      <ul className="flex flex-col gap-2">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={`p-2 rounded ${
              alert.severity === "high"
                ? "bg-red-100 text-red-800"
                : alert.severity === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
