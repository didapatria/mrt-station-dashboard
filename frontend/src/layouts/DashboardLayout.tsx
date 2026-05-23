import {
  Outlet,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Train,
  LayoutDashboard,
  MapPin,
  Clock,
  LogOut,
  Menu,
  User,
  Settings,
  Map,
  ChevronDown,
  Search,
  Users,
  Activity,
  PanelLeftClose,
  PanelLeft,
  History,
  RefreshCw,
  Navigation,
  KeyRound,
  MessageSquare,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { CommandSearch } from "@/components/CommandSearch";
import { useRole } from "@/hooks/use-role";
import { useQueryClient } from "@tanstack/react-query";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { useRealtimeNotifications } from "@/hooks/use-sse";
import { NotificationCenter } from "@/components/NotificationCenter";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { OnboardingTour } from "@/components/OnboardingTour";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  labelKey: string;
  adminOnly?: boolean;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    labelKey: "nav.menu",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
    ],
  },
  {
    labelKey: "nav.operations",
    items: [
      { to: "/stations", icon: MapPin, labelKey: "nav.stations" },
      { to: "/schedules", icon: Clock, labelKey: "nav.schedules" },
      { to: "/map", icon: Map, labelKey: "nav.stationMap" },
      { to: "/route-planner", icon: Navigation, labelKey: "nav.routePlanner" },
      { to: "/compare", icon: LayoutDashboard, labelKey: "nav.compare" },
      { to: "/command", icon: Monitor, labelKey: "nav.commandCenter" },
      { to: "/incidents", icon: AlertTriangle, labelKey: "nav.incidents" },
    ],
  },
  {
    labelKey: "nav.management",
    items: [
      { to: "/users", icon: Users, labelKey: "nav.users", adminOnly: true },
      {
        to: "/access",
        icon: KeyRound,
        labelKey: "nav.accessManagement",
        adminOnly: true,
      },
      { to: "/activity", icon: Activity, labelKey: "nav.activityLog" },
    ],
  },
  {
    labelKey: "nav.system",
    items: [
      { to: "/settings", icon: Settings, labelKey: "nav.settings" },
      { to: "/changelog", icon: History, labelKey: "nav.changelog" },
      { to: "/profile", icon: User, labelKey: "nav.profile" },
    ],
  },
];

function NavItemLink({
  item,
  onClick,
  collapsed,
  t,
}: {
  item: NavItem;
  onClick?: () => void;
  collapsed?: boolean;
  t: (key: string) => string;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      style={({ isActive }) => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "0.75rem",
        transition: "all 0.15s ease",
        ...(collapsed
          ? {}
          : {
              borderLeft: isActive
                ? "2px solid var(--color-primary)"
                : "2px solid transparent",
              paddingLeft: "calc(12px - 2px)",
              paddingRight: "12px",
              background: isActive ? "rgba(59,130,246,0.08)" : undefined,
              borderRadius: isActive ? 8 : undefined,
            }),
      })}
      className={({ isActive }) =>
        cn(
          "nav-link-item rounded-md text-sm font-medium",
          collapsed ? "justify-center px-2 py-2.5" : "py-2",
          isActive
            ? collapsed
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/70",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className="w-4 h-4 shrink-0"
            style={{
              color: isActive
                ? "var(--color-primary)"
                : "var(--color-muted-foreground)",
            }}
          />
          {!collapsed && <span>{t(item.labelKey)}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { token, user } = useAuthStore();
  const { isAdmin } = useRole();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const queryClient = useQueryClient();
  useRealtimeNotifications();

  if (!token) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleGroups = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((g) => g.items.length > 0);
  const sidebarWidth = collapsed ? "w-16" : "w-60";
  const sidebarPl = collapsed ? "lg:pl-16" : "lg:pl-60";

  const sidebarNav = (onNavClick?: () => void) => (
    <div className="flex flex-col h-full relative">
      {/* Dot grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(59,130,246,0.8) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Logo bar */}
      <div className="flex flex-row items-center gap-3 px-4 h-14 shrink-0 border-b border-[rgba(59,130,246,0.2)] relative z-1">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), oklch(0.6 0.2 220))",
            boxShadow:
              "0 0 10px color-mix(in oklch, var(--color-primary) 40%, transparent)",
          }}
        >
          <Train className="w-3.75 h-3.75 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col gap-px">
            <span className="font-display text-base tracking-[0.06em]">
              MRT JAKARTA
            </span>
            <span className="sidebar-group-label tracking-[0.16em]">
              N-S LINE
            </span>
          </div>
        )}
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-3 relative z-1"
        data-tour="sidebar-nav"
      >
        {visibleGroups.map((group) => (
          <div key={group.labelKey} className="mb-3">
            {!collapsed && (
              <div className="flex items-center gap-1.5 px-2 mb-1.5">
                <span className="sidebar-group-label">{t(group.labelKey)}</span>
                <span className="sidebar-sep-line" />
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItemLink
                  key={item.to}
                  item={item}
                  onClick={onNavClick}
                  collapsed={collapsed}
                  t={t}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-[rgba(255,255,255,0.04)] px-4 py-2.5 flex items-center justify-between shrink-0 relative z-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.25 h-1.25 rounded-full bg-[#22c55e] shadow-[0_0_4px_rgba(34,197,94,0.6)] shrink-0" />
            <span className="sidebar-sub-text">SYS ONLINE</span>
          </div>
          <span className="font-mono text-[8px] tracking-widest text-[rgba(29,111,232,0.3)]">
            v2.17.0
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full border-r hidden lg:flex lg:flex-col transition-all duration-200 bg-sidebar",
          collapsed ? "nav-collapsed" : "",
          sidebarWidth,
        )}
      >
        {sidebarNav()}
      </aside>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {sidebarNav(() => setSheetOpen(false))}
        </SheetContent>
      </Sheet>

      <div className={cn("transition-all duration-200", sidebarPl)}>
        <header
          className="sticky top-0 z-30 backdrop-blur-xl flex flex-row items-center gap-3 h-14 px-4 border-b border-border"
          style={{
            background:
              "linear-gradient(180deg, var(--color-sidebar) 0%, color-mix(in oklch, var(--color-background) 85%, var(--color-sidebar) 15%) 100%)",
          }}
        >
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden lg:inline-flex text-muted-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1" />

          <Button
            data-tour="search-btn"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex items-center gap-2 text-muted-foreground w-48 justify-between"
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true }),
              )
            }
          >
            <span className="inline-flex items-center gap-2 text-xs font-mono">
              <Search className="w-3.5 h-3.5" />
              {t("common.search")}
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground font-mono">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hidden sm:inline-flex"
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <CommandSearch />
          <span className="hidden sm:inline">
            <KeyboardShortcuts />
          </span>
          <span data-tour="notifications">
            <NotificationCenter />
          </span>
          <span data-tour="language" className="hidden sm:inline">
            <LanguageToggle />
          </span>
          <span data-tour="theme">
            <ThemeToggle />
          </span>
          <Separator orientation="vertical" className="h-5" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-2"
                data-tour="user-menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || "")}`
                    }
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium max-w-25 truncate">
                  {user?.name}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  {user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <Settings className="h-4 w-4 mr-2" />
                {t("nav.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("feedback.title")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="p-4 md:p-6">
          <PageBreadcrumb />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
