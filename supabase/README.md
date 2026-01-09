# Supabase Schema Setup

This directory contains the database schema for the AI Inventory + Readiness app.

## Files

- `schema.sql` - Complete database schema with tables, enums, indexes, and RLS policies

## How to Apply the Schema

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query** to create a new SQL query

### Step 2: Paste and Run the Schema

1. Open `supabase/schema.sql` in your code editor
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click the **Run** button (or press `Cmd+Enter` / `Ctrl+Enter`)

### Step 3: Verify Tables Were Created

1. Navigate to **Table Editor** in the left sidebar
2. You should see the following tables:
   - `vehicles`
   - `equipment_assets`
   - `readiness_requirements`
   - `asset_status_history`

3. Verify the enums were created:
   - Navigate to **Database** → **Types** in the left sidebar
   - You should see:
     - `asset_status`
     - `asset_condition`

### Step 4: Verify RLS is Enabled

1. In **Table Editor**, click on any table (e.g., `vehicles`)
2. Click the **Policies** tab
3. You should see RLS policies listed for each operation (SELECT, INSERT, UPDATE, etc.)

### Step 5: Test the Schema (Optional)

You can test the schema by running a simple query in the SQL Editor:

```sql
-- Test: Insert a test vehicle (replace auth.uid() with a real user ID if needed)
INSERT INTO vehicles (asset_id, description, created_by)
VALUES ('TEST-1', 'Test Vehicle', auth.uid())
RETURNING *;

-- Test: Query vehicles
SELECT * FROM vehicles;

-- Test: Insert equipment
INSERT INTO equipment_assets (category, manufacturer, created_by)
VALUES ('Core Drill', 'Test Manufacturer', auth.uid())
RETURNING *;
```

## Schema Overview

### Tables

1. **vehicles** - Stores vehicle information (trucks, vans, etc.)
   - Key fields: `asset_id`, `status`, `condition`, `license_plate`, `vin`

2. **equipment_assets** - Stores equipment/tools that can be assigned to vehicles
   - Key fields: `category`, `manufacturer`, `model`, `assigned_vehicle_id`

3. **readiness_requirements** - Defines what equipment each vehicle needs
   - Links vehicles to required equipment categories

4. **asset_status_history** - Audit trail for status and condition changes
   - Tracks all changes to asset status and condition over time

### Enums

- **asset_status**: `available`, `unavailable`, `conditional`, `unknown`
- **asset_condition**: `good`, `needs_repair`, `out_of_service`

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow authenticated users to view all rows
- Allow authenticated users to create rows (with `created_by` or `updated_by` set to their user ID)
- Allow authenticated users to update/delete rows (permissive for working concept)

**Note:** These policies are intentionally permissive for the working concept. You should tighten them in production based on your access control requirements.

## Troubleshooting

### Error: "relation already exists"
If you see this error, the tables already exist. You can either:
1. Drop existing tables first (be careful - this deletes data!)
2. Use `CREATE TABLE IF NOT EXISTS` (modify schema.sql)
3. Manually drop tables via Table Editor if you want to start fresh

### Error: "type already exists"
The enums already exist. You can either:
1. Drop them first: `DROP TYPE IF EXISTS asset_status CASCADE;`
2. Or skip the enum creation if they already exist

### RLS Policies Not Working
1. Verify RLS is enabled: Check the table's settings in Table Editor
2. Verify you're authenticated: Make sure you're logged in when testing
3. Check policy conditions: Review the policy SQL in the Policies tab

## Storage Bucket Setup

### Create the `asset-photos` Bucket

1. Navigate to **Storage** in the Supabase Dashboard
2. Click **New bucket**
3. Configure the bucket:
   - **Name**: `asset-photos`
   - **Public bucket**: ✅ Enable (for working concept - can be hardened later)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp` (optional)
4. Click **Create bucket**

### Storage Path Convention

Photos are stored using this path pattern:
```
equipment/{equipmentId}/{timestamp}.jpg
```

Example: `equipment/123e4567-e89b-12d3-a456-426614174000/1704067200000.jpg`

### Storage RLS Policies (Optional)

For the working concept, a public bucket is sufficient. If you want to add RLS later:

1. Go to **Storage** → **Policies** for the `asset-photos` bucket
2. Add policies to control read/write access based on authentication

## Next Steps

After applying the schema:

1. **Set up your Next.js app** to connect to these tables
2. **Create API routes** or use Supabase client directly to query/insert data
3. **Add triggers** (optional) to auto-populate `asset_status_history` when status/condition changes
4. **Tighten RLS policies** based on your access control requirements
5. **Create the Storage bucket** for asset photos (see above)

## Example Queries

### Get all vehicles with their assigned equipment
```sql
SELECT 
  v.asset_id,
  v.description,
  v.status,
  e.category,
  e.manufacturer,
  e.model
FROM vehicles v
LEFT JOIN equipment_assets e ON e.assigned_vehicle_id = v.id
ORDER BY v.asset_id;
```

### Get readiness status for a vehicle
```sql
SELECT 
  v.asset_id,
  r.required_category,
  r.is_required,
  CASE 
    WHEN e.id IS NOT NULL THEN 'assigned'
    ELSE 'missing'
  END as status
FROM vehicles v
JOIN readiness_requirements r ON r.vehicle_id = v.id
LEFT JOIN equipment_assets e ON e.assigned_vehicle_id = v.id 
  AND e.category = r.required_category
WHERE v.id = 'your-vehicle-id-here';
```

### Get status history for an asset
```sql
SELECT 
  asset_type,
  status,
  condition,
  note,
  updated_at,
  updated_by
FROM asset_status_history
WHERE asset_type = 'vehicle' AND asset_id = 'your-asset-id-here'
ORDER BY updated_at DESC;
```
