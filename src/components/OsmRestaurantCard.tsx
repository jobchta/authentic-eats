import { motion } from "framer-motion";
import { MapPin, Globe, Clock, Phone, Utensils, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OsmRestaurant } from "@/hooks/use-osm-restaurants";

interface Props {
  restaurant: OsmRestaurant;
  index: number;
}

const OsmRestaurantCard = ({ restaurant, index }: Props) => {
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lng}#map=18/${restaurant.lat}/${restaurant.lng}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -3 }}
      className="flex gap-4 p-5 bg-card rounded-xl border border-border cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-accent/30 relative overflow-hidden group"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Utensils className="h-5 w-5 text-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-display text-base font-semibold text-foreground truncate">
            {restaurant.name}
          </h3>
          <Badge variant="outline" className="text-[9px] font-body shrink-0 border-accent/30 text-accent">
            OSM
          </Badge>
        </div>

        {restaurant.cuisine && (
          <p className="font-body text-xs text-muted-foreground mb-2 capitalize">
            {restaurant.cuisine.replace(/;/g, " · ")}
          </p>
        )}

        <div className="flex items-center gap-4 flex-wrap text-muted-foreground">
          {restaurant.address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="font-body text-[11px] truncate max-w-[200px]">{restaurant.address}</span>
            </div>
          )}
          {restaurant.opening_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="font-body text-[11px] truncate max-w-[150px]">{restaurant.opening_hours}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="font-body text-[11px]">{restaurant.phone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-body text-[11px] text-accent hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View on Map
          </a>
          {restaurant.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-body text-[11px] text-accent hover:underline flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default OsmRestaurantCard;
