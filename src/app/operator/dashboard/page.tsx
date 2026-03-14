import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import OperatorDashboardClient from "./operator-dashboard-client";

export default async function OperatorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OPERATOR" && user.role !== "ADMIN") redirect("/dashboard");

  return <OperatorDashboardClient userName={user.name} />;
}
