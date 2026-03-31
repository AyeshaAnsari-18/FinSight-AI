import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Lock, Briefcase, Type } from "lucide-react";
import { useDispatch } from "react-redux";
import api from "../../lib/api"; 
import { setCredentials, decodeToken } from "../../store/authSlice";
import type { AxiosError } from "axios";

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("ACCOUNTANT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Hits the AuthController @Post('signup') endpoint
      const res = await api.post('/auth/signup', { 
        name,
        email, 
        password,
        role 
      });

      const user = decodeToken(res.data.access_token);
      
      if (user) {
        dispatch(setCredentials({
          user,
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token
        }));

        // Route based on role selection
        switch (user.role) {
          case 'ACCOUNTANT':
            navigate("/accountant");
            break;
          case 'MANAGER':
            navigate("/manager");
            break;
          case 'AUDITOR':
            navigate("/auditor");
            break;
          case 'COMPLIANCE':
            navigate("/compliance");
            break;
          default:
            navigate("/dashboard");
            break;
        }
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string | string[] }>;
      console.error(error);
      
      // Handle NestJS class-validator array messages or standard strings
      const messageData = error.response?.data?.message;
      const errorMessage = Array.isArray(messageData) 
        ? messageData[0] 
        : messageData || "Registration failed. Please try again.";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ff]">
      <div className="w-[900px] h-[580px] bg-white shadow-2xl rounded-3xl flex overflow-hidden">

        {/* LEFT SECTION */}
        <div className="w-1/2 px-14 py-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#3b165f] mb-6">Sign up</h2>

          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="relative">
              <Type className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                className="w-full border border-gray-300 cursor-text rounded-full py-2 pl-10 pr-4 text-sm focus:outline-purple-600"
                placeholder="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {/* Email */}
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                className="w-full border border-gray-300 cursor-text rounded-full py-2 pl-10 pr-4 text-sm focus:outline-purple-600"
                placeholder="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <select
                className="w-full border border-gray-300 cursor-pointer rounded-full py-2 pl-10 pr-4 text-sm focus:outline-purple-600 appearance-none bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ACCOUNTANT">Accountant</option>
                <option value="MANAGER">Manager</option>
                <option value="AUDITOR">Auditor</option>
                <option value="COMPLIANCE">Compliance</option>
              </select>
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                className="w-full border border-gray-300 cursor-text rounded-full py-2 pl-10 pr-10 text-sm focus:outline-purple-600"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 cursor-pointer top-[9px] text-gray-500 hover:text-purple-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                className="w-full border border-gray-300 cursor-text rounded-full py-2 pl-10 pr-10 text-sm focus:outline-purple-600"
                placeholder="Confirm Password"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#6a0dad] hover:bg-[#580aaf] text-white py-2 cursor-pointer rounded-full mt-2 transition disabled:opacity-50 font-medium"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          {/* Toggle to Login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 hover:underline font-semibold cursor-pointer">
              Log in
            </Link>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-1/2 bg-[#f5f1ff] flex items-center justify-center overflow-hidden">
          <img
            src="/Login/login-image.jpg" // You can change this to a specific signup image if you have one
            alt="signup"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}