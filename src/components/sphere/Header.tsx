import { Bell, Settings, LayoutGrid, LayoutList } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useViewMode } from "@/contexts/ViewModeContext";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { viewMode, setViewMode, isSimpleView } = useViewMode();
  const now = new Date();
  const greeting = getGreeting();

  function getGreeting() {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  const toggleViewMode = () => {
    setViewMode(isSimpleView ? 'detailed' : 'simple');
  };

  return (
    <div className="flex items-center justify-between flex-1">
      <div>
        <p className="text-base text-foreground font-semibold tracking-tight">
          {greeting}
          {user ? `, ${displayName}` : ""}
        </p>
        <p className="text-sm text-muted-foreground">{format(now, "EEEE, MMMM d")}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* View Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={toggleViewMode}
              className={`p-2 sm:p-2.5 rounded-xl transition-all ${
                isSimpleView 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-muted/80 text-muted-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isSimpleView ? (
                <LayoutList className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSimpleView ? 'Switch to Detailed View' : 'Switch to Simple View'}</p>
          </TooltipContent>
        </Tooltip>

        <button className="p-2 sm:p-2.5 rounded-xl hover:bg-muted/80 active:scale-95 transition-all relative">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full" />
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="sm:flex p-2.5 rounded-xl hover:bg-muted/80 active:scale-95 transition-all"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Header;
