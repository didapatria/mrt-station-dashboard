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
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/stations", icon: MapPin, label: "Stations" },
  { to: "/schedules", icon: Clock, label: "Schedules" },
  { to: "/map", icon: Map, label: "Station Map" },
  { to: "/profile", icon: User, label: "Profile" },
];

function SidebarContent({
  onNavClick,
  user,
  onLogout,
}: {
  onNavClick?: () => void;
  user: { name: string; role: string; email: string } | null;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <Train className="h-8 w-8 text-sidebar-accent" />
        <div>
          <h1 className="font-bold text-sidebar-foreground">MRT Jakarta</h1>
          <p className="text-xs text-muted-foreground">Station Dashboard</p>
        </div>
      </div>

      <nav className="p-4 space-y-1 flex-1">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-white"
                        : "text-sidebar-foreground hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );
}

export default function DashboardLayout() {
  const { token, user } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border hidden lg:flex lg:flex-col">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-sidebar border-sidebar-border"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            onNavClick={() => setSheetOpen(false)}
            user={user}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex-1" />

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm hidden sm:inline">{user?.name}</span>
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
        <main className="p-6">
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
