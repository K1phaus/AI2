import Link from "next/link";
import { listEquipmentAssets } from "@/lib/db/equipment";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800";
    case "unavailable":
      return "bg-red-100 text-red-800";
    case "conditional":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default async function EquipmentListPage() {
  const equipment = await listEquipmentAssets();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment</h1>
        <Link
          href="/equipment/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Equipment
        </Link>
      </div>

      {equipment.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No equipment found.</p>
          <Link
            href="/equipment/new"
            className="text-blue-600 hover:underline"
          >
            Add your first piece of equipment
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manufacturer / Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Truck
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipment.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => (window.location.href = `/equipment/${item.id}`)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.default_image_url ? (
                      <img
                        src={item.default_image_url}
                        alt={item.category}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No photo
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/equipment/${item.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {item.category}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {item.manufacturer || "—"}
                    </div>
                    {item.model && (
                      <div className="text-sm text-gray-500">{item.model}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    —
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
