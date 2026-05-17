import { useMutation } from "@tanstack/react-query";
import {
  feedbackService,
  type FeedbackPayload,
} from "@/services/feedback.service";

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (data: FeedbackPayload) => feedbackService.submit(data),
  });
}
