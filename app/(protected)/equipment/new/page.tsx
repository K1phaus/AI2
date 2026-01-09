import { redirect } from "next/navigation";
import NewEquipmentForm from "@/components/new-equipment-form";

export default function NewEquipmentPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Equipment</h1>
      <NewEquipmentForm />
    </div>
  );
}
