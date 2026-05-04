// ─────────────────────────────────────────────────────────────────────────────
// CONTINENT_MAP — source of truth.
// Each continent has its countries nested inside.
// All derived helpers are built from this single object.
// ─────────────────────────────────────────────────────────────────────────────
export const CONTINENT_MAP = {
  Africa: {
    countries: [
      "Algeria",
      "Angola",
      "Benin",
      "Botswana",
      "Burkina Faso",
      "Burundi",
      "Cabo Verde",
      "Cameroon",
      "Central African Republic",
      "Chad",
      "Comoros",
      "Democratic Republic of the Congo",
      "Republic of the Congo",
      "Djibouti",
      "Egypt",
      "Equatorial Guinea",
      "Eritrea",
      "Eswatini",
      "Ethiopia",
      "Gabon",
      "Gambia",
      "Ghana",
      "Guinea",
      "Guinea-Bissau",
      "Ivory Coast",
      "Kenya",
      "Lesotho",
      "Liberia",
      "Libya",
      "Madagascar",
      "Malawi",
      "Mali",
      "Mauritania",
      "Mauritius",
      "Morocco",
      "Mozambique",
      "Namibia",
      "Niger",
      "Nigeria",
      "Rwanda",
      "São Tomé and Príncipe",
      "Senegal",
      "Seychelles",
      "Sierra Leone",
      "Somalia",
      "South Africa",
      "South Sudan",
      "Sudan",
      "Tanzania",
      "Togo",
      "Tunisia",
      "Uganda",
      "Zambia",
      "Zimbabwe",
    ],
  },
  Antarctica: {
    // Only 1 "country" — threshold is 1 (i.e. 100% = 1 visit)
    countries: ["Antarctica"],
  },
  Asia: {
    countries: [
      "Afghanistan",
      "Armenia",
      "Azerbaijan",
      "Bahrain",
      "Bangladesh",
      "Bhutan",
      "Brunei",
      "Cambodia",
      "China",
      "Cyprus",
      "Georgia",
      "India",
      "Indonesia",
      "Iran",
      "Iraq",
      "Israel",
      "Japan",
      "Jordan",
      "Kazakhstan",
      "Kuwait",
      "Kyrgyzstan",
      "Laos",
      "Lebanon",
      "Malaysia",
      "Maldives",
      "Mongolia",
      "Myanmar",
      "Nepal",
      "North Korea",
      "Oman",
      "Pakistan",
      "Palestine",
      "Philippines",
      "Qatar",
      "Saudi Arabia",
      "Singapore",
      "South Korea",
      "Sri Lanka",
      "Syria",
      "Taiwan",
      "Tajikistan",
      "Thailand",
      "Timor-Leste",
      "Turkey",
      "Turkmenistan",
      "United Arab Emirates",
      "Uzbekistan",
      "Vietnam",
      "Yemen",
    ],
  },
  Europe: {
    countries: [
      "Albania",
      "Andorra",
      "Austria",
      "Belarus",
      "Belgium",
      "Bosnia and Herzegovina",
      "Bulgaria",
      "Croatia",
      "Czech Republic",
      "Czechia",
      "Denmark",
      "Estonia",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Hungary",
      "Iceland",
      "Ireland",
      "Italy",
      "Kosovo",
      "Latvia",
      "Liechtenstein",
      "Lithuania",
      "Luxembourg",
      "Malta",
      "Moldova",
      "Monaco",
      "Montenegro",
      "Netherlands",
      "North Macedonia",
      "Norway",
      "Poland",
      "Portugal",
      "Romania",
      "Russia",
      "San Marino",
      "Serbia",
      "Slovakia",
      "Slovenia",
      "Spain",
      "Sweden",
      "Switzerland",
      "Ukraine",
      "United Kingdom",
      "Vatican City",
    ],
  },
  "North America": {
    countries: [
      "Antigua and Barbuda",
      "Bahamas",
      "Barbados",
      "Belize",
      "Canada",
      "Costa Rica",
      "Cuba",
      "Dominica",
      "Dominican Republic",
      "El Salvador",
      "Grenada",
      "Guatemala",
      "Haiti",
      "Honduras",
      "Jamaica",
      "Mexico",
      "Nicaragua",
      "Panama",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Vincent and the Grenadines",
      "Trinidad and Tobago",
      "United States",
    ],
  },
  Oceania: {
    countries: [
      "Australia",
      "Fiji",
      "Kiribati",
      "Marshall Islands",
      "Micronesia",
      "Nauru",
      "New Zealand",
      "Palau",
      "Papua New Guinea",
      "Samoa",
      "Solomon Islands",
      "Tonga",
      "Tuvalu",
      "Vanuatu",
    ],
  },
  "South America": {
    countries: [
      "Argentina",
      "Bolivia",
      "Brazil",
      "Chile",
      "Colombia",
      "Ecuador",
      "Guyana",
      "Paraguay",
      "Peru",
      "Suriname",
      "Uruguay",
      "Venezuela",
    ],
  },
};

// ─── Flat reverse-lookup: country → continent ──────────────────────────────
export const COUNTRY_TO_CONTINENT = Object.entries(CONTINENT_MAP).reduce(
  (acc, [continent, { countries }]) => {
    for (const c of countries) acc[c] = continent;
    return acc;
  },
  {},
);

// Legacy alias kept so existing imports don't break
export const COUNTRY_TO_CONTINENT_LEGACY = COUNTRY_TO_CONTINENT;

// ─── Continental badge definitions ───────────────────────────────────────────
export const CONTINENT_BADGES = {
  Africa: {
    title: "African Lion",
    description:
      "You are a true African Lion — explorer of the world's most diverse continent.",
    image_url: null, // replace with real image path when available
    icon: "🦁",
  },
  Antarctica: {
    title: "Polar Pioneer",
    description: "You braved the ice — a rare Polar Pioneer among explorers.",
    image_url: null,
    icon: "🧊",
  },
  Asia: {
    title: "Dragon of the East",
    description:
      "From the Himalayas to the Pacific — you are the Dragon of the East.",
    image_url: null,
    icon: "🐉",
  },
  Europe: {
    title: "European Knight",
    description:
      "History, culture, and cobblestone streets — you are a true European Knight.",
    image_url: null,
    icon: "⚔️",
  },
  "North America": {
    title: "New World Ranger",
    description:
      "Frontiers and metropolises alike — you are the New World Ranger.",
    image_url: null,
    icon: "🦅",
  },
  Oceania: {
    title: "Pacific Voyager",
    description: "Coral reefs and ancient skies — you are a Pacific Voyager.",
    image_url: null,
    icon: "🐚",
  },
  "South America": {
    title: "Amazon Wanderer",
    description:
      "Rain forests, peaks, and carnivals — you are the Amazon Wanderer.",
    image_url: null,
    icon: "🌿",
  },
};

// ─── Derived lists ────────────────────────────────────────────────────────────
export const CONTINENTS = Object.keys(CONTINENT_MAP);

export const TOTAL_COUNTRIES = 195;
export const TOTAL_CITIES = 1000;
export const TOTAL_CONTINENTS = 7;

export function getContinentForCountry(country) {
  return COUNTRY_TO_CONTINENT[country] ?? null;
}

export function getVisitedContinents(visitedCountries) {
  const visited = new Set(visitedCountries);
  const unlockedContinents = new Set();

  for (const [continent, { countries }] of Object.entries(CONTINENT_MAP)) {
    if (continent === "Antarctica") {
      if (visited.has("Antarctica")) unlockedContinents.add(continent);
      continue;
    }
    const threshold = Math.ceil(countries.length * 0.5);
    const matchCount = countries.filter((c) => visited.has(c)).length;
    if (matchCount >= threshold) unlockedContinents.add(continent);
  }

  return unlockedContinents;
}

export function getContinentProgress(visitedCountries) {
  const visited = new Set(visitedCountries);

  return Object.entries(CONTINENT_MAP).map(([continent, { countries }]) => {
    const isAntarctica = continent === "Antarctica";
    const total = countries.length;
    const visitedCount = countries.filter((c) => visited.has(c)).length;
    const threshold = isAntarctica ? 1 : Math.ceil(total * 0.5);
    const remaining = Math.max(0, threshold - visitedCount);
    const unlocked = isAntarctica
      ? visited.has("Antarctica")
      : visitedCount >= threshold;

    return { continent, total, visitedCount, threshold, remaining, unlocked };
  });
}
