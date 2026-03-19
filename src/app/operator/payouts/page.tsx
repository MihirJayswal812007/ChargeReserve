import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, ArrowRightLeft, Building } from "lucide-react";

export const metadata = {
  title: "Payouts | Operator Dashboard",
};

export default async function OperatorPayoutsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OPERATOR" && user.role !== "ADMIN") redirect("/dashboard");

  // Fetch stations owned by the user
  const stations = await prisma.station.findMany({
    where: { operatorId: user.userId },
    include: {
      chargers: {
        include: {
          bookings: {
            include: {
              payment: true
            }
          }
        }
      }
    }
  });

  // Calculate earnings
  let totalEarnings = 0;

  stations.forEach(station => {
    station.chargers.forEach(charger => {
      charger.bookings.forEach(booking => {
        if (booking.payment && booking.payment.status === "COMPLETED") {
          totalEarnings += booking.payment.amount;
        }
      });
    });
  });

  // Since this is a prototype, we'll mock withdrawn and available balance
  const platformFee = totalEarnings * 0.1; // 10% platform fee
  const netEarnings = totalEarnings - platformFee;
  const withdrawn = 0; // mocked
  const availableBalance = netEarnings - withdrawn;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts & Revenue</h1>
          <p className="text-muted-foreground mt-1">
            Manage your earnings and transfer funds to your bank account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button disabled={availableBalance <= 0}>
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Gross Revenue</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Before platform fees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Earnings</CardTitle>
            <Building className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{netEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              After 10% platform fee
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Available for Payout</CardTitle>
            <ArrowRightLeft className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{availableBalance.toFixed(2)}</div>
            <p className="text-xs text-primary/80 mt-1">
              Ready to withdraw
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>History of your withdrawals (Mocked data for prototype)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border border-dashed rounded-lg">
            <CreditCard className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium">No payouts yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">You haven&apos;t made any withdrawals yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
