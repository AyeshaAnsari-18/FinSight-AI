import { useState } from "react";
import Navbar from "./components/Navbar";
import FeatureTabs from "./components/FeatureTabs";
import FeatureSection from "./components/FeatureSection";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("Close Automation");

  return (
    <div className="font-sans bg-white min-h-screen">
      <Navbar />
      <main className="px-6 md:px-16 lg:px-24 mt-12">
        <h1 className="text-center text-3xl md:text-4xl font-bold mb-8 text-gray-800">
          FinSight Software
        </h1>
        <FeatureTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <FeatureSection activeTab={activeTab} />
      </main>
    </div>
  );
}

export default App;
