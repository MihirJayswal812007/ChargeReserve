// Local icon re-export shim.
// Importing lucide-react icons through a local module boundary
// prevents Turbopack HMR "module factory is not available" bugs
// that occur when importing directly from the lucide-react barrel in
// shared client components (e.g. Navbar in the root layout).
export {
  Zap,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Map,
  Cog,
  ShieldCheck,
  Menu,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  Clock,
  CreditCard,
  Star,
  Sun,
  Moon,
} from "lucide-react";
