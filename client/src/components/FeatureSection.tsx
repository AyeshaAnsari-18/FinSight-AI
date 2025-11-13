import f2 from "../assets/f2.jpg";
import f3 from "../assets/f3.jpg";
import f4 from "../assets/f4.jpg";
import f5 from "../assets/f5.jpg";
import f6 from "../assets/f6.jpg";

interface FeatureSectionProps {
  activeTab: string;
}

const content = {
  "Close Automation": {
    title: "Boost Close Efficiency with Financial Close Automation",
    subtitle: "Enhance close productivity by 40%",
    points: [
      "Real-time dashboard for comprehensive visibility and control",
      "Instant detection of budget discrepancies by variance analysis",
      "Automated journal entry posting to ERP leveraging Livecube, a no-code Excel-like platform",
    ],
    image:f2,
  },
  "Auto Reconciliation": {
    title: "Simplify Account Reconciliation with Automation",
    subtitle: "Reduce reconciliation time by up to 50%",
    points: [
      "Automated matching of transactions with configurable rules",
      "Instant variance analysis to detect mismatched entries",
      "Smart dashboards for reconciliation progress tracking",
    ],
    image:f3,
  },
  "Revenue Recognition": {
    title: "Ensure Compliance with Automated Revenue Recognition",
    subtitle: "Simplify ASC 606 and IFRS 15 compliance",
    points: [
      "Automate revenue scheduling and allocation across performance obligations",
      "Dynamic reporting for deferred and recognized revenue",
      "Integrated audit trails for every revenue event",
    ],
    image:f4,
  },
  "Intercompany Recon": {
    title: "Streamline Intercompany Reconciliation",
    subtitle: "Reduce manual effort and errors in intercompany transactions",
    points: [
      "Automated identification and matching of intercompany entries",
      "Centralized reporting for all subsidiaries",
      "Eliminate discrepancies before financial close",
    ],
    image:f5,
  },
  "Financial Consolidation": {
    title: "Accelerate Financial Consolidation",
    subtitle: "Achieve single-version-of-truth financial statements",
    points: [
      "Automate data aggregation across entities and currencies",
      "Multi-level consolidation with elimination rules",
      "Integrated workflows for faster reporting",
    ],
    image:f6,
  },
  "Anomaly Detection": {
    title: "Detect Financial Anomalies in Real-Time",
    subtitle: "Leverage AI to prevent errors and fraud",
    points: [
      "Machine learning-based anomaly detection for journal entries",
      "Pattern recognition for outliers in budget and transactions",
      "Actionable alerts and recommendations for finance teams",
    ],
    image:f3,
  },
};

const FeatureSection = ({ activeTab }: FeatureSectionProps) => {
  const feature = content[activeTab as keyof typeof content];

  return (
    <section className="flex flex-col lg:flex-row items-center justify-between gap-8">
      {/* Left Text Section */}
      <div className="lg:w-1/2 text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {feature.title}
        </h2>
        <p className="text-gray-700 mb-4">{feature.subtitle}</p>
        <ul className="space-y-3 text-gray-700">
          {feature.points.map((point, i) => (
            <li key={i} className="flex items-start">
              <span className="text-green-600 mr-2">✔</span>
              {point}
            </li>
          ))}
        </ul>

        <button className="mt-8 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white px-6 py-3 rounded-full font-semibold shadow hover:scale-105 transition">
          Next →
        </button>

      </div>

      {/* Right Image Section */}
      <div className="lg:w-1/2 flex justify-center">
        <img
          src={feature.image}
          alt={`${activeTab} illustration`}
          className="rounded-lg shadow-lg border border-white/20 ring-2 ring-white/20"
        />
      </div>
    </section>
  );
};

export default FeatureSection;
