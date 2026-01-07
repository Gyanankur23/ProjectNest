import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type User } from "@shared/schema";

export function useUser() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: [api.user.me.path],
    queryFn: async () => {
      const res = await fetch(api.user.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.user.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isError: !!error,
    isAuthenticated: !!user,
  };
}
