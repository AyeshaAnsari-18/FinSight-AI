const AllPolicies = () => {
  const policies = [
    { id: 1, title: "Data Privacy Policy", department: "IT", status: "Active" },
    { id: 2, title: "Employee Conduct Policy", department: "HR", status: "Active" },
    { id: 3, title: "Financial Reporting Policy", department: "Finance", status: "Pending" },
    { id: 4, title: "Access Control Policy", department: "IT", status: "Active" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">All Policies</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50">
                <td className="p-2 border">{policy.id}</td>
                <td className="p-2 border">{policy.title}</td>
                <td className="p-2 border">{policy.department}</td>
                <td className="p-2 border">{policy.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllPolicies;
