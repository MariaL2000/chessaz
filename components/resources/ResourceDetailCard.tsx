"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Download, ShoppingCart, Trash2 } from "lucide-react";
import type { ResourceDTO } from "@/types/resource";
import {
  reviewResource,
  deleteResource,
} from "@/actions/resources/adminResourceActions";
import { ResourceCheckoutModal } from "@/components/resources/ResourceCheckoutModal";

interface ResourceDetailCardProps {
  resource: ResourceDTO;
  userRole?: "ADMIN" | "TEACHER" | "guest"; // Rol STUDENT eliminado
  onDelete?: (resourceId: string) => void;
  adminUserId?: string;
  isPending?: boolean;
}

export const ResourceDetailCard: React.FC<ResourceDetailCardProps> = ({
  resource,
  userRole = "guest",
  onDelete,
  adminUserId,
  isPending = false,
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    resource.previewUrl || resource.imageUrl || null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = userRole === "ADMIN";
  const isFree = resource.price === 0;

  // Si es Admin, tiene acceso administrativo, si no, siempre abre el modal
  const canPerformAdminActions = isAdmin;

  const handleActionClick = (e: React.MouseEvent) => {
    if (!canPerformAdminActions) {
      e.preventDefault();
      setShowCheckout(true);
    }
  };

  const handleReviewAction = async (action: "APPROVE" | "REJECT") => {
    if (!adminUserId) return;
    setIsProcessing(true);
    await reviewResource({ resourceId: resource.id, adminUserId, action });
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (!adminUserId) {
      onDelete?.(resource.id);
      return;
    }
    setIsProcessing(true);
    await deleteResource({ resourceId: resource.id, adminUserId });
    setIsProcessing(false);
  };

  if (showCheckout) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <ResourceCheckoutModal
          resourceId={resource.id}
          slug={resource.slug || resource.id}
          price={resource.price}
          title={resource.title}
          onClose={() => setShowCheckout(false)}
        />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="w-full max-w-[320px] rounded-2xl overflow-hidden border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] shadow-xs flex flex-col mx-auto"
    >
      <Link
        href={`/resources/${resource.slug || resource.id}`}
        className="block h-44 bg-[var(--color-bg-beige-dark)] relative overflow-hidden"
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={resource.title}
            fill
            className="object-cover"
            onError={() => setImgSrc(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full opacity-50">
            <BookOpen className="w-12 h-12" />
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold uppercase bg-[var(--color-gold-light)] text-[var(--color-gold)] px-2 py-0.5 rounded">
            {resource.category}
          </span>
          <span className="font-bold text-sm">
            {isFree ? "FREE" : `$${resource.price}`}
          </span>
        </div>

        <h3 className="font-bold text-sm mb-4 line-clamp-2">
          {resource.title}
        </h3>

        <div className="mt-auto pt-4 border-t border-[var(--color-border-custom)]">
          {isAdmin ? (
            <div className="flex gap-2">
              {isPending ? (
                <>
                  <button
                    onClick={() => handleReviewAction("APPROVE")}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewAction("REJECT")}
                    className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/resources/${resource.slug}`}
                    className="flex-1 py-2 text-center bg-[var(--color-gold-light)] rounded-xl text-xs font-bold"
                  >
                    View
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2.5 bg-rose-600 text-white rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={handleActionClick}
              className="w-full py-2 flex items-center justify-center gap-2 bg-[var(--color-gold)] text-white rounded-xl text-xs font-bold"
            >
              {isFree ? (
                <Download className="w-3.5 h-3.5" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              {isFree ? "Get Resource" : `Buy $${resource.price}`}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
