const AlertsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alerts</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="p-3 rounded-lg bg-red-100">Invoice #123 missing GL code</div>
        <div className="p-3 rounded-lg bg-yellow-100">Bank reconciliation variance detected</div>
        <div className="p-3 rounded-lg bg-green-100">Vendor payment delay</div>
      </div>
    </div>
  );
};

export default AlertsPage;
