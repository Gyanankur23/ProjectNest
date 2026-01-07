import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function usePacks() {
  return useQuery({
    queryKey: [api.packs.list.path],
    queryFn: async () => {
      const res = await fetch(api.packs.list.path);
      if (!res.ok) throw new Error("Failed to fetch packs");
      return api.packs.list.responses[200].parse(await res.json());
    },
  });
}
