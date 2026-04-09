import DashboardDetail from "@/app/components/DashboardDetail";

interface DashboardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { id } = await params;
  return <DashboardDetail id={id} />;
}
