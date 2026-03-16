import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }
  
  return <>{children}</>;
}
