import api from "./api";

export interface FeedbackPayload {
  rating: number;
  category: string;
  message: string;
}

export const feedbackService = {
  async submit(data: FeedbackPayload) {
    const res = await api.post("/feedback", data);
    return res.data;
  },
};
