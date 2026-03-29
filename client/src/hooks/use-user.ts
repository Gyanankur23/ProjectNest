import { useQuery, useQueryClient } from "@tanstack/react-query";

export type MockUser = {
  id: string, email: string, firstName: string, lastName: string, subscriptionStatus: string, premiumCredits: number
};

export function useUser() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<MockUser | null>({
    queryKey: ['mock-user'],
    queryFn: () => {
      const stored = localStorage.getItem('mock-user');
      if (stored) return JSON.parse(stored);
      return null;
    },
  });

  const login = (email: string) => {
    const newUser = {
      id: "gyanankur-1",
      email,
      firstName: "Gyanankur",
      lastName: "Baruah",
      subscriptionStatus: "free",
      premiumCredits: 0
    };
    localStorage.setItem('mock-user', JSON.stringify(newUser));
    queryClient.invalidateQueries({ queryKey: ['mock-user'] });
  };

  const logout = () => {
    localStorage.removeItem('mock-user');
    queryClient.invalidateQueries({ queryKey: ['mock-user'] });
  };

  const upgradeToPremium = () => {
    const stored = localStorage.getItem('mock-user');
    if (stored) {
      const u = JSON.parse(stored);
      u.subscriptionStatus = "lifetime";
      // Update local storage
      localStorage.setItem('mock-user', JSON.stringify(u));
      queryClient.invalidateQueries({ queryKey: ['mock-user'] });
    }
  };

  return { user, isLoading, isError: false, isAuthenticated: !!user, login, logout, upgradeToPremium };
}
