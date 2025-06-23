// utils/externalPriceSearch.js

export function getFallbackPricePerSqm(city, neighborhood = "") {
    const prices = {
      "תל אביב": {
        "נוה צדק": 47000,
        "הצפון הישן": 43000,
        "default": 37000
      },
      "ירושלים": { "default": 26000 },
      "כפר סבא": { "default": 32000 },
      "חיפה": {
        "רמות נווה שאנן": 22000,
        "הדר": 18000,
        "default": 20000
      },
      "הרצליה": { "default": 34000 },
      "באר שבע": { "default": 15000 },
      "פתח תקווה": { "default": 27000 },
      "רמת גן": { "default": 31000 },
      "גבעתיים": { "default": 33000 },
      "נתניה": { "default": 23000 }
    };
  
    const cityData = prices[city];
    if (!cityData) return 25000;
  
    return cityData[neighborhood] || cityData["default"] || 25000;
  }
