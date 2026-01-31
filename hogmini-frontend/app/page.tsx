"use client";
import { useState } from "react";
import FlagList from "../components/FlagList";

export default function Home() {
  const [projectId, setProjectId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          HogMini Dashboard
        </h1>
        <p className="text-gray-400 mb-8">Production Grade Feature Flags</p>

        {!isLoggedIn ? (
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Project ID
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Paste UUID here..."
                className="flex-1 rounded-md border-0 bg-gray-800 py-1.5 px-3 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setIsLoggedIn(true)}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Access Dashboard
              </button>
            </div>
          </div>
        ) : (
          <FlagList projectId={projectId} />
        )}
      </div>
    </main>
  );
}