import { notFound } from "next/navigation";
import { getEquipmentAsset } from "@/lib/db/equipment";
import EquipmentDetailClient from "@/components/equipment-detail-client";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipment = await getEquipmentAsset(id);

  if (!equipment) {
    notFound();
  }

  return <EquipmentDetailClient equipment={equipment} />;
}
