import { useQuery, useMutation } from "@tanstack/react-query";

const MOCK_ARTICLES = [
  { id: 1, title: "10 Agile Best Practices", content: "# 10 Agile Best Practices\n\n1. Standups\nKeep them short and focused. Every team member answers: What did I do yesterday? What will I do today? Are there any blockers?\n\n2. Sprints\nPlan in manageable 2-week increments to maintain quality.\n\n3. Retrospectives\nAlways look back and see how you can improve as a team. Be honest, but entirely blameless.", category: "Agile", isPremium: false, generatedByAi: false, pdfUrl: "#", createdAt: new Date() },
  { id: 2, title: "Risk Management Strategies 2024", content: "# Risk Management\n\nIdentifying risks early is the key to project survival. \n### 1. Risk Register\nMaintain an active log of all constraints.\n### 2. Mitigation Strategy\nCreate automated responses to identified triggers.\n### 3. Stakeholder Comms\nOver-communicate when a risk flips to an active issue.", category: "Risk", isPremium: true, generatedByAi: true, pdfUrl: "#", createdAt: new Date() },
  { id: 3, title: "Mastering the Product Backlog", content: "# Product Backlog\n\nPrioritization frameworks are essential for avoiding scope creep. \n\nWe recommend using the **MoSCoW Method**:\n- **M**ust have\n- **S**hould have\n- **C**ould have\n- **W**on't have", category: "Agile", isPremium: true, generatedByAi: false, pdfUrl: "#", createdAt: new Date() }
];

export function useArticles(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['mock-articles', filters],
    queryFn: async () => {
      let result = [...MOCK_ARTICLES];
      if (filters?.category && filters.category !== "All") result = result.filter(a => a.category === filters.category);
      if (filters?.search) result = result.filter(a => a.title.toLowerCase().includes(filters.search!.toLowerCase()));
      return result;
    },
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: ['mock-article', id],
    queryFn: async () => {
      return MOCK_ARTICLES.find(a => a.id === id) || null;
    },
    enabled: !!id,
  });
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: async (id: number) => {
      return { url: "#" };
    },
  });
}
