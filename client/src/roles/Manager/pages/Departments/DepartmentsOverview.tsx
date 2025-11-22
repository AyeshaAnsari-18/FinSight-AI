const DepartmentsOverview = () => {
  const departments = [
    { id: 1, name: "Finance", head: "David", employees: 12 },
    { id: 2, name: "HR", head: "Eve", employees: 8 },
    { id: 3, name: "IT", head: "Frank", employees: 15 },
    { id: 4, name: "Operations", head: "Grace", employees: 10 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Departments Overview</h1>
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Head</th>
              <th className="p-2 border">Employees</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="p-2 border">{dept.id}</td>
                <td className="p-2 border">{dept.name}</td>
                <td className="p-2 border">{dept.head}</td>
                <td className="p-2 border">{dept.employees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentsOverview;
