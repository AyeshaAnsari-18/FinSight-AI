interface KPIWidgetProps {
  title: string;
  value: number | string;
}

export default function KPIWidget({ title, value }: KPIWidgetProps) {
  return (
    <div className="bg-white shadow rounded p-4 flex flex-col items-center justify-center">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
