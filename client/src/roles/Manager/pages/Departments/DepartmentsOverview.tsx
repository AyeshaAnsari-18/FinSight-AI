/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import api from "../../../../lib/api";

const DepartmentsOverview = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/users/departments"); 
        setDepartments(res.data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  if (loading) return <div className="p-6 text-[#0A2342] font-bold">Loading Departments...</div>;

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
              <th className="p-2 border">Active Employees</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="p-2 border">{dept.id}</td>
                <td className="p-2 border font-medium text-[#0A2342]">{dept.name}</td>
                <td className="p-2 border text-gray-600">{dept.head}</td>
                <td className="p-2 border font-bold text-center">{dept.employees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentsOverview;