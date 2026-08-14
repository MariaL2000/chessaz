import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResourceDTO } from "@/types/resource";
import {
  getFilteredResources,
  getRecentResources,
  getPendingResources,
  getCommunityResources,
  getResourceByTeacherId,
  ResourceFilterOptions,
} from "@/actions/resources/getResourceActions";

interface ResourceState {
  resources: ResourceDTO[];
  recentResources: ResourceDTO[];
  pendingResources: ResourceDTO[];
  communityResources: ResourceDTO[];
  teacherResources: ResourceDTO[];

  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  fetchRecentResources: (limit?: number) => Promise<void>;
  fetchFilteredResources: (filters: ResourceFilterOptions) => Promise<void>;
  fetchPendingResources: () => Promise<void>;
  fetchCommunityResources: (limit?: number) => Promise<void>;
  fetchTeacherResources: (teacherId: string) => Promise<void>; // <--- Acción

  addResourceLocally: (resource: ResourceDTO) => void;
  updateResourceStatusLocally: (id: string, isPublished: boolean) => void;
  removeResourceLocally: (id: string) => void;
}

export const useResourceStore = create<ResourceState>()(
  persist(
    (set, get) => ({
      resources: [],
      recentResources: [],
      pendingResources: [],
      communityResources: [],
      teacherResources: [],

      hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

      fetchRecentResources: async (limit = 15) => {
        const res = await getRecentResources(limit);
        if (res.ok) {
          set({ recentResources: res.resources });
        }
      },

      fetchFilteredResources: async (filters: ResourceFilterOptions) => {
        const res = await getFilteredResources(filters);
        if (res.ok) {
          set({ resources: res.resources });
        }
      },

      fetchPendingResources: async () => {
        const res = await getPendingResources();
        if (res.ok) {
          set({ pendingResources: res.resources });
        }
      },

      fetchCommunityResources: async (limit = 50) => {
        const res = await getCommunityResources(limit);
        if (res.ok) {
          set({ communityResources: res.resources });
        }
      },

      fetchTeacherResources: async (teacherId: string) => {
        const res = await getResourceByTeacherId(teacherId); // O la función correspondiente de tus actions
        if (res.ok) {
          set({ teacherResources: res.resources });
        }
      },

      addResourceLocally: (resource: ResourceDTO) => {
        set((state) => ({
          pendingResources: [resource, ...state.pendingResources],
          teacherResources: [resource, ...state.teacherResources],
        }));
      },

      updateResourceStatusLocally: (id: string, isPublished: boolean) => {
        set((state) => {
          const updateList = (list: ResourceDTO[]) =>
            list.map((r) => (r.id === id ? { ...r, isPublished } : r));

          return {
            pendingResources: state.pendingResources.filter((r) => r.id !== id),
            recentResources: updateList(state.recentResources),
            communityResources: updateList(state.communityResources),
            teacherResources: updateList(state.teacherResources),
          };
        });
      },

      removeResourceLocally: (id: string) => {
        set((state) => ({
          pendingResources: state.pendingResources.filter((r) => r.id !== id),
          recentResources: state.recentResources.filter((r) => r.id !== id),
          communityResources: state.communityResources.filter(
            (r) => r.id !== id,
          ),
          teacherResources: state.teacherResources.filter((r) => r.id !== id),
        }));
      },
    }),
    {
      name: "resource-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
