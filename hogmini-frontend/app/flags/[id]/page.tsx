/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FlagDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [flag, setFlag] = useState<any>(null);
  const [rollout, setRollout] = useState(0); // 0 to 100
  const [loading, setLoading] = useState(true);

  // Fetch Flag Details
  useEffect(() => {
    fetch(`http://localhost:3001/flags/details/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFlag(data);

        // Check if there is an existing rollout rule
        const rule = data.rules?.find((r: any) => r.type === "percentage");
        if (rule) setRollout(rule.value);
        else setRollout(100); // Default to 100% if no rule exists

        setLoading(false);
      });
  }, [id]);

  // Save Changes
  const handleSave = async () => {
    // Construct the Rules JSON
    // If rollout is 100%, we don't need a rule (Global On)
    // If rollout is < 100%, we create the rule
    const newRules = [];
    if (rollout < 100) {
      newRules.push({ type: "percentage", value: rollout });
    }

    await fetch(`http://localhost:3001/flags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rules: newRules,
        isActive: true, // Force ON if we are setting rules
      }),
    });

    // show toast on save
    // sonner's toast is imported dynamically to avoid adding client import at top
    const { toast } = await import("sonner");
    toast.success("Saved!");
    router.back();
  };

  if (loading) return <div className="p-12 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-white mb-6"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2">{flag.key}</h1>
        <p className="text-gray-400 mb-8">
          {flag.description || "No description"}
        </p>

        {/* ROLLOUT SLIDER */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Targeting Rules</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Percentage Rollout:{" "}
              <span className="text-indigo-400 font-bold">{rollout}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={rollout}
              onChange={(e) => setRollout(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Users are hashed by ID. This ensures the same users always stay in
              the selected percentage.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded font-medium"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
