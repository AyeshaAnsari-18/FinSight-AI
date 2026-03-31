import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { logOut } from "../../store/authSlice";

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); 
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logOut());
      navigate("/login", { replace: true });
    }
  };

  const handleBack = () => {
    if (!user) {
        navigate('/login');
        return;
    }
    navigate(`/${user.role.toLowerCase()}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold text-[#0A2342]">My Profile</h1>
          <button 
            onClick={handleBack} 
            className="text-white bg-[#0A2342] hover:bg-blue-800 transition px-4 py-2 rounded shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-32 h-32 bg-[#F5C542] rounded-full flex items-center justify-center text-[#0A2342] font-bold text-5xl shadow-md border-4 border-white">
            {user?.name ? user.name.substring(0,2).toUpperCase() : 'UI'}
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Full Name</p>
              <p className="text-lg font-medium text-gray-900">{user?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Email Address</p>
              <p className="text-lg font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">System Role</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm mt-1">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Manager Exclusive Options */}
        {user?.role === 'MANAGER' && (
          <div className="mt-10 p-6 bg-blue-50 border border-blue-100 rounded-xl">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Manager Toolkit</h2>
            <p className="text-blue-700 text-sm mb-4">You have elevated access to manage organization settings and account provisioning.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded shadow opacity-50 cursor-not-allowed">
              Provisions Accounts (Coming Soon)
            </button>
          </div>
        )}

        <div className="mt-10 pt-6 border-t flex justify-end space-x-4">
          <button onClick={handleLogout} className="px-6 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded transition">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
