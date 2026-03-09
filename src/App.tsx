import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollToHash } from "./hooks/use-scroll-to-hash";
import Index from "./pages/Index";
import PricingPage from "./pages/PricingPage";
import ForRestaurantsPage from "./pages/ForRestaurantsPage";
import MapPage from "./pages/MapPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PassportPage from "./pages/PassportPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import DishDetailPage from "./pages/DishDetailPage";
import RecommenderPage from "./pages/RecommenderPage";
import AdminIngestion from "./pages/AdminIngestion";
import IngredientsPage from "./pages/IngredientsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min — data stays fresh, no re-fetch on every focus
      gcTime: 10 * 60 * 1000,        // 10 min — keep unused cache in memory
      retry: 1,                       // only 1 retry on failure (default is 3)
      refetchOnWindowFocus: false,    // don't hammer Supabase every tab switch
    },
  },
});

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  useScrollToHash();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/for-restaurants" element={<PageTransition><ForRestaurantsPage /></PageTransition>} />
        <Route path="/map" element={<PageTransition><MapPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        <Route path="/passport" element={<PageTransition><PassportPage /></PageTransition>} />
        <Route path="/restaurants" element={<PageTransition><RestaurantsPage /></PageTransition>} />
        <Route path="/restaurants/:id" element={<PageTransition><RestaurantDetailPage /></PageTransition>} />
        <Route path="/dishes/:id" element={<PageTransition><DishDetailPage /></PageTransition>} />
        <Route path="/recommender" element={<PageTransition><RecommenderPage /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminIngestion /></PageTransition>} />
        <Route path="/ingredients" element={<PageTransition><IngredientsPage /></PageTransition>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
