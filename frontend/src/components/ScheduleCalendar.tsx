import { Badge } from "@/components/ui/badge";
import type { Schedule } from "@/types";

const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 05:00 - 23:00

export function ScheduleCalendar({ schedules }: { schedules: Schedule[] }) {
  const byHour = (hour: number) =>
    schedules.filter((s) => {
      const h = parseInt(s.departureTime.split(":")[0], 10);
      return h === hour;
    });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[60px_1fr] gap-0">
          {hours.map((hour) => {
            const hourSchedules = byHour(hour);
            return (
              <div key={hour} className="contents">
                <div className="border-b px-2 py-2 text-xs font-mono text-muted-foreground bg-muted/30">
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div className="border-b px-2 py-1.5 min-h-[36px]" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.25rem", alignItems: "center" }}>
                  {hourSchedules.map((s) => (
                    <Badge key={s.id} variant={s.status === "ACTIVE" ? "success" : s.status === "DELAYED" ? "warning" : "destructive"} className="text-[10px] px-1.5 py-0">
                      {s.trainNumber} {s.departureTime}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
