import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, LogIn, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, isLoading, signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/projects");
    }
  }, [isLoading, setLocation, user]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google girişi başlatılamadı");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4">
      <Card className="w-full max-w-md cyber-panel bg-card/70 border-primary/30 backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Layers className="w-6 h-6" />
            <span className="font-display tracking-wider">OBS WEB STUDIO</span>
          </div>
          <CardTitle className="font-display text-2xl">Giriş Yap</CardTitle>
          <CardDescription>
            Projelerinizi yönetmek için Google hesabınızla giriş yapın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Yönlendiriliyor...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Google ile Giriş Yap
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground pt-2">
            Login gerekmeden yayın görüntülemek için{" "}
            <Link href="/" className="text-primary hover:underline">
              ana sayfaya
            </Link>{" "}
            gidebilirsiniz.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

