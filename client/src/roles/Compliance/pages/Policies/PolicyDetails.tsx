const PolicyDetails = () => {
  // Dummy detailed data for a policy
  const policy = {
    title: "Data Privacy Policy",
    department: "IT",
    createdOn: "2025-01-15",
    lastUpdated: "2025-11-10",
    description: "Defines how company data must be collected, stored, and shared.",
    complianceLevel: "High",
    responsible: "Alice Smith",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">{policy.title} - Details</h1>

      <div className="bg-white p-6 rounded shadow hover:shadow-md transition max-w-3xl">
        <p>
          <span className="font-semibold">Department:</span> {policy.department}
        </p>
        <p>
          <span className="font-semibold">Created On:</span> {policy.createdOn}
        </p>
        <p>
          <span className="font-semibold">Last Updated:</span> {policy.lastUpdated}
        </p>
        <p className="mt-2">
          <span className="font-semibold">Description:</span> {policy.description}
        </p>
        <p>
          <span className="font-semibold">Compliance Level:</span> {policy.complianceLevel}
        </p>
        <p>
          <span className="font-semibold">Responsible Person:</span> {policy.responsible}
        </p>
      </div>
    </div>
  );
};

export default PolicyDetails;
