import { useState, useEffect } from "react";
import { getAuditorDashboard } from "../../services/auditor.api";

const AuditorDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditorDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <p className="text-gray-500 animate-pulse">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===== Top Stats Row ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Pending Audit Reviews</p>
          <p className="text-3xl font-semibold mt-2">{data.pendingAuditReviews}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Flagged Entries</p>
          <p className="text-3xl font-semibold mt-2">{data.flaggedEntries}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Compliance Issues</p>
          <p className="text-3xl font-semibold mt-2">{data.complianceIssues}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Dept. Review Pending</p>
          <p className="text-3xl font-semibold mt-2">{data.deptReviewPending}</p>
        </div>

      </div>

      {/* ===== Pending Audit Tasks ===== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Pending Audit Tasks</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="p-4 rounded-lg border bg-gray-50">
            <p className="font-medium">Journal Review</p>
            <p className="text-sm text-gray-600">Items awaiting auditor approval</p>
            <p className="text-xl font-semibold mt-2">{data.pendingTasksList.journalReview}</p>
          </div>

          <div className="p-4 rounded-lg border bg-gray-50">
            <p className="font-medium">Reconciliation Review</p>
            <p className="text-sm text-gray-600">Bank / Vendor mismatches</p>
            <p className="text-xl font-semibold mt-2">{data.pendingTasksList.reconciliationReview}</p>
          </div>

        </div>
      </div>

      {/* ===== Alerts Overview ===== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
        <h2 className="text-lg font-semibold">Audit Alerts Overview</h2>
        
        {data.alerts && data.alerts.length > 0 ? (
          data.alerts.map((alert: string, index: number) => (
            <div key={index} className="p-3 rounded-md bg-yellow-100 border border-yellow-300">
              {alert}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No active alerts found.</p>
        )}
      </div>

    </div>
  );
};

export default AuditorDashboard;
