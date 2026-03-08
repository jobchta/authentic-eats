import { Search, MapPin, User, Menu, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Dishes", href: "/#dishes" },
    { label: "Restaurants", href: "/#restaurants" },
    { label: "Cuisines", href: "/#cuisines" },
    { label: "Stories", href: "/#stories" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-1.5">
          <span className="font-display text-2xl font-bold text-primary tracking-tight">
            Palate
          </span>
          <span className="text-accent font-display text-xs font-semibold tracking-[0.25em] uppercase mt-1">
            Guide
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            link.href.startsWith("/") && !link.href.startsWith("/#") ? (
              <Link
                key={link.label}
                to={link.href}
                className={`font-body text-sm font-medium transition-colors ${
                  location.pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            )
          ))}
          <Link
            to="/for-restaurants"
            className="font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
          >
            <Crown className="h-3.5 w-3.5" />
            For Restaurants
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
            <MapPin className="h-4 w-4" />
          </Button>
          <Button variant="default" size="sm" className="hidden sm:flex font-body text-xs">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Sign In
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border px-4 py-4">
          {navLinks.map((link) => (
            link.href.startsWith("/") && !link.href.startsWith("/#") ? (
              <Link
                key={link.label}
                to={link.href}
                className="block font-body text-sm font-medium text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="block font-body text-sm font-medium text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            )
          ))}
          <Link
            to="/for-restaurants"
            className="block font-body text-sm font-semibold text-accent py-2"
            onClick={() => setMobileOpen(false)}
          >
            🏪 For Restaurants
          </Link>
          <Button variant="default" size="sm" className="mt-3 w-full font-body">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Sign In
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
