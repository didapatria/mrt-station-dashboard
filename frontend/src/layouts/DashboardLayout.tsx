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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { useRealtimeNotifications } from "@/hooks/use-sse";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  labelKey: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { to: "/stations", icon: MapPin, labelKey: "nav.stations" },
  { to: "/schedules", icon: Clock, labelKey: "nav.schedules" },
  { to: "/map", icon: Map, labelKey: "nav.stationMap" },
  { to: "/users", icon: Users, labelKey: "nav.users", adminOnly: true },
  { to: "/activity", icon: Activity, labelKey: "nav.activityLog" },
  { to: "/profile", icon: User, labelKey: "nav.profile" },
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
          "rounded-md text-sm font-medium transition-colors",
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
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
  useRealtimeNotifications();

  if (!token) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <Train
            style={{
              width: 16,
              height: 16,
              color: "var(--color-primary-foreground)",
            }}
          />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight">
            MRT Jakarta
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {!collapsed && (
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("nav.menu")}
          </p>
        )}
        <div className="space-y-1">
          {visibleNav.map((item) => (
            <NavItemLink
              key={item.to}
              item={item}
              onClick={onNavClick}
              collapsed={collapsed}
              t={t}
            />
          ))}
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-card border-r hidden lg:flex lg:flex-col transition-all duration-200",
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
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.75rem",
            height: "3.5rem",
            padding: "0 1rem",
            borderBottom: "1px solid var(--color-border)",
          }}
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg"
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

          <CommandSearch />
          <LanguageToggle />
          <ThemeToggle />
          <Separator orientation="vertical" className="h-5" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <Avatar className="h-7 w-7">
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
