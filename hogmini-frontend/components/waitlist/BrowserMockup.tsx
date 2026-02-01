"use client";

import FeatureToggle from "./FeatureToggle";

const features = [
  { label: "New billing flow", enabled: true },
  { label: "Search improvements", enabled: false },
  { label: "Beta dashboard", enabled: true },
  { label: "Experimental API", enabled: false },
];

export default function BrowserMockup() {
  return (
    <div className="browser-frame w-full max-w-lg mx-auto bg-white border rounded-lg shadow">
      {/* Window Title Bar */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-gray-500 font-light tracking-wide">Feature Flags</span>
        </div>
        <div className="w-14" />
      </div>

      {/* Window Content */}
      <div className="px-6 py-4">
        {features.map((feature) => (
          <FeatureToggle key={feature.label} label={feature.label} enabled={feature.enabled} />
        ))}
      </div>
    </div>
  );
}
