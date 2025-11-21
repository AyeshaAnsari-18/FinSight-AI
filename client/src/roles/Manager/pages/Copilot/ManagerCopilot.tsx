import { useState } from "react";

const AICopilot = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Copilot</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <textarea
          className="w-full border p-3 rounded-lg h-40"
          placeholder="Ask the Copilot anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
};

export default AICopilot;
