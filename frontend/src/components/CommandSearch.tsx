import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Clock,
  Map,
  User,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStations } from "@/hooks/use-stations";

const navPages = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Stations", path: "/stations", icon: MapPin },
  { name: "Schedules", path: "/schedules", icon: Clock },
  { name: "Station Map", path: "/map", icon: Map },
  { name: "Profile", path: "/profile", icon: User },
];

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data } = useStations({ limit: 100 });
  const stations = useMemo(() => data?.stations ?? [], [data]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { pages: navPages, stations: stations.slice(0, 5) };

    return {
      pages: navPages.filter((p) => p.name.toLowerCase().includes(q)),
      stations: stations
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            s.location.toLowerCase().includes(q),
        )
        .slice(0, 5),
    };
  }, [query, stations]);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search pages, stations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 shadow-none"
          />
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-75 overflow-y-auto p-2">
          {filtered.pages.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pages
              </p>
              {filtered.pages.map((page) => (
                <button
                  key={page.path}
                  onClick={() => handleSelect(page.path)}
                  className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <page.icon className="h-4 w-4 text-muted-foreground" />
                  {page.name}
                </button>
              ))}
            </div>
          )}

          {filtered.stations.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Stations
              </p>
              {filtered.stations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleSelect(`/stations?q=${station.name}`)}
                  className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {station.code}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{station.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {station.location}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filtered.pages.length === 0 && filtered.stations.length === 0 && (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No results found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
