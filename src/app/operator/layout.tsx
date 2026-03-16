import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OperatorLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user || (user.role !== "OPERATOR" && user.role !== "ADMIN")) {
    redirect("/");
  }
  
  return <>{children}</>;
}
