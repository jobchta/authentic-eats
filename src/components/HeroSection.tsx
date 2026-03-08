import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-food.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-end overflow-hidden">
      <img
        src={heroImage}
        alt="Beautifully plated authentic cuisine"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="hero-overlay absolute inset-0" />

      <div className="relative z-10 container mx-auto px-4 pb-20">
        <div className="max-w-2xl animate-fade-up">
          <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-4">
            The World's Authentic Food Guide
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6">
            Discover Food
            <br />
            <span className="text-gradient-gold italic">Worth Traveling For</span>
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 mb-8 max-w-lg">
            Curated by food lovers worldwide. Find the most authentic dishes and the restaurants that serve them best.
          </p>

          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes, cuisines, cities..."
                className="pl-10 h-12 bg-background/95 backdrop-blur-sm border-border font-body"
              />
            </div>
            <Button className="h-12 px-6 font-body font-semibold">
              Explore
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
