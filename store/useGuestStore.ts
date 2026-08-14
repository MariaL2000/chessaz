import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GuestState {
  verifiedEmails: Record<string, boolean>;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  verifyResource: (resourceId: string, email: string) => void;
  isVerified: (resourceId: string) => boolean;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      verifiedEmails: {},
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      verifyResource: (resourceId: string) =>
        set((state) => ({
          verifiedEmails: { ...state.verifiedEmails, [resourceId]: true },
        })),
      isVerified: (resourceId: string) => {
        // Si no se ha hidratado, por seguridad devolvemos false para que coincida con el SSR
        if (!get()._hasHydrated) return false;
        return !!get().verifiedEmails[resourceId];
      },
    }),
    {
      name: "chess-guest-verification",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
