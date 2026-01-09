"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { AssetStatus, AssetCondition } from "@/lib/db/equipment";

const CATEGORIES = [
  "Core Drill",
  "Concrete Saw",
  "Wall Saw",
  "Generator",
  "Water Pump",
  "Drill",
  "Other",
];

const STATUSES: AssetStatus[] = [
  "available",
  "unavailable",
  "conditional",
  "unknown",
];

const CONDITIONS: AssetCondition[] = ["good", "needs_repair", "out_of_service"];

export default function NewEquipmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    manufacturer: "",
    model: "",
    serial_number: "",
    status: "available" as AssetStatus,
    condition: "good" as AssetCondition,
    notes: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();

      // 1. Create equipment row first
      const { data: equipment, error: createError } = await supabase
        .from("equipment_assets")
        .insert({
          category: formData.category,
          manufacturer: formData.manufacturer || null,
          model: formData.model || null,
          serial_number: formData.serial_number || null,
          status: formData.status,
          condition: formData.condition,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      // 2. If photo provided, upload to Storage
      if (photo && equipment) {
        const timestamp = Date.now();
        const fileExt = photo.name.split(".").pop();
        const fileName = `${equipment.id}/${timestamp}.${fileExt}`;
        const filePath = `equipment/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("asset-photos")
          .upload(filePath, photo, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        // 3. Get public URL and update equipment
        const {
          data: { publicUrl },
        } = supabase.storage.from("asset-photos").getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from("equipment_assets")
          .update({ default_image_url: publicUrl })
          .eq("id", equipment.id);

        if (updateError) {
          throw new Error(`Failed to update image URL: ${updateError.message}`);
        }
      }

      // 4. Redirect to equipment detail page
      router.push(`/equipment/${equipment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="manufacturer"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Manufacturer
        </label>
        <input
          type="text"
          id="manufacturer"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="model"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Model
        </label>
        <input
          type="text"
          id="model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="serial_number"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Serial Number
        </label>
        <input
          type="text"
          id="serial_number"
          name="serial_number"
          value={formData.serial_number}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="condition"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="photo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Photo (optional)
        </label>
        <input
          type="file"
          id="photo"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {photo && (
          <p className="mt-1 text-sm text-gray-500">
            Selected: {photo.name} ({(photo.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-md">{error}</div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Equipment"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
