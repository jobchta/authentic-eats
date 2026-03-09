import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp, Heart } from "lucide-react";

const socialLinks = [
  { label: "Twitter", icon: "𝕏", href: "#" },
  { label: "Instagram", icon: "📷", href: "#" },
  { label: "YouTube", icon: "▶", href: "#" },
  { label: "TikTok", icon: "♪", href: "#" },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground to-black" />
      <div className="absolute inset-0 noise" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <span className="font-display text-2xl font-bold text-background tracking-tight">
                Palate
              </span>
              <span className="text-accent font-display text-sm font-medium tracking-widest uppercase">
                Guide
              </span>
            </Link>
            <p className="font-body text-sm text-background/50 mb-6 leading-relaxed">
              The world's most trusted guide to authentic food. Curated by food lovers, for food lovers.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <motion.span
                  key={s.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full bg-background/5 border border-background/10 flex items-center justify-center text-background/50 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all cursor-default"
                  title={`${s.label} (coming soon)`}
                >
                  <span className="text-sm">{s.icon}</span>
                </motion.span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-background mb-4">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: "Dishes", href: "/#dishes" },
                { label: "Restaurants", href: "/restaurants" },
                { label: "Cuisines", href: "/#cuisines" },
                { label: "Food Map", href: "/map" },
                { label: "What to Eat?", href: "/recommend" },
              ].map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/#") ? (
                    <a href={link.href} className="font-body text-sm text-background/40 hover:text-background/80 transition-colors">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="font-body text-sm text-background/40 hover:text-background/80 transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-background mb-4">Business</h4>
            <ul className="space-y-2">
              <li><Link to="/for-restaurants" className="font-body text-sm text-background/40 hover:text-background/80 transition-colors">For Restaurants</Link></li>
              <li><Link to="/pricing" className="font-body text-sm text-background/40 hover:text-background/80 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-background mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/auth" className="font-body text-sm text-background/40 hover:text-background/80 transition-colors">Sign In</Link></li>
              <li><Link to="/passport" className="font-body text-sm text-background/40 hover:text-background/80 transition-colors">Food Passport</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-background/30 flex items-center gap-1">
            © 2026 Palate Guide. Made with <Heart className="h-3 w-3 text-destructive fill-current" /> for food lovers.
          </p>
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="w-9 h-9 rounded-full bg-background/5 border border-background/10 flex items-center justify-center text-background/40 hover:text-accent hover:border-accent/30 transition-all"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
