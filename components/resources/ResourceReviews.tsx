"use client";

import React, { useState } from "react";
import { useGuestStore } from "@/store/useGuestStore";
import { createReview } from "@/actions/reviews/create-review"; // Ajusta la ruta si es necesario
import { Star } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string; image: string };
  createdAt: Date;
}

interface ResourceReviewsProps {
  resourceId: string;
  userId: string;
  guestIdentifier: string; // <-- 1. Agregado aquí
  initialReviews: ReviewItem[];
}

export default function ResourceReviews({
  resourceId,
  userId,
  guestIdentifier,
  initialReviews,
}: ResourceReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Verificamos si el invitado ya completó el checkout (guardado en Zustand) o si existe la cookie del servidor
  const isGuestVerifiedInStore = useGuestStore((state) =>
    state.isVerified(resourceId),
  );
  const isVerified = !!userId || isGuestVerifiedInStore || !!guestIdentifier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Si es guest, usamos el guestIdentifier como userId para la Server Action
    const activeUserId = userId || guestIdentifier;

    const res = await createReview({
      resourceId,
      userId: activeUserId,
      rating,
      comment,
    });

    if (res.ok && res.review) {
      setReviews([res.review as ReviewItem, ...reviews]);
      setComment("");
      setRating(5);
    } else {
      setErrorMessage(res.message || "Error creating review");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-[var(--color-text-main)]">
        Reviews ({reviews.length})
      </h3>

      {isVerified ? (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-[var(--color-text-main)]">
            Leave your review
          </h4>
          {errorMessage && (
            <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-1">
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
                        ? "text-[var(--color-gold)] fill-current"
                        : "text-[var(--color-text-muted)]"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review (at least 30 characters)..."
              rows={3}
              className="w-full p-3 rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-beige)] text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[var(--color-gold)] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Post Review"}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          Complete the checkout process or verify your email to leave a review.
        </div>
      )}

      {/* Lista de reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 border border-[var(--color-border-custom)] rounded-xl bg-[var(--color-bg-card)] space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[var(--color-text-main)]">
                {review.user?.name || "Verified Guest"}
              </span>
              <div className="flex items-center gap-1 text-[var(--color-gold)]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold">{review.rating}</span>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
