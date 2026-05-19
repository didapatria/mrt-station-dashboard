import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { stationService } from "@/services/station.service";

export function CSVImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<string[][]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text
        .split("\n")
        .map((r) => r.split(",").map((c) => c.trim()));
      setPreview(rows.slice(0, 6));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (preview.length < 2) return;
    setImporting(true);
    const headers = preview[0].map((h) => h.toLowerCase());
    const nameIdx = headers.indexOf("name");
    const codeIdx = headers.indexOf("code");
    const locationIdx = headers.indexOf("location");
    const orderIdx = headers.indexOf("order");

    if (nameIdx === -1 || codeIdx === -1 || locationIdx === -1) {
      toast.error("CSV must have name, code, location columns");
      setImporting(false);
      return;
    }

    let success = 0;
    let failed = 0;
    for (let i = 1; i < preview.length; i++) {
      const row = preview[i];
      if (!row[nameIdx]) continue;
      try {
        await stationService.create({
          name: row[nameIdx],
          code: row[codeIdx]?.toUpperCase(),
          location: row[locationIdx],
          status: "ACTIVE" as const,
          order: orderIdx !== -1 ? Number(row[orderIdx]) || i : i,
        });
        success++;
      } catch {
        failed++;
      }
    }
    toast.success(
      `Imported ${success} stations${failed > 0 ? `, ${failed} failed` : ""}`,
    );
    queryClient.invalidateQueries({ queryKey: ["stations"] });
    setImporting(false);
    setPreview([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Stations CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with name, code, location, order columns.
          </DialogDescription>
        </DialogHeader>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-sm border rounded-md p-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
        />
        {preview.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-muted/50">
                  {preview[0].map((h, i) => (
                    <th key={i} className="px-2 py-1 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b">
                    {row.map((c, ci) => (
                      <td key={ci} className="px-2 py-1">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-2">
              Showing first {preview.length - 1} rows
            </p>
          </div>
        )}
        <div className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || preview.length < 2}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
