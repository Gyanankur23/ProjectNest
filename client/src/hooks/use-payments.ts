import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function usePayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyPayment = useMutation({
    mutationFn: async (data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      packId: number;
    }) => {
      const res = await fetch(api.payments.verify.path, {
        method: api.payments.verify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Payment verification failed");
      return api.payments.verify.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.user.me.path] });
      toast({
        title: "Payment Successful!",
        description: "Your premium features are now unlocked.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createOrder = useMutation({
    mutationFn: async (packId: number) => {
      const res = await fetch(api.payments.createOrder.path, {
        method: api.payments.createOrder.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
        credentials: "include",
      });
      
      if (res.status === 401) throw new Error("Please login to continue");
      if (!res.ok) throw new Error("Failed to create order");
      
      return api.payments.createOrder.responses[200].parse(await res.json());
    },
    onSuccess: (data, packId) => {
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ProjectNest",
        description: "Premium Pack Purchase",
        order_id: data.orderId,
        handler: async function (response: any) {
          verifyPayment.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            packId,
          });
        },
        theme: {
          color: "#f97316", // Orange-500
        },
      };

      if (!window.Razorpay) {
        toast({
          title: "Error",
          description: "Razorpay SDK not loaded",
          variant: "destructive",
        });
        return;
      }

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
      if (error.message.includes("login")) {
        window.location.href = "/api/login";
      }
    },
  });

  return { createOrder, verifyPayment };
}
