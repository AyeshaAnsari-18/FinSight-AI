const ControlTesting = () => {
  
  const testingData = [
    { control: "Access Control", testedOn: "2025-11-20", result: "Pass" },
    { control: "Segregation of Duties", testedOn: "2025-11-18", result: "Fail" },
    { control: "Approval Workflow", testedOn: "2025-11-19", result: "Pass" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Control Testing</h1>

      <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Control</th>
              <th className="p-2 border">Tested On</th>
              <th className="p-2 border">Result</th>
            </tr>
          </thead>
          <tbody>
            {testingData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border">{row.control}</td>
                <td className="p-2 border">{row.testedOn}</td>
                <td className="p-2 border">{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlTesting;
