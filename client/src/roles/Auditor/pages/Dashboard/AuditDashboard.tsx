const AuditorDashboard = () => {
  return (
    <div className="space-y-6">

      {/* ===== Top Stats Row ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Pending Audit Reviews</p>
          <p className="text-3xl font-semibold mt-2">12</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Flagged Entries</p>
          <p className="text-3xl font-semibold mt-2">4</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Compliance Issues</p>
          <p className="text-3xl font-semibold mt-2">3</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Dept. Review Pending</p>
          <p className="text-3xl font-semibold mt-2">6</p>
        </div>

      </div>

      {/* ===== Pending Audit Tasks ===== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Pending Audit Tasks</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="p-4 rounded-lg border bg-gray-50">
            <p className="font-medium">Journal Review</p>
            <p className="text-sm text-gray-600">Items awaiting auditor approval</p>
            <p className="text-xl font-semibold mt-2">7</p>
          </div>

          <div className="p-4 rounded-lg border bg-gray-50">
            <p className="font-medium">Reconciliation Review</p>
            <p className="text-sm text-gray-600">Bank / Vendor mismatches</p>
            <p className="text-xl font-semibold mt-2">5</p>
          </div>

        </div>
      </div>

      {/* ===== Alerts Overview ===== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
        <h2 className="text-lg font-semibold">Audit Alerts Overview</h2>

        <div className="p-3 rounded-md bg-red-100 border border-red-300">
          Unauthorized journal modification detected
        </div>

        <div className="p-3 rounded-md bg-yellow-100 border border-yellow-300">
          High variance in vendor reconciliation
        </div>

        <div className="p-3 rounded-md bg-blue-100 border border-blue-300">
          System flagged unusual transaction pattern
        </div>
      </div>

    </div>
  );
};

export default AuditorDashboard;
