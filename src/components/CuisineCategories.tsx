const cuisines = [
  { name: "Italian", emoji: "🇮🇹", count: 2840 },
  { name: "Japanese", emoji: "🇯🇵", count: 2120 },
  { name: "Mexican", emoji: "🇲🇽", count: 1950 },
  { name: "Indian", emoji: "🇮🇳", count: 1870 },
  { name: "French", emoji: "🇫🇷", count: 1640 },
  { name: "Thai", emoji: "🇹🇭", count: 1520 },
  { name: "Chinese", emoji: "🇨🇳", count: 2350 },
  { name: "Ethiopian", emoji: "🇪🇹", count: 680 },
  { name: "Korean", emoji: "🇰🇷", count: 1280 },
  { name: "Peruvian", emoji: "🇵🇪", count: 890 },
  { name: "Turkish", emoji: "🇹🇷", count: 1100 },
  { name: "Greek", emoji: "🇬🇷", count: 960 },
];

const CuisineCategories = () => {
  return (
    <section id="cuisines" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
            Explore By Origin
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground">
            World Cuisines
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cuisines.map((cuisine) => (
            <button
              key={cuisine.name}
              className="group card-hover flex flex-col items-center gap-3 p-6 bg-background rounded-lg border border-border hover:border-primary/30 cursor-pointer"
            >
              <span className="text-4xl">{cuisine.emoji}</span>
              <div className="text-center">
                <p className="font-display text-sm font-semibold text-foreground">
                  {cuisine.name}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {cuisine.count.toLocaleString()} dishes
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuisineCategories;
