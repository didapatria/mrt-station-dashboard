import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmitFeedback } from "@/hooks/use-feedback";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const mutation = useSubmitFeedback();

  const reset = () => {
    setRating(0);
    setHoveredRating(0);
    setCategory("");
    setMessage("");
  };

  const handleSubmit = () => {
    if (!rating || !category || !message.trim()) return;
    mutation.mutate(
      { rating, category, message },
      {
        onSuccess: () => {
          toast.success(t("feedback.success"));
          reset();
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("feedback.error"));
        },
      }
    );
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageSquare className="h-5 w-5" />
            {t("feedback.title")}
          </DialogTitle>
          <DialogDescription>{t("feedback.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("feedback.rating")}</Label>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                    lineHeight: 1,
                  }}
                >
                  <Star
                    className="h-7 w-7 transition-colors"
                    style={{
                      fill: star <= displayRating ? "#f59e0b" : "transparent",
                      color: star <= displayRating ? "#f59e0b" : "hsl(var(--muted-foreground))",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("feedback.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("feedback.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">{t("feedback.categories.general")}</SelectItem>
                <SelectItem value="bug">{t("feedback.categories.bug")}</SelectItem>
                <SelectItem value="feature">{t("feedback.categories.feature")}</SelectItem>
                <SelectItem value="ux">{t("feedback.categories.ux")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-message">{t("feedback.message")}</Label>
            <Textarea
              id="feedback-message"
              rows={4}
              placeholder={t("feedback.messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!rating || !category || !message.trim() || mutation.isPending}
            >
              {mutation.isPending ? t("common.loading") : t("feedback.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
