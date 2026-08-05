"use client";

import { useState, useTransition } from "react";
import {
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { createReview } from "@/actions/reviews/create-review";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ResourceReviewsProps {
  resourceId: string;
  userId: string;
  initialReviews: ReviewItem[];
}

export default function ResourceReviews({
  resourceId,
  userId,
  initialReviews,
}: ResourceReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (comment.length < 30) {
      setError("The review must be at least 30 characters long.");
      return;
    }

    startTransition(async () => {
      const res = await createReview({
        resourceId,
        userId,
        rating,
        comment,
      });

      if (res.ok && res.review) {
        setReviews([res.review, ...reviews]);
        setComment("");
        setSuccess("Review published successfully!");
        setCurrentIndex(0);
      } else {
        setError(res.message || "Failed to submit review.");
      }
    });
  };

  return (
    <div className="space-y-6 w-full bg-[var(--color-bg-card)] p-6 rounded-2xl border border-[var(--color-border-custom)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--color-gold)]" />
          Student Reviews ({reviews.length})
        </h3>
      </div>

      {/* CARRUSEL DE RESEÑAS */}
      {reviews.length > 0 ? (
        <div className="relative bg-[var(--color-bg-beige)] p-6 rounded-xl border border-[var(--color-border-custom)]">
          <div className="min-h-[100px] flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    reviews[currentIndex].user.image || "/default-avatar.png"
                  }
                  alt={reviews[currentIndex].user.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-[var(--color-gold)]"
                />
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                    {reviews[currentIndex].user.name || "Anonymous User"}
                  </h4>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {new Date(
                      reviews[currentIndex].createdAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < reviews[currentIndex].rating
                        ? "text-[var(--color-gold)] fill-[var(--color-gold)]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-main)] italic">
              "{reviews[currentIndex].comment}"
            </p>
          </div>

          {reviews.length > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] hover:bg-[var(--color-gold-light)] transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] hover:bg-[var(--color-gold-light)] transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)] italic text-center py-6">
          No reviews yet. Be the first to share your experience!
        </p>
      )}

      {/* FORMULARIO PARA ESCRIBIR REVIEW */}
      {userId && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 pt-4 border-t border-[var(--color-border-custom)]"
        >
          <h4 className="font-bold text-sm text-[var(--color-text-main)]">
            Write a Review
          </h4>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              Rating:
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating
                        ? "text-[var(--color-gold)] fill-[var(--color-gold)]"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review here (minimum 30 characters)..."
              rows={3}
              className="w-full p-3 rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-beige)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
            />
            <div className="flex justify-between items-center mt-1">
              <span
                className={`text-xs ${
                  comment.length < 30 ? "text-rose-500" : "text-emerald-600"
                }`}
              >
                {comment.length}/30 characters minimum
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-600 font-medium">{success}</p>
          )}

          <button
            type="submit"
            disabled={isPending || comment.length < 30}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-gold)] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
            {isPending ? "Submitting..." : "Post Review"}
          </button>
        </form>
      )}
    </div>
  );
}
