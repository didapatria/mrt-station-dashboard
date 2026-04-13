import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
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
  ChevronRight,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandSearch } from "@/components/CommandSearch";
import { useRole } from "@/hooks/use-role";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/stations", icon: MapPin, label: "Stations" },
  { to: "/schedules", icon: Clock, label: "Schedules" },
  { to: "/map", icon: Map, label: "Station Map" },
  { to: "/users", icon: Users, label: "Users", adminOnly: true },
  { to: "/activity", icon: Activity, label: "Activity Log" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

function SidebarContent({
  onNavClick,
  user,
  onLogout,
  isAdmin,
  collapsed,
  onToggle,
}: {
  onNavClick?: () => void;
  user: { name: string; role: string; email: string } | null;
  onLogout: () => void;
  isAdmin: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const visibleNav = navItems.filter(
    (item) => !("adminOnly" in item && item.adminOnly) || isAdmin
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo — h-14 matches header */}
      <div className="flex items-center gap-3 px-4 h-14 shrink-0 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <Train className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight truncate">
            MRT Jakarta
          </span>
        )}
        {onToggle && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 shrink-0 text-muted-foreground"
            onClick={onToggle}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {!collapsed && (
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </p>
        )}
        <TooltipProvider delayDuration={0}>
          {visibleNav.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
                      collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      <Separator />

      {/* User Section */}
      <div className={cn("shrink-0", collapsed ? "p-2" : "p-3")}>
        {collapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center w-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {user?.name} ({user?.role})
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {user?.role}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Logout
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { token, user } = useAuthStore();
  const { isAdmin } = useRole();
  const logout = useLogout();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarWidth = collapsed ? "w-16" : "w-60";
  const sidebarPl = collapsed ? "lg:pl-16" : "lg:pl-60";

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-card border-r hidden lg:flex lg:flex-col transition-all duration-200",
          sidebarWidth
        )}
      >
        <SidebarContent
          user={user}
          onLogout={handleLogout}
          isAdmin={isAdmin}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            onNavClick={() => setSheetOpen(false)}
            user={user}
            onLogout={handleLogout}
            isAdmin={isAdmin}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className={cn("transition-all duration-200", sidebarPl)}>
        {/* Top bar — h-14 matches sidebar logo area */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/80 backdrop-blur-lg px-4 h-14">
          {/* Mobile menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden lg:flex text-muted-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1" />

          {/* Search */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-muted-foreground w-48 justify-between"
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              )
            }
          >
            <span className="flex items-center gap-2 text-xs">
              <Search className="h-3.5 w-3.5" />
              Search...
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <CommandSearch />

          <ThemeToggle />

          <Separator orientation="vertical" className="h-5" />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                  {user?.name}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground hidden sm:block rotate-90" />
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
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
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
