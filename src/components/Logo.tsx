import { Zap } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({ 
  className, 
  iconClassName, 
  textClassName, 
  showText = true 
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className={cn(
        "w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5ff] to-[#7b5ea7] flex items-center justify-center shadow shadow-[#00e5ff]/20 group-hover:shadow-[#00e5ff]/40 transition-shadow duration-300",
        iconClassName
      )}>
        <Zap className="w-4 h-4 text-black" fill="currentColor" />
      </div>
      {showText && (
        <span className={cn(
          "font-bold text-lg tracking-tight text-foreground",
          textClassName
        )}>
          ChargeReserve
        </span>
      )}
    </div>
  );
}
