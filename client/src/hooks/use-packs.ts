import { useQuery } from "@tanstack/react-query";

const MOCK_PACKS = [
  { id: 1, name: "Basic Pack", price: 199, pdfLimit: 1, accessType: "limited_pdfs", features: ["1 PDF Download"] },
  { id: 2, name: "Standard Pack", price: 349, pdfLimit: 2, accessType: "limited_pdfs", features: ["2 PDF Downloads"] },
  { id: 3, name: "Pro Pack", price: 499, pdfLimit: 5, accessType: "limited_pdfs", features: ["5 PDF Downloads"] },
  { id: 4, name: "Lifetime Access", price: 1999, pdfLimit: null, accessType: "lifetime", features: ["Unlimited PDF Downloads", "Lifetime Access"] },
];

export function usePacks() {
  return useQuery({
    queryKey: ['mock-packs'],
    queryFn: async () => MOCK_PACKS,
  });
}
