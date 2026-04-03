/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import CreateFlagModal from "./CreateFlagModal"; // <--- IMPORT THIS
import Link from "next/link";
import ConnectModal from "./ConnectModal";
import { withApi } from "@/lib/api";

interface FeatureFlag {
  id: string;
  key: string;
  isActive: boolean;
  rules: any;
  description?: string;
}

export default function FlagList({ projectId }: { projectId: string }) {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch Flags AND Project Details
  useEffect(() => {
    const loadData = async () => {
      try {
        // Run both requests at the same time (Faster)
        const [flagsRes, projectRes] = await Promise.all([
          fetch(withApi(`/api/projects/${projectId}/flags`)),
          fetch(withApi(`/api/projects/${projectId}`)),
        ]);

        const flagsData = await flagsRes.json();
        const projectData = await projectRes.json();

        setFlags(flagsData.flags || []);

        // Check if projectData actually has the key before setting
        if (projectData && projectData.apiKey) {
          setApiKey(projectData.apiKey);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        // 👇 THIS IS THE MISSING LINE
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const toggleFlag = async (flag: FeatureFlag) => {
    const newStatus = !flag.isActive;
    // Optimistic Update
    setFlags(
      flags.map((f) => (f.id === flag.id ? { ...f, isActive: newStatus } : f)),
    );
    // API Call
    await fetch(withApi(`/flags/${flag.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newStatus }),
    });
  };

  // <--- NEW HELPER: Updates the list when a flag is created
  const handleFlagCreated = (newFlag: FeatureFlag) => {
    setFlags([...flags, newFlag]);
  };

  if (loading) return <div className="text-white">Loading flags...</div>;

  return (
    <div className="mt-8">
      {/* HEADER WITH ACTION BUTTON */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Feature Flags</h2>
        <div className="flex gap-3">
          {/* NEW CONNECT BUTTON */}
          <button
            onClick={() => setIsConnectOpen(true)}
            className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            How to Connect
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            + Create Flag
          </button>
        </div>
      </div>

      {/* THE MODAL */}
      <CreateFlagModal
        projectId={projectId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newFlag) => setFlags([...flags, newFlag])}
      />

      {/* THE NEW MODAL */}
      <ConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        apiKey={apiKey}
        projectId={projectId}
      />

      {/* THE TABLE (Same as before) */}
      <div className="overflow-hidden border border-gray-800 rounded-lg">
        <table className="min-w-full text-left text-sm font-light text-gray-300">
          <thead className="bg-gray-900 font-medium">
            <tr>
              <th className="px-6 py-4">Key</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {flags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No flags found. Create one to get started.
                </td>
              </tr>
            ) : (
              flags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-900/50 transition">
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-white">
                    {flag.key}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <button
                      onClick={() => toggleFlag(flag)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        flag.isActive ? "bg-green-500" : "bg-gray-700"
                      }`}
                    >
                      <span
                        className={`${
                          flag.isActive ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {flag.description || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/flags/${flag.id}`}
                      className="text-indigo-400 hover:text-indigo-300 transition hover:underline"
                    >
                      Settings
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
