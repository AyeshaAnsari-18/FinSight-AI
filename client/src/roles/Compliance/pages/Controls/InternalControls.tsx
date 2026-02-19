const InternalControls = () => {
  
  const internalControls = [
    { control: "Access Management", owner: "Alice Smith", status: "Active" },
    { control: "Change Management", owner: "John Doe", status: "Active" },
    { control: "Data Backup", owner: "Jane Williams", status: "Inactive" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Internal Controls</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Control</th>
              <th className="p-2 border">Owner</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {internalControls.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border">{row.control}</td>
                <td className="p-2 border">{row.owner}</td>
                <td className="p-2 border">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternalControls;
