// api/evaluate.js
import { getCoordinates, getAveragePriceFromGov } from '../utils/dataEnrichment.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const {
    address,
    city,
    neighborhood = "",
    size_sqm,
    condition,
    has_parking,
    has_elevator,
    floor_number
  } = req.query;

  const geo = await getCoordinates(address);

  const { value: pricePerMeter, fallbackUsed } = await getAveragePriceFromGov(
    address,
    city,
    neighborhood
  );

  let basePrice = size_sqm * pricePerMeter;

  let renovationCost = 0;
  switch (condition) {
    case "חדש":
      renovationCost = 0;
      break;
    case "שמור":
      renovationCost = 100000;
      break;
    case "לשיפוץ":
      renovationCost = 200000;
      break;
    default:
      renovationCost = 150000;
  }

  if (has_parking === "true") basePrice += 50000;
  if (has_elevator === "false" && parseInt(floor_number) > 2) basePrice -= 50000;

  const isInRedevelopment = address.includes("הרב קוק");

  const adjustedValue = basePrice - renovationCost;
  const recommendedOffer = Math.round(adjustedValue * 0.85);

  res.status(200).json({
    market_price_estimate: Math.round(basePrice),
    renovation_cost_estimate: renovationCost,
    is_in_redevelopment_plan: isInRedevelopment,
    recommended_offer: recommendedOffer,
    comments: isInRedevelopment
      ? "הנכס נמצא בתכנית פינוי-בינוי פעילה (בדיקה מבוססת מיקום)."
      : "לא אותרה תכנית התחדשות ידועה על פי הנתונים.",
    price_per_sqm_area_avg: pricePerMeter,
    price_per_sqm_gov_avg: fallbackUsed ? null : pricePerMeter,
    price_source: fallbackUsed ? "fallback" : "govmap",
    location_data: geo
  });
}
