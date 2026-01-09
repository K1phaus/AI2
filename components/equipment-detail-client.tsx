"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { EquipmentAsset, AssetStatus, AssetCondition } from "@/lib/db/equipment";

const STATUSES: AssetStatus[] = [
  "available",
  "unavailable",
  "conditional",
  "unknown",
];

const CONDITIONS: AssetCondition[] = ["good", "needs_repair", "out_of_service"];

interface EquipmentDetailClientProps {
  equipment: EquipmentAsset;
}

export default function EquipmentDetailClient({
  equipment: initialEquipment,
}: EquipmentDetailClientProps) {
  const router = useRouter();
  const [equipment, setEquipment] = useState(initialEquipment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: equipment.status,
    condition: equipment.condition,
    note: "",
  });

  const handleMarkVerified = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const { data, error: updateError } = await supabase
        .from("equipment_assets")
        .update({ last_verified_at: new Date().toISOString() })
        .eq("id", equipment.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      setEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Unauthorized");
      }

      // Update equipment
      const { data: updated, error: updateError } = await supabase
        .from("equipment_assets")
        .update({
          status: statusForm.status,
          condition: statusForm.condition,
        })
        .eq("id", equipment.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Create history entry
      await supabase.from("asset_status_history").insert({
        asset_type: "equipment",
        asset_id: equipment.id,
        status: statusForm.status,
        condition: statusForm.condition,
        note: statusForm.note || null,
        updated_by: user.id,
      });

      setEquipment(updated);
      setShowStatusModal(false);
      setStatusForm({ ...statusForm, note: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/equipment")}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Equipment
        </button>
        <h1 className="text-2xl font-bold">{equipment.category}</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {equipment.default_image_url ? (
            <img
              src={equipment.default_image_url}
              alt={equipment.category}
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
              No photo
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Category</h2>
            <p className="text-lg">{equipment.category}</p>
          </div>

          {equipment.manufacturer && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Manufacturer
              </h2>
              <p className="text-lg">{equipment.manufacturer}</p>
            </div>
          )}

          {equipment.model && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Model</h2>
              <p className="text-lg">{equipment.model}</p>
            </div>
          )}

          {equipment.serial_number && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Serial Number
              </h2>
              <p className="text-lg">{equipment.serial_number}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Status</h2>
              <p className="text-lg capitalize">{equipment.status}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Condition</h2>
              <p className="text-lg capitalize">
                {equipment.condition.replace("_", " ")}
              </p>
            </div>
          </div>

          {equipment.notes && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Notes</h2>
              <p className="text-lg whitespace-pre-wrap">{equipment.notes}</p>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-gray-500">
              Last Verified
            </h2>
            <p className="text-lg">{formatDate(equipment.last_verified_at)}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Created</h2>
            <p className="text-lg">{formatDate(equipment.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleMarkVerified}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Mark Verified"}
        </button>
        <button
          onClick={() => setShowStatusModal(true)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Set Status
        </button>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Update Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm({
                      ...statusForm,
                      status: e.target.value as AssetStatus,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={statusForm.condition}
                  onChange={(e) =>
                    setStatusForm({
                      ...statusForm,
                      condition: e.target.value as AssetCondition,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optional)
                </label>
                <textarea
                  value={statusForm.note}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, note: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Add a note about this status change..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleStatusUpdate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusForm({
                    status: equipment.status,
                    condition: equipment.condition,
                    note: "",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
