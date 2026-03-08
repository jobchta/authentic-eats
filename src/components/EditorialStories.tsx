import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import dishPaella from "@/assets/dish-paella.jpg";
import dishTagine from "@/assets/dish-tagine.jpg";
import dishPho from "@/assets/dish-pho.jpg";
import { ArrowRight } from "lucide-react";

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
    category: "Sponsored",
    title: "Why Authentic Paella Has No Chorizo",
    excerpt: "The great Spanish debate: what belongs in a real paella? Valencia's oldest cooks set the record straight.",
    author: "Carlos Martínez",
    readTime: "5 min read",
    sponsored: true,
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
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="stories" ref={sectionRef} className="py-24 bg-background relative section-grain">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-sm font-bold tracking-[0.3em] uppercase text-gradient-gold mb-3">
              Food Stories
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Beyond the Plate
            </h2>
          </motion.div>
          <button className="hidden md:flex items-center gap-2 font-body text-sm font-bold text-primary hover:text-primary/80 transition-colors group">
            All stories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured large with parallax */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 lg:row-span-2 group cursor-pointer relative rounded-2xl overflow-hidden"
          >
            <motion.img
              style={{ y: parallaxY }}
              src={stories[0].image}
              alt={stories[0].title}
              className="w-full h-full min-h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-3 block">
                {stories[0].category}
              </span>
              <h3 className="font-display text-2xl md:text-4xl font-bold text-background leading-tight mb-3 text-shadow-lg">
                {stories[0].title}
              </h3>
              <p className="font-body text-sm text-background/70 mb-4 max-w-lg">
                {stories[0].excerpt}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/30 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-background">
                    {stories[0].author.charAt(0)}
                  </div>
                  <span className="font-body text-xs text-background/70">{stories[0].author}</span>
                </div>
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
              whileHover={{ y: -6 }}
              className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                    {story.category}
                  </span>
                  {"sponsored" in story && story.sponsored && (
                    <span className="font-body text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Sponsored
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                  {story.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground mb-4 line-clamp-2">
                  {story.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {story.author.charAt(0)}
                  </div>
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
