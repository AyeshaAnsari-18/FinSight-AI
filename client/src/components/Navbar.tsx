import finsightLogo from "../assets/finsight.jpg";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img
            src={finsightLogo}
            alt="FinSight AI Logo"
            className="h-8 w-auto object-contain"
        />

      </div>

      {/* Nav links */}
      <div className="flex items-center space-x-6 text-gray-800 font-medium">
        <a
          href="#"
          className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white px-3 py-1 rounded-full font-medium shadow transition"
        >
          Home
        </a>
        <a
          href="#"
          className="hover:text-blue-900 transition px-3 py-1 rounded-full"
        >
          Charts
        </a>
        <a
          href="#"
          className="hover:text-blue-900 transition px-3 py-1 rounded-full"
        >
          Audits
        </a>
        <a
          href="#"
          className="hover:text-blue-900 transition px-3 py-1 rounded-full"
        >
          Reconciliations
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
