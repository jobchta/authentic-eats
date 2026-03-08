import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
          Join the Global
          <br />
          <span className="text-gradient-gold italic">Food Community</span>
        </h2>
        <p className="font-body text-primary-foreground/80 max-w-md mx-auto mb-8">
          Rate dishes, recommend hidden gems, and help the world discover authentic flavors.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-body"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
