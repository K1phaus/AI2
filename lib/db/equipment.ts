import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AssetStatus = "available" | "unavailable" | "conditional" | "unknown";
export type AssetCondition = "good" | "needs_repair" | "out_of_service";

export interface EquipmentAsset {
  id: string;
  category: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  assigned_vehicle_id: string | null;
  last_verified_at: string | null;
  default_image_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateEquipmentInput {
  category: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  notes?: string;
  default_image_url?: string;
}

/**
 * Create a new equipment asset
 */
export async function createEquipmentAsset(
  input: CreateEquipmentInput
): Promise<EquipmentAsset> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("equipment_assets")
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create equipment: ${error.message}`);
  }

  return data;
}

/**
 * List all equipment assets
 */
export async function listEquipmentAssets(): Promise<EquipmentAsset[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("equipment_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list equipment: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single equipment asset by ID
 */
export async function getEquipmentAsset(
  id: string
): Promise<EquipmentAsset | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("equipment_assets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to get equipment: ${error.message}`);
  }

  return data;
}

/**
 * Update equipment asset
 */
export async function updateEquipmentAsset(
  id: string,
  updates: Partial<CreateEquipmentInput>
): Promise<EquipmentAsset> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("equipment_assets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update equipment: ${error.message}`);
  }

  return data;
}

/**
 * Mark equipment as verified (sets last_verified_at)
 */
export async function markEquipmentVerified(id: string): Promise<EquipmentAsset> {
  return updateEquipmentAsset(id, {
    last_verified_at: new Date().toISOString(),
  } as any);
}

/**
 * Update equipment status and condition, and create history entry
 */
export async function updateEquipmentStatus(
  id: string,
  status: AssetStatus,
  condition: AssetCondition,
  note?: string
): Promise<EquipmentAsset> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Update the equipment
  const updated = await updateEquipmentAsset(id, { status, condition });

  // Create history entry
  await supabase.from("asset_status_history").insert({
    asset_type: "equipment",
    asset_id: id,
    status,
    condition,
    note: note || null,
    updated_by: user.id,
  });

  return updated;
}
