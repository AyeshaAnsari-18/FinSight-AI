import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    // 🔐 Authenticate user
    const { data: userData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !userData?.user) {
      setError(loginError?.message || "Login failed");
      return;
    }

    const user = userData.user;

    // 👤 Fetch user's role_id from user_profiles using id = auth.users.id
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error(profileError);
      setError("Error fetching user profile");
      return;
    }

    const roleId = profile.role_id;

    if (!roleId) {
      setError("Role is missing for this user");
      return;
    }

    // 🚀 Redirect based on role_id
    // You can map role_id to role names if you want readable paths
    switch (roleId) {
      case 1: // manager
        localStorage.setItem("role", "manager");
        navigate("/manager");
        break;
      case 2: // accountant
        localStorage.setItem("role", "accountant");
        navigate("/accountant");
        break;
      case 3: // auditor
        localStorage.setItem("role", "auditor");
        navigate("/auditor");
        break;
      case 4: // compliance
        localStorage.setItem("role", "compliance");
        navigate("/compliance");
        break;
      default:
        setError("Invalid role assigned to user");
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ff]">
      <div className="w-[900px] h-[520px] bg-white shadow-2xl rounded-3xl flex overflow-hidden">

        {/* LEFT SECTION */}
        <div className="w-1/2 px-14 py-16 flex flex-col">
          <h2 className="text-3xl font-bold text-[#3b165f] mb-10">Log in</h2>

          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Email */}
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-purple-600"
                placeholder="Email"
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-10 text-sm focus:outline-purple-600"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-[9px] text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-75" /> Remember Me
              </label>
              <button type="button" className="hover:text-purple-600">
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="bg-[#6a0dad] hover:bg-[#580aaf] text-white py-2 rounded-full mt-2 transition"
            >
              Log in
            </button>

            <p className="text-xs text-center text-gray-500">
              or <span className="text-purple-700 cursor-pointer">Sign up</span>
            </p>
          </form>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-1/2 bg-[#f5f1ff] flex items-center justify-center">
          <img
            src="/Login/login-image.jpg"
            alt="login"
            className="object-contain w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
