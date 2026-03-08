import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { allDishImages } from "@/lib/dish-images";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setImgIndex((i) => (i + 1) % allDishImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["", "bg-destructive", "bg-accent", "bg-emerald-500"];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent a confirmation link to verify your account." });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "Password reset link sent." });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: rotating food photography */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {allDishImages.slice(0, 8).map((img, i) => (
          <motion.img
            key={i}
            src={img}
            alt=""
            initial={false}
            animate={{
              opacity: imgIndex % 8 === i ? 1 : 0,
              scale: imgIndex % 8 === i ? 1.05 : 1.15,
            }}
            transition={{ duration: 2 }}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />

        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="absolute bottom-12 left-12 right-12 z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display text-4xl font-bold text-white text-shadow-hero leading-tight"
          >
            Your culinary journey<br />
            <span className="text-gradient-gold italic">starts here.</span>
          </motion.p>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 bg-background flex items-center justify-center px-4 relative">
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />

        <div className="w-full max-w-md relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-body mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Palate Guide
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 shadow-xl border border-accent/10"
          >
            <div className="text-center mb-8">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-display text-3xl font-bold text-foreground"
                >
                  {mode === "login" ? "Welcome Back" : mode === "signup" ? "Join Palate Guide" : "Reset Password"}
                </motion.h1>
              </AnimatePresence>
              <p className="font-body text-sm text-muted-foreground mt-2">
                {mode === "login"
                  ? "Sign in to your food passport"
                  : mode === "signup"
                  ? "Start your global food journey"
                  : "Enter your email to reset your password"}
              </p>
            </div>

            <form
              onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot}
              className="space-y-4"
            >
              {mode === "signup" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <Label htmlFor="displayName" className="font-body text-sm">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="mt-1"
                  />
                </motion.div>
              )}

              <div>
                <Label htmlFor="email" className="font-body text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1"
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <Label htmlFor="password" className="font-body text-sm">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {mode === "signup" && password.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordStrength >= level ? strengthColors[passwordStrength] : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-body text-[10px] text-muted-foreground">
                        {strengthLabels[passwordStrength]}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full font-body font-bold h-12" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                ) : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === "login" && (
                <>
                  <button onClick={() => setMode("forgot")} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Forgot password?
                  </button>
                  <p className="font-body text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
                      Sign Up
                    </button>
                  </p>
                </>
              )}
              {mode === "signup" && (
                <p className="font-body text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                    Sign In
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <button onClick={() => setMode("login")} className="font-body text-sm text-primary font-semibold hover:underline">
                  Back to Sign In
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
