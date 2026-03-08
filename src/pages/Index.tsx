import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedDishes from "@/components/FeaturedDishes";
import CuisineCategories from "@/components/CuisineCategories";
import TopRestaurants from "@/components/TopRestaurants";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedDishes />
      <CuisineCategories />
      <TopRestaurants />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
