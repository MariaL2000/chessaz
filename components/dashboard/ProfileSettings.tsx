/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { updateUserProfile } from "@/actions/profile/update-profile";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, Upload, User as UserIcon } from "lucide-react";

export default function ProfileSettings() {
  const { user, updateUser } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user?.name || "");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [preview, setPreview] = useState(user?.image || "");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageBase64(base64String);
      setPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!user?.id) {
      setMessage({ type: "error", text: "Usuario no autenticado." });
      return;
    }

    startTransition(async () => {
      const result: { ok: boolean; message: string; user?: any } =
        await updateUserProfile({
          userId: user.id,
          name,
          imageBase64: imageBase64 ? imageBase64 : undefined,
        });

      if (result.ok) {
        setMessage({ type: "success", text: result.message });

        // Actualizamos el estado global para reflejar los cambios en la Navbar, Sidebar y vistas
        updateUser({
          name: name,
          image: result.user?.image ?? preview,
        });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  return (
    <div className="max-w-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-main)] tracking-tight">
        Profile Settings
      </h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border transition-all ${
            message.type === "success"
              ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-700 border-rose-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-full bg-[var(--color-bg-beige)] flex items-center justify-center overflow-hidden border-2 border-[var(--color-gold)] shadow-inner shrink-0">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-10 w-10 text-[var(--color-text-muted)]" />
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-gold-hover)] transition-colors shadow-sm">
              <Upload className="h-4 w-4" />
              Change Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Recommended: 1:1 ratio, max size up to 10MB.
            </p>
          </div>
        </div>

        {/* Campo de Nombre */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-beige)]/30 text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all font-medium"
          />
        </div>

        {/* Botón de Guardar */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-[var(--color-blue)] text-white font-semibold rounded-xl hover:bg-[var(--color-blue-hover)] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
