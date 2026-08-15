import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GuestState {
  verifiedEmails: Record<string, boolean>;
  accessTokens: Record<string, string>;
  downloadUrls: Record<string, string>;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  verifyResource: (
    resourceId: string,
    accessToken?: string,
    downloadUrl?: string,
  ) => void;
  isVerified: (resourceId: string) => boolean;
  getDownloadUrl: (resourceId: string) => string | null;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      verifiedEmails: {},
      accessTokens: {},
      downloadUrls: {},
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      verifyResource: (resourceId, accessToken, downloadUrl) =>
        set((state) => ({
          verifiedEmails: { ...state.verifiedEmails, [resourceId]: true },
          accessTokens: accessToken
            ? { ...state.accessTokens, [resourceId]: accessToken }
            : state.accessTokens,
          downloadUrls: downloadUrl
            ? { ...state.downloadUrls, [resourceId]: downloadUrl }
            : state.downloadUrls,
        })),
      isVerified: (resourceId: string) => {
        if (!get()._hasHydrated) return false;
        return !!get().verifiedEmails[resourceId];
      },
      getDownloadUrl: (resourceId: string) => {
        if (!get()._hasHydrated) return null;
        return get().downloadUrls[resourceId] ?? null;
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
