const DeptClearancePanel = () => {
  // Dummy data for pending reviews
  const pendingReviews = [
    { department: "Finance", reviewer: "Alice Smith", dueDate: "2025-11-25" },
    { department: "HR", reviewer: "John Doe", dueDate: "2025-11-27" },
    { department: "IT", reviewer: "Jane Williams", dueDate: "2025-11-28" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Department Clearance Panel</h1>

      <p className="mb-4 text-gray-700">
        You have <span className="font-semibold">{pendingReviews.length}</span> pending clearance reviews.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pendingReviews.map((review, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded shadow hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{review.department} Department</h2>
            <p className="mt-2">
              <span className="font-medium">Reviewer:</span> {review.reviewer}
            </p>
            <p className="mt-1">
              <span className="font-medium">Due Date:</span> {review.dueDate}
            </p>
            <button
              className="mt-4 w-full bg-[#0A2342] text-white py-2 rounded hover:bg-[#0A2342] transition"
              onClick={() => alert(`Opening review for ${review.department}`)}
            >
              View Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeptClearancePanel;
