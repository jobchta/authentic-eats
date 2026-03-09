import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDishImage } from "@/lib/dish-images";

/**
 * Hook that resolves a dish image:
 * 1. Uses image_url from DB if available
 * 2. Falls back to static image map
 * 3. Optionally triggers AI generation in background
 */
export function useDishImage(
  dishId: string | undefined,
  dishName: string,
  cuisineType: string,
  description?: string | null,
  dbImageUrl?: string | null
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Priority 1: DB image_url
    if (dbImageUrl) {
      setImageUrl(dbImageUrl);
      return;
    }

    // Priority 2: Static fallback
    const staticImg = getDishImage(dishName, cuisineType);
    if (staticImg) {
      setImageUrl(staticImg);
    }

    // Priority 3: Trigger AI generation if no DB image
    if (!dbImageUrl && dishId && !generating) {
      setGenerating(true);
      supabase.functions
        .invoke("generate-dish-image", {
          body: { dishId, dishName, cuisineType, description },
        })
        .then(({ data, error }) => {
          if (!error && data?.image_url) {
            setImageUrl(data.image_url);
          }
          setGenerating(false);
        })
        .catch(() => setGenerating(false));
    }
  }, [dishId, dishName, cuisineType, dbImageUrl]);

  return { imageUrl, generating };
}
