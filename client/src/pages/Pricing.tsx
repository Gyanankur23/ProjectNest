import { usePacks } from "@/hooks/use-packs";
import { usePayments } from "@/hooks/use-payments";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Pricing() {
  const { data: packs, isLoading } = usePacks();
  const { createOrder } = usePayments();
  const { user } = useUser();

  // Helper to check if this pack is currently owned (simplified logic)
  // In a real app, we'd check against payment history or subscription status details
  const isCurrentPlan = (packAccessType: string) => {
    if (!user) return false;
    if (packAccessType === 'lifetime' && user.subscriptionStatus === 'lifetime') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 py-20 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Invest in Your <span className="text-gradient">Growth</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to access premium templates, AI insights, and expert knowledge.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packs?.map((pack, idx) => (
              <PricingCard 
                key={pack.id} 
                pack={pack} 
                popular={idx === 2} // Just an example, maybe 'Pro' is popular
                onBuy={() => createOrder.mutate(pack.id)}
                isPending={createOrder.isPending}
                isCurrent={isCurrentPlan(pack.accessType)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PricingCard({ pack, popular, onBuy, isPending, isCurrent }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(
        "h-full flex flex-col relative transition-all duration-300 hover:shadow-xl",
        popular ? "border-orange-500 shadow-lg shadow-orange-500/10 scale-105 z-10" : "border-border"
      )}>
        {popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Most Popular
          </div>
        )}
        
        <CardHeader className="text-center pt-8">
          <h3 className="text-xl font-bold font-display">{pack.name}</h3>
          <div className="mt-4 flex items-baseline justify-center">
            <span className="text-4xl font-extrabold tracking-tight">₹{pack.price}</span>
            <span className="text-muted-foreground ml-1">/once</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {pack.pdfLimit ? `${pack.pdfLimit} PDF Downloads` : "Unlimited Access"}
          </p>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <ul className="space-y-3 mt-4">
            {pack.features?.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 rounded-full bg-green-100 p-0.5 dark:bg-green-900/30">
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter className="pb-8">
          <Button 
            className={cn(
              "w-full font-semibold", 
              popular ? "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25" : ""
            )}
            size="lg"
            onClick={onBuy}
            disabled={isPending || isCurrent}
            variant={popular ? "default" : "outline"}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : isCurrent ? (
              "Current Plan"
            ) : (
              "Buy Now"
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
