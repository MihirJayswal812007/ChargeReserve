import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminDashboardClient from "./admin-dashboard-client";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return <AdminDashboardClient />;
}
