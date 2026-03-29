import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const { login } = useUser();
  const [, setLocation] = useLocation();

  const handleAuth = () => {
    login(email || "gyanankur@projectnest.com");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="mb-8 cursor-pointer" onClick={() => setLocation("/")}>
        <h1 className="text-4xl font-black font-display tracking-tight text-primary">
          Project<span className="text-orange-500">Nest</span>
        </h1>
      </div>
      
      <Card className="w-full max-w-sm shadow-xl border-orange-500/20">
        <CardHeader className="text-center">
          <h2 className="font-display text-2xl font-bold">Welcome Back</h2>
          <CardDescription>Enter your email to sign in or register.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="name@example.com" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAuth} className="w-full bg-orange-500 hover:bg-orange-600 font-bold text-md h-12">
            Continue seamlessly
          </Button>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-sm text-muted-foreground max-w-sm text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
