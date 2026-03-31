import { useState, useEffect } from "react";
import { getTasks, updateTask } from "../../services/compliance.api";
import toast from "react-hot-toast";

const DeptClearancePanel = () => {
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    setLoading(true);
    getTasks()
      .then((res) => {
        const clearances = res.filter((t: any) => t.status === 'TODO' || t.status === 'REVIEW' || t.status === 'IN_PROGRESS');
        const mappedData = clearances.map((t: any) => ({
          id: t.id,
          department: t.assignedTo?.role ? t.assignedTo.role.charAt(0) + t.assignedTo.role.slice(1).toLowerCase() : 'Operations',
          reviewer: t.assignedTo?.name || t.assignedToId || "System",
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : "N/A",
          title: t.title,
        }));
        setPendingReviews(mappedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleApprove = async (id: string | undefined, idx: number) => {
    if (!id) {
      toast.error("Error: Invalid Task Record.");
      return;
    }
    
    try {
      await updateTask(id, { status: "DONE" });
      const newReviews = [...pendingReviews];
      newReviews.splice(idx, 1);
      setPendingReviews(newReviews);
      toast.success("Clearance check successfully approved & synced to database.");
    } catch(err) {
      toast.error("Error updating task in database.");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Department Clearance Panel</h1>

      <p className="mb-4 text-gray-700">
        You have <span className="font-semibold">{pendingReviews.length}</span> pending clearance reviews.
      </p>

      {loading ? (
        <div className="p-12 flex justify-center text-gray-400">Loading clearance panels...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingReviews.length === 0 && (
             <div className="col-span-3 text-gray-500">No pending clearances found!</div>
          )}
          {pendingReviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              <h2 className="font-semibold text-lg">{review.department} Clearance</h2>
              <p className="mt-2 text-sm text-gray-500">{review.title}</p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Assigned To:</span> {review.reviewer}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-medium">Due Date:</span> {review.dueDate}
              </p>
              <button
                className="mt-4 w-full bg-[#0A2342] text-white py-2 rounded hover:bg-blue-800 transition shadow-sm"
                onClick={() => handleApprove(review.id, index)}
              >
                Approve & Clear
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeptClearancePanel;
