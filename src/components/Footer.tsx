const Footer = () => {
  return (
    <footer className="py-16 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display text-2xl font-bold text-background tracking-tight">
                Palate
              </span>
              <span className="text-accent font-display text-sm font-medium tracking-widest uppercase">
                Guide
              </span>
            </div>
            <p className="font-body text-sm text-background/60">
              The world's most trusted guide to authentic food. Curated by food lovers, for food lovers.
            </p>
          </div>
          {[
            { title: "Explore", links: ["Dishes", "Restaurants", "Cuisines", "Cities"] },
            { title: "Community", links: ["Write a Review", "Become a Critic", "Food Stories", "Events"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-background mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-body text-sm text-background/50 hover:text-background transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-background/40">
            © 2026 Palate Guide. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a key={item} href="#" className="font-body text-xs text-background/40 hover:text-background/60 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
