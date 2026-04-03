"use client";

interface FeatureToggleProps {
  label: string;
  enabled: boolean;
}

export default function FeatureToggle({ label, enabled }: FeatureToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <span className="text-sm font-normal tracking-tight text-gray-800">{label}</span>
      <div className={`relative w-12 h-6 rounded-full ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </div>
    </div>
  );
}
