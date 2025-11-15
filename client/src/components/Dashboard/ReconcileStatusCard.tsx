interface ReconcileStatusCardProps {
  type: "bank" | "vendor";
  pending: number;
}

export default function ReconcileStatusCard({ type, pending }: ReconcileStatusCardProps) {
  const title = type === "bank" ? "Bank Reconciliation" : "Vendor Reconciliation";

  return (
    <div className="bg-white shadow rounded p-4 flex justify-between items-center">
      <span>{title}</span>
      <span className="text-xl font-bold">{pending}</span>
    </div>
  );
}
