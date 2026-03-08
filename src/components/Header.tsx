import { Search, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-primary tracking-tight">
            Palate
          </span>
          <span className="text-accent font-display text-sm font-medium tracking-widest uppercase">
            Guide
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#dishes" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Dishes
          </a>
          <a href="#restaurants" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Restaurants
          </a>
          <a href="#cuisines" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cuisines
          </a>
          <a href="#" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Stories
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MapPin className="h-4 w-4" />
          </Button>
          <Button variant="default" size="sm" className="font-body">
            <User className="h-4 w-4 mr-1" />
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
