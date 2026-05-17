import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/use-auth";
import { motion } from "framer-motion";
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
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "0.75rem",
      }}
      className={({ isActive }) =>
        cn(
          "nav-link-item rounded-md text-sm font-medium",
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
          isActive
            ? collapsed
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/70",
        )
      }
    >
      <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
      {!collapsed && <span>{t(item.labelKey)}</span>}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { token, user } = useAuthStore();
  const { isAdmin } = useRole();
  const logout = useLogout();
  const navigate = useNavigate();
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
    <div className="flex flex-col h-full">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0 1rem",
          height: "3.5rem",
          flexShrink: 0,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), oklch(0.6 0.2 220))",
            boxShadow:
              "0 0 10px color-mix(in oklch, var(--color-primary) 40%, transparent)",
          }}
        >
          <Train
            style={{
              width: 15,
              height: 15,
              color: "var(--color-primary-foreground)",
            }}
          />
        </div>
        {!collapsed && (
          <span
            className="font-display text-base tracking-wide"
            style={{ letterSpacing: "0.06em" }}
          >
            MRT JAKARTA
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3" data-tour="sidebar-nav">
        {visibleGroups.map((group) => (
          <div key={group.labelKey} className="mb-3">
            {!collapsed && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 8px",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-muted-foreground)",
                    opacity: 0.7,
                  }}
                >
                  {t(group.labelKey)}
                </span>
                <span
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--color-border)",
                    opacity: 0.5,
                  }}
                />
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
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <OnboardingTour />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full border-r hidden lg:flex lg:flex-col transition-all duration-200",
          collapsed ? "nav-collapsed" : "",
          sidebarWidth,
        )}
        style={{
          background: "var(--color-sidebar)",
        }}
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
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.75rem",
            height: "3.5rem",
            padding: "0 1rem",
            borderBottom: "1px solid var(--color-border)",
          }}
          className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl"
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
            <span className="inline-flex items-center gap-2 text-xs">
              <Search style={{ width: 14, height: 14 }} />
              {t("common.search")}
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
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
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || "")}`}
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
