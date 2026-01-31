"use client";
import { useState } from "react";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  projectId: string;
}

export default function ConnectModal({ isOpen, onClose, apiKey, projectId }: ConnectModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippet = `import { HogMini } from "hogmini-node";

// 1. Initialize with your API Key
const hog = new HogMini(
  "http://localhost:3001", // Change to your deployed URL later
  "${apiKey}"
);

await hog.init();

// 2. Check a flag
if (hog.get("new-feature", { userId: "user_123" })) {
  console.log("Feature is ON");
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg w-full max-w-4xl shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-white">Connect to your App</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-6">
          {/* Step 1: Install */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">1. Install the SDK</h3>
            <div className="bg-black rounded border border-gray-700 p-3 font-mono text-sm text-green-400">
              npm install hogmini-node
            </div>
          </div>

          {/* Step 2: Code Snippet */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-300">2. Initialize Client</h3>
              <button 
                onClick={handleCopy}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <div className="bg-black rounded border border-gray-700 p-4 font-mono text-sm text-gray-300 overflow-x-auto relative">
              <pre>{codeSnippet}</pre>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-gray-800/50 rounded p-4 border border-gray-700/50">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Configuration Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-gray-400">Project ID</span>
                <span className="font-mono text-sm text-white select-all">{projectId}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400">API Key</span>
                <span className="font-mono text-sm text-white truncate select-all whitespace-break-spaces wrap-break-word">{apiKey}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}