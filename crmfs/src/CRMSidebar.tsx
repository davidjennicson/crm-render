import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Kanban,
  MessageSquare,
  Settings,
  Search,
  Workflow,
  Moon,
  Sun,
  LogOut,
  User,
  HelpCircle,
  BarChart3,
  ChevronDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  UsersRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Task", url: "/tasks", icon: CheckSquare },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Deals", url: "/deals", icon: Kanban },
  { title: "Teams", url: "/teams", icon: UsersRound },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function CRMSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const collapsed = !isMobile && isCollapsed;
  const sidebarWidth = collapsed ? "w-[80px]" : "w-[260px]";


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine if we are effectively in dark mode
  const isDarkMode = 
    theme === "dark" || 
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Derive display info from user
  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? "";
  const avatarLetters = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={`${sidebarWidth} h-full flex flex-col bg-sidebar border-sidebar-border border-r transition-all duration-300 relative`}
    >
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground z-20 shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Logo */}
      <div className={`h-16 flex items-center ${collapsed ? "justify-center px-0" : "px-5"} gap-2.5 border-b border-sidebar-border transition-all`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight text-foreground whitespace-nowrap overflow-hidden">
            Nexus CRM
          </span>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-3 text-center">
        <button
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2.5 px-3"} py-2 rounded-lg text-[13px] bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all h-9`}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="whitespace-nowrap">Search</span>
              <kbd className="ml-auto text-[11px] font-medium px-1.5 py-0.5 border border-border bg-background rounded opacity-50 shrink-0">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>


      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <motion.button
                key={item.url}
                onClick={() => navigate(item.url)}
                className={`relative w-full flex items-center ${collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"} rounded-lg text-[13px] font-medium transition-colors h-9 ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
                whileHover={{ x: collapsed ? 0 : 4 }}
                title={collapsed ? item.title : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-muted/80"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
                <item.icon className="relative z-10 w-4 h-4 shrink-0" />
                {!collapsed && <span className="relative z-10 whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>}
                {!collapsed && item.title === "Messages" && (
                  <span className="relative z-10 ml-auto w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center shrink-0">
                    3
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>


      <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => (
          <button
            key={item.url}
            onClick={() => navigate(item.url)}
            title={collapsed ? item.title : undefined}
            className={`w-full flex items-center ${collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"} rounded-lg text-[13px] font-medium transition-all h-9 ${
              location.pathname === item.url
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.title}</span>}
          </button>
        ))}

        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center ${collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"} rounded-lg text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors h-9`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>

        <div className="pt-2 border-t border-sidebar-border mt-2">
          <button
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            title={collapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : undefined}
            className={`w-full flex items-center ${collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"} rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors h-9`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 shrink-0" />
            )}
            {!collapsed && <span className="whitespace-nowrap">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </div>

        {/* User Profile with Avatar Dropdown */}
        <div className="relative mt-2" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full flex items-center ${collapsed ? "justify-center p-1.5" : "gap-2.5 px-3 py-2"} rounded-lg hover:bg-muted transition-colors`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 bg-primary text-primary-foreground">
              {avatarLetters}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-medium truncate text-foreground">
                    {displayName}
                  </p>
                  <p className="text-[11px] truncate text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform text-muted-foreground ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>


          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className={`absolute ${collapsed ? 'left-full ml-2 bottom-0 w-56' : 'left-0 right-0 bottom-full mb-2'} rounded-lg shadow-lg z-50 border bg-popover border-border`}
              >

                {/* Header */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[13px] font-semibold text-foreground">
                    {displayName}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>Profile</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span>Settings</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <HelpCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Help & Support</span>
                  </button>

                  <div className="my-2 border-t border-border" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

export default CRMSidebar;