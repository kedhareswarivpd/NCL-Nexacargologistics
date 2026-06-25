"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reviewsApi } from "@/lib/services";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [customerRole, setCustomerRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write your feedback");
      return;
    }
    setLoading(true);
    try {
      await reviewsApi.create({ rating, title: title || null, comment, customer_role: customerRole || null });
      toast.success("Thank you for your feedback!");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to submit feedback");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <CheckCircle2 className="w-20 h-20 text-green-400 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
        <p className="text-on-surface-variant mb-6">Your feedback has been submitted successfully.</p>
        <Link href="/customer">
          <Button className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/customer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2FF] hover:bg-[#00a8e0] transition-colors w-fit shadow-[0_4px_16px_rgba(0,194,255,0.35)]">
        <ArrowLeft className="h-4 w-4 text-[#0B1F3A]" />
        <span className="text-sm font-bold text-[#0B1F3A]">← Back to Dashboard</span>
      </Link>

      <div>
        <p className="text-xs uppercase tracking-widest text-tertiary">Customer Portal</p>
        <h1 className="text-3xl font-bold text-on-surface mt-1">Feedback & Rating</h1>
        <p className="text-sm text-on-surface-variant mt-1">Share your experience with NexaCargo</p>
      </div>

      <Card className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-3">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? "fill-[#00C2FF] text-[#00C2FF]"
                        : "text-white/20"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-on-surface-variant mt-2">
                {rating === 5 ? "Excellent!" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Fair" : "Poor"}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Title (Optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Great service!"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Your Role/Position (Optional)</label>
            <input
              value={customerRole}
              onChange={(e) => setCustomerRole(e.target.value)}
              placeholder="e.g., VP Supply Chain"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Your Feedback</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with NexaCargo..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-tertiary/50 resize-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
            {loading ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Feedback</>}
          </Button>
        </form>
      </Card>
    </div>
  );
}
