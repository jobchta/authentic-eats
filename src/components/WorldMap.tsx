import { memo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import type { CountryData } from "@/pages/MapPage";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const numericToAlpha2: Record<string, string> = {
  "004":"AF","008":"AL","012":"DZ","020":"AD","024":"AO","028":"AG","032":"AR","036":"AU","040":"AT","031":"AZ",
  "044":"BS","048":"BH","050":"BD","051":"AM","052":"BB","056":"BE","064":"BT","068":"BO","070":"BA","072":"BW",
  "076":"BR","084":"BZ","090":"SB","096":"BN","100":"BG","104":"MM","108":"BI","116":"KH","120":"CM","124":"CA",
  "132":"CV","140":"CF","144":"LK","148":"TD","152":"CL","156":"CN","170":"CO","174":"KM","178":"CG","180":"CD",
  "188":"CR","191":"HR","192":"CU","196":"CY","203":"CZ","204":"BJ","208":"DK","212":"DM","214":"DO","218":"EC",
  "222":"SV","226":"GQ","231":"ET","232":"ER","233":"EE","242":"FJ","246":"FI","250":"FR","258":"PF","260":"TF",
  "262":"DJ","266":"GA","268":"GE","270":"GM","275":"PS","276":"DE","288":"GH","300":"GR","308":"GD","316":"GU",
  "320":"GT","324":"GN","328":"GY","332":"HT","340":"HN","344":"HK","348":"HU","352":"IS","356":"IN","360":"ID",
  "364":"IR","368":"IQ","372":"IE","376":"IL","380":"IT","384":"CI","388":"JM","392":"JP","398":"KZ","400":"JO",
  "404":"KE","408":"KP","410":"KR","414":"KW","417":"KG","418":"LA","422":"LB","426":"LS","428":"LV","430":"LR",
  "434":"LY","438":"LI","440":"LT","442":"LU","450":"MG","454":"MW","458":"MY","462":"MV","466":"ML","470":"MT",
  "478":"MR","480":"MU","484":"MX","496":"MN","498":"MD","499":"ME","504":"MA","508":"MZ","512":"OM","516":"NA",
  "520":"NR","524":"NP","528":"NL","540":"NC","554":"NZ","558":"NI","562":"NE","566":"NG","578":"NO","586":"PK",
  "591":"PA","598":"PG","600":"PY","604":"PE","608":"PH","616":"PL","620":"PT","624":"GW","626":"TL","630":"PR",
  "634":"QA","642":"RO","643":"RU","646":"RW","682":"SA","686":"SN","688":"RS","694":"SL","702":"SG","703":"SK",
  "704":"VN","705":"SI","706":"SO","710":"ZA","716":"ZW","724":"ES","728":"SS","729":"SD","740":"SR","748":"SZ",
  "752":"SE","756":"CH","760":"SY","762":"TJ","764":"TH","768":"TG","776":"TO","780":"TT","784":"AE","788":"TN",
  "792":"TR","795":"TM","800":"UG","804":"UA","807":"MK","818":"EG","826":"GB","834":"TZ","840":"US","854":"BF",
  "858":"UY","860":"UZ","862":"VE","887":"YE","894":"ZM",
};

interface WorldMapProps {
  countryByCode: Map<string, CountryData>;
  selectedCode: string | null;
  onSelectCountry: (code: string) => void;
}

const WorldMap = memo(({ countryByCode, selectedCode, onSelectCountry }: WorldMapProps) => {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const hoveredCountry = hoveredCode ? countryByCode.get(hoveredCode) : null;

  const getContinentColor = (code: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return "hsl(350, 45%, 35%)";
    const country = countryByCode.get(code);
    if (!country) return isHovered ? "hsl(30, 15%, 82%)" : "hsl(30, 15%, 88%)";

    const base: Record<string, [string, string]> = {
      Asia: ["hsl(38, 65%, 52%)", "hsl(38, 75%, 45%)"],
      Europe: ["hsl(350, 35%, 42%)", "hsl(350, 45%, 35%)"],
      Africa: ["hsl(25, 55%, 48%)", "hsl(25, 60%, 40%)"],
      "North America": ["hsl(210, 45%, 48%)", "hsl(210, 50%, 40%)"],
      "South America": ["hsl(160, 40%, 42%)", "hsl(160, 45%, 35%)"],
      Oceania: ["hsl(280, 35%, 48%)", "hsl(280, 40%, 40%)"],
    };
    const colors = base[country.continent] || ["hsl(30, 20%, 70%)", "hsl(30, 20%, 62%)"];
    return isHovered ? colors[1] : colors[0];
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-border/50">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-secondary" />

      {/* Decorative glow for selected region */}
      {selectedCode && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
        </div>
      )}

      {/* Tooltip with glass effect */}
      {hoveredCountry && (
        <div className="absolute top-5 left-5 z-10 glass rounded-2xl px-5 py-4 shadow-xl pointer-events-none animate-scale-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-md">{hoveredCountry.flag_emoji}</span>
            <div>
              <p className="font-display text-base font-bold text-foreground">{hoveredCountry.name}</p>
              <p className="font-body text-xs text-muted-foreground">{hoveredCountry.continent} · {hoveredCountry.region}</p>
            </div>
          </div>
          {hoveredCountry.signature_ingredient && (
            <p className="font-body text-xs text-accent mt-2 font-medium">🌿 {hoveredCountry.signature_ingredient}</p>
          )}
          {hoveredCountry.food_description && (
            <p className="font-body text-[11px] text-muted-foreground mt-1 max-w-[250px]">{hoveredCountry.food_description}</p>
          )}
        </div>
      )}

      {/* Legend with glass */}
      <div className="absolute bottom-5 right-5 z-10 glass rounded-xl px-4 py-3">
        <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
          {[
            ["Asia", "hsl(38, 65%, 52%)"],
            ["Europe", "hsl(350, 35%, 42%)"],
            ["Africa", "hsl(25, 55%, 48%)"],
            ["N. America", "hsl(210, 45%, 48%)"],
            ["S. America", "hsl(160, 40%, 42%)"],
            ["Oceania", "hsl(280, 35%, 48%)"],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <span className="font-body text-[10px] text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <ComposableMap
        projectionConfig={{ scale: 150, center: [10, 10] }}
        className="w-full h-auto relative z-0"
        style={{ aspectRatio: "2/1" }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericId = geo.id || geo.properties?.["ISO_A2"];
                const alpha2 = numericToAlpha2[numericId] || geo.properties?.["ISO_A2"] || "";
                const inDb = countryByCode.has(alpha2);
                const isHovered = hoveredCode === alpha2;
                const isSelected = selectedCode === alpha2;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => inDb && setHoveredCode(alpha2)}
                    onMouseLeave={() => setHoveredCode(null)}
                    onClick={() => inDb && onSelectCountry(alpha2)}
                    style={{
                      default: {
                        fill: getContinentColor(alpha2, false, isSelected),
                        stroke: "hsl(30, 25%, 97%)",
                        strokeWidth: 0.4,
                        outline: "none",
                        cursor: inDb ? "pointer" : "default",
                        opacity: inDb ? 1 : 0.3,
                        transition: "all 0.3s ease",
                      },
                      hover: {
                        fill: getContinentColor(alpha2, true, isSelected),
                        stroke: "hsl(38, 70%, 50%)",
                        strokeWidth: inDb ? 1.5 : 0.4,
                        outline: "none",
                        cursor: inDb ? "pointer" : "default",
                        opacity: inDb ? 1 : 0.3,
                        filter: inDb ? "brightness(1.1) drop-shadow(0 0 8px hsla(38, 70%, 50%, 0.3))" : "none",
                      },
                      pressed: {
                        fill: "hsl(350, 45%, 35%)",
                        stroke: "hsl(38, 70%, 50%)",
                        strokeWidth: 1.5,
                        outline: "none",
                        filter: "drop-shadow(0 0 12px hsla(350, 45%, 30%, 0.4))",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
});

WorldMap.displayName = "WorldMap";

export default WorldMap;
