"use client";
import { withApi } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

interface CreateFlagModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newFlag: any) => void;
}

export default function CreateFlagModal({ projectId, isOpen, onClose, onSuccess }: CreateFlagModalProps) {
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(withApi(`/flags`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          description,
          projectId,
          isActive: false, // Default to OFF when created
          rules: []        // Default to Global (no complex rules yet)
        }),
      });

      if (!res.ok) throw new Error("Failed to create");

      const newFlag = await res.json();
      onSuccess(newFlag); // Tell parent to update the table
      
      // Reset form
      setKey("");
      setDescription("");
      onClose();
    } catch (error) {
      toast.error("Error creating flag. Make sure the Key is unique.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Create New Feature Flag</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Key Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Flag Key <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.replace(/\s+/g, '-').toLowerCase())} // Force kebab-case
              placeholder="e.g. new-checkout-flow"
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier used in your code.</p>
          </div>

          {/* Description Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this feature do?"
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Flag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}