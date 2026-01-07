import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useArticles(filters?: { category?: string; search?: string }) {
  // Construct query string manually since we don't have a sophisticated query builder
  const queryParams = new URLSearchParams();
  if (filters?.category && filters.category !== "All") queryParams.append("category", filters.category);
  if (filters?.search) queryParams.append("search", filters.search);
  
  const queryString = queryParams.toString();
  const path = `${api.articles.list.path}${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: [api.articles.list.path, filters],
    queryFn: async () => {
      const res = await fetch(path);
      if (!res.ok) throw new Error("Failed to fetch articles");
      return api.articles.list.responses[200].parse(await res.json());
    },
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: [api.articles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.articles.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch article");
      return api.articles.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.user.downloadPdf.path, { id });
      const res = await fetch(url, { 
        method: api.user.downloadPdf.method,
        credentials: "include" 
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          const data = await res.json();
          throw new Error(data.message || "Premium subscription required");
        }
        throw new Error("Failed to download PDF");
      }
      
      return api.user.downloadPdf.responses[200].parse(await res.json());
    },
  });
}
