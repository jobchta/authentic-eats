import { motion } from "framer-motion";
import dishPaella from "@/assets/dish-paella.jpg";
import dishTagine from "@/assets/dish-tagine.jpg";
import dishPho from "@/assets/dish-pho.jpg";

const stories = [
  {
    image: dishPho,
    category: "Deep Dive",
    title: "The 24-Hour Broth: Inside Hanoi's Greatest Phở Kitchens",
    excerpt: "We traveled to Hanoi to find the family-run shops that have perfected phở over three generations. What we discovered was far more than soup.",
    author: "Linh Nguyên",
    readTime: "8 min read",
  },
  {
    image: dishPaella,
    category: "Origin Story",
    title: "Why Authentic Paella Has No Chorizo",
    excerpt: "The great Spanish debate: what belongs in a real paella? Valencia's oldest cooks set the record straight.",
    author: "Carlos Martínez",
    readTime: "5 min read",
  },
  {
    image: dishTagine,
    category: "Travel Guide",
    title: "Marrakech's Hidden Riads: Where the Best Tagine Lives",
    excerpt: "Skip the tourist traps. These 7 family-run riads serve lamb tagine recipes that haven't changed in 200 years.",
    author: "Amina Benali",
    readTime: "6 min read",
  },
];

const EditorialStories = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-body text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-3">
              Food Stories
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Beyond the Plate
            </h2>
          </div>
          <button className="hidden md:block font-body text-sm font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
            All stories →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured large */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 lg:row-span-2 group cursor-pointer relative rounded-xl overflow-hidden"
          >
            <img
              src={stories[0].image}
              alt={stories[0].title}
              className="w-full h-full min-h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-2 block">
                {stories[0].category}
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-background leading-tight mb-3">
                {stories[0].title}
              </h3>
              <p className="font-body text-sm text-background/70 mb-3 max-w-lg">
                {stories[0].excerpt}
              </p>
              <div className="flex items-center gap-3">
                <span className="font-body text-xs text-background/60">{stories[0].author}</span>
                <span className="text-background/30">·</span>
                <span className="font-body text-xs text-background/60">{stories[0].readTime}</span>
              </div>
            </div>
          </motion.article>

          {/* Side stories */}
          {stories.slice(1).map((story, i) => (
            <motion.article
              key={story.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 1) * 0.15 }}
              className="group cursor-pointer card-hover bg-card rounded-xl overflow-hidden border border-border"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  {story.category}
                </span>
                <h3 className="font-display text-lg font-semibold text-card-foreground mt-2 mb-2 leading-tight">
                  {story.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2">
                  {story.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-muted-foreground">{story.author}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="font-body text-xs text-muted-foreground">{story.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditorialStories;
