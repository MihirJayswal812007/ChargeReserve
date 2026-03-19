"use client";

import { Crown, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PremiumCardProps {
  isPremium: boolean;
  expiresAt?: Date | null;
}

export default function PremiumCard({ isPremium, expiresAt }: PremiumCardProps) {
  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border border-amber-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Crown className="w-16 h-16 text-amber-500 rotate-12" />
        </div>
        
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Crown className="w-4 h-4" /> Premium Member
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          Enjoying priority booking, lower rates, and exclusive station access.
        </p>
        
        {expiresAt ? (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-amber-500/5 w-fit px-2.5 py-1 rounded-full border border-amber-500/10">
            <Star className="w-3 h-3 text-amber-500" />
            Active until {new Date(expiresAt).toLocaleDateString()}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-amber-500/5 w-fit px-2.5 py-1 rounded-full border border-amber-500/10">
            <Star className="w-3 h-3 text-amber-500" />
            Lifetime Access
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Star className="w-16 h-16 text-primary -rotate-12" />
      </div>

      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Star className="w-4 h-4 text-primary" /> Go Premium
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Unlock priority booking, 15% discount on all charges, and early access to new superchargers.
      </p>

      <ul className="space-y-2 mb-5">
        {[
          "Priority Booking Slots",
          "Lower Price/kWh",
          "Ad-free Experience"
        ].map((feat) => (
          <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            {feat}
          </li>
        ))}
      </ul>
      
      <Button className="w-full shadow-lg shadow-primary/20 group/btn" asChild>
        <Link href="/premium">
          Upgrade Now
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  );
}
