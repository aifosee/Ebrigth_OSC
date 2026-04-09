"use client";

import { useRouter } from "next/navigation";
import WeekSelector from "@/app/components/WeekSelector";

export default function WeekSelectorPage() {
  const router = useRouter();

  return (
    <WeekSelector
      onConfirm={(weekData) => {
        router.push(`/manpower-planning/table?${weekData}`);
      }}
    />
  );
}
