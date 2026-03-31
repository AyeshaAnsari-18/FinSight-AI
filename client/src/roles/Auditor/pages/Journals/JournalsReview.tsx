import { useState, useEffect } from "react";
import { Book } from "lucide-react";
import { getJournals } from "../../services/auditor.api";

const JournalsReview = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewData, setReviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJournals()
      .then((res) => {
        const reviews = res.filter((j: any) => j.status === 'DRAFT' || j.status === 'POSTED');
        const mappedData = reviews.map((j: any) => ({
          id: j.id.substring(0, 6).toUpperCase(),
          journal: j.description || "General Journal",
          reviewer: "System Auditor",
          reviewDate: new Date(j.updatedAt || j.date).toISOString().split('T')[0],
          status: j.status === 'POSTED' ? 'Approved' : 'Pending',
        }));
        setReviewData(mappedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredData = reviewData.filter((item) => {
    const matchesSearch =
      item.journal.toLowerCase().includes(search.toLowerCase()) ||
      item.reviewer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-6 h-6 text-[#0A2342]" />
        <h1 className="text-2xl font-bold text-[#0A2342]">Journals Review</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by journal or reviewer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full sm:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center text-gray-400">Loading journal reviews...</div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-[#0A2342] text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Journal</th>
                <th className="py-3 px-4 text-left">Reviewer</th>
                <th className="py-3 px-4 text-left">Review Date</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100 transition">
                    <td className="py-2 px-4">{item.id}</td>
                    <td className="py-2 px-4">{item.journal}</td>
                    <td className="py-2 px-4">{item.reviewer}</td>
                    <td className="py-2 px-4">{item.reviewDate}</td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        item.status === "Approved"
                          ? "text-green-600"
                          : item.status === "Pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default JournalsReview;
