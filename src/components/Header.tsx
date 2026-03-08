import { Search, User, Menu, Crown, LogOut, Compass, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Dishes", href: "/#dishes" },
    { label: "Restaurants", href: "/#restaurants" },
    { label: "Cuisines", href: "/#cuisines" },
    { label: "Stories", href: "/#stories" },
    { label: "Food Map", href: "/map" },
    { label: "Pricing", href: "/pricing" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const isDark = theme === "dark";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-1.5 group">
            <motion.span
              whileHover={{ scale: 1.02 }}
              className="font-display text-2xl font-bold text-primary tracking-tight relative gold-shimmer"
            >
              Palate
            </motion.span>
            <span className="text-accent font-display text-xs font-semibold tracking-[0.25em] uppercase mt-1">
              Guide
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href.startsWith("/") && !link.href.startsWith("/#")
                  ? location.pathname === link.href
                  : false;
              const inner = (
                <span className="relative">
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                    />
                  )}
                </span>
              );
              return link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`font-body text-sm font-medium transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {inner}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              );
            })}
            <Link
              to="/for-restaurants"
              className="font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
            >
              <Crown className="h-3.5 w-3.5" />
              For Restaurants
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground relative overflow-hidden"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ y: -20, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ y: -20, opacity: 0, rotate: 90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-4 w-4" />
            </Button>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex font-body text-xs gap-1.5"
                  onClick={() => navigate("/passport")}
                >
                  <Compass className="h-3.5 w-3.5" />
                  Passport
                </Button>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex w-8 h-8 rounded-full bg-primary text-primary-foreground items-center justify-center font-body text-xs font-bold hover:opacity-80 transition-opacity"
                  title="Sign out"
                >
                  {userInitial}
                </button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex font-body text-xs"
                onClick={() => navigate("/auth")}
              >
                <User className="h-3.5 w-3.5 mr-1.5" />
                Sign In
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu - slide in from right */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 bg-background border-l border-border shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-display text-lg font-bold text-primary">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                      <Link
                        to={link.href}
                        className="block font-body text-base font-medium text-foreground py-3 px-3 rounded-xl hover:bg-muted transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="block font-body text-base font-medium text-foreground py-3 px-3 rounded-xl hover:bg-muted transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </a>
                    )}
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link
                    to="/for-restaurants"
                    className="block font-body text-base font-semibold text-accent py-3 px-3 rounded-xl hover:bg-accent/10 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    🏪 For Restaurants
                  </Link>
                </motion.div>

                {/* Mobile dark mode toggle */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="flex items-center gap-3 w-full font-body text-base font-medium text-foreground py-3 px-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </button>
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full font-body"
                      onClick={() => { navigate("/passport"); setMobileOpen(false); }}
                    >
                      <Compass className="h-4 w-4 mr-2" />
                      Food Passport
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full font-body text-muted-foreground"
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full font-body"
                    onClick={() => { navigate("/auth"); setMobileOpen(false); }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
