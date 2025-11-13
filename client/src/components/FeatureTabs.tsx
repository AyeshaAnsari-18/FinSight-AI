import React from "react";

interface FeatureTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  "Close Automation",
  "Auto Reconciliation",
  "Revenue Recognition",
  "Intercompany Recon",
  "Financial Consolidation",
  "Anomaly Detection",
];

const FeatureTabs: React.FC<FeatureTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap justify-center bg-gray-100 py-3 rounded-xl mb-8">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`mx-2 px-5 py-2 rounded-full font-medium transition ${
            activeTab === tab
              ? "bg-gray-800 text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default FeatureTabs;
