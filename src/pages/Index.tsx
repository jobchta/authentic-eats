import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import FeaturedDishes from "@/components/FeaturedDishes";
import CuisineCategories from "@/components/CuisineCategories";
import TopRestaurants from "@/components/TopRestaurants";
import StatsSection from "@/components/StatsSection";
import EditorialStories from "@/components/EditorialStories";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <TrendingSection />
      <FeaturedDishes />
      <CuisineCategories />
      <TopRestaurants />
      <StatsSection />
      <EditorialStories />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
