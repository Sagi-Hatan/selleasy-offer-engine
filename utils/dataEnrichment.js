// utils/dataEnrichment.js

import fetch from 'node-fetch';
import { scrapeGovMap } from '../scrapers/govmapScraper.js';
import { getFallbackPricePerSqm } from './externalPriceSearch.js';

export async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data[0]) return { lat: null, lon: null, full_address: "" };
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    full_address: data[0].display_name
  };
}

export async function getAveragePriceFromGov(address, city, neighborhood = "") {
  try {
    console.log("📍 Address sent to GovMap:", address);

    const deals = await scrapeGovMap(address);
    console.log("📦 Raw deals returned:", deals?.length || 0);

    const now = new Date();
    const recentDeals = (deals || []).filter(deal => {
      const dealDate = new Date(deal.dealDate.split('.').reverse().join('-'));
      return (now - dealDate) / (1000 * 60 * 60 * 24) < 365;
    });

    console.log("🕒 Recent deals (last 12 months):", recentDeals.length);

    const sqmPrices = recentDeals
      .map(d => parseInt(d.dealPrice.replace(/[^\d]/g, '')) / parseFloat(d.squareMeter))
      .filter(v => !isNaN(v) && v > 500 && v < 100000);

    console.log("💰 Valid sqm prices extracted:", sqmPrices);

    if (sqmPrices.length === 0) {
      const fallback = getFallbackPricePerSqm(city, neighborhood);
      console.warn(`⚠️ No valid sqm prices found – using fallback: ${fallback}`);
      return { value: fallback, fallbackUsed: true };
    }

    const avg = Math.round(sqmPrices.reduce((a, b) => a + b, 0) / sqmPrices.length);
    console.log("📊 Avg price per sqm:", avg);
    return { value: avg, fallbackUsed: false };

  } catch (err) {
    console.error('❌ Failed extracting govmap data:', err.message);
    const fallback = getFallbackPricePerSqm(city, neighborhood);
    return { value: fallback, fallbackUsed: true };
  }
}
