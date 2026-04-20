import ReactCountryFlag from "react-country-flag";
import Dot from "./Dot";

// Function to convert country names to ISO codes
export const getCountryCode = (countryName) => {
  if (!countryName) {
    return null;
  }

  const normalizedName = String(countryName).trim().toLowerCase();
  if (!normalizedName) {
    return null;
  }

  // If user passes ISO directly (e.g. "US"), keep it.
  if (normalizedName.length === 2) {
    return normalizedName.toUpperCase();
  }

  const countryMap = {
    "united states": "US",
    "united kingdom": "GB",
    netherlands: "NL",
    germany: "DE",
    france: "FR",
    spain: "ES",
    italy: "IT",
    sweden: "SE",
    norway: "NO",
    denmark: "DK",
    finland: "FI",
    belgium: "BE",
    switzerland: "CH",
    austria: "AT",
    ireland: "IE",
    portugal: "PT",
    greece: "GR",
    bosnia: "BA",
    poland: "PL",
    "czech republic": "CZ",
    hungary: "HU",
    ukraine: "UA",
    romania: "RO",
    bulgaria: "BG",
    croatia: "HR",
    slovakia: "SK",
    slovenia: "SI",
    estonia: "EE",
    latvia: "LV",
    lithuania: "LT",
    "united arab emirates": "AE",
    luxembourg: "LU",
    malta: "MT",
    cyprus: "CY",
    australia: "AU",
    "new zealand": "NZ",
    canada: "CA",
    mexico: "MX",
    brazil: "BR",
    argentina: "AR",
    chile: "CL",
    colombia: "CO",
    peru: "PE",
    venezuela: "VE",
    ecuador: "EC",
    bolivia: "BO",
    paraguay: "PY",
    uruguay: "UY",
    japan: "JP",
    "south korea": "KR",
    china: "CN",
    india: "IN",
    singapore: "SG",
    malaysia: "MY",
    thailand: "TH",
    vietnam: "VN",
    indonesia: "ID",
    philippines: "PH",
    "hong kong": "HK",
    taiwan: "TW",
    israel: "IL",
    uae: "AE",
    "saudi arabia": "SA",
    qatar: "QA",
    kuwait: "KW",
    bahrain: "BH",
    oman: "OM",
    "south africa": "ZA",
    nigeria: "NG",
    egypt: "EG",
    morocco: "MA",
    tunisia: "TN",
    algeria: "DZ",
    kenya: "KE",
    ghana: "GH",
    ethiopia: "ET",
    tanzania: "TZ",
    uganda: "UG",
    rwanda: "RW",
    senegal: "SN",
    andorra: "AD",
    "cote d'ivoire": "CI",
    cameroon: "CM",
    angola: "AO",
    mozambique: "MZ",
    zambia: "ZM",
    zimbabwe: "ZW",
    botswana: "BW",
    namibia: "NA",
    madagascar: "MG",
    mauritius: "MU",
    seychelles: "SC",
    comoros: "KM",
    djibouti: "DJ",
    eritrea: "ER",
    somalia: "SO",
    sudan: "SD",
    "south sudan": "SS",
    chad: "TD",
    niger: "NE",
    mali: "ML",
    "burkina faso": "BF",
    benin: "BJ",
    togo: "TG",
    liberia: "LR",
    guinea: "GN",
    gambia: "GM",
    gabon: "GA",
    congo: "CG",
    "democratic republic of the congo": "CD",
    "central african republic": "CF",
    malawi: "MW",
    mauritania: "MR",
    libya: "LY",
    lebanon: "LB",
    jordan: "JO",
    syria: "SY",
    iraq: "IQ",
    iran: "IR",
    afghanistan: "AF",
    pakistan: "PK",
    bangladesh: "BD",
    "sri lanka": "LK",
    nepal: "NP",
    laos: "LA",
    cambodia: "KH",
    brunei: "BN",
    fiji: "FJ",
    vanuatu: "VU",
    samoa: "WS",
    pakistan: "PK",
    bangladesh: "BD",
    "sri lanka": "LK",
    turkey: "TR",
    tonga: "TO",
    kiribati: "KI",
    tuvalu: "TV",
    nauru: "NR",
    guam: "GU",
    antarctica: "AQ",
    russia: "RU",
    georgia: "GE",
  };

  return countryMap[normalizedName] || null;
};

const SIZE_CONFIG = {
  sm: {
    flag: "14px",
    textClass: "text-[11px]",
  },
  md: {
    flag: "16px",
    textClass: "text-xs",
  },
};

const normalizeValue = (value) => {
  const normalized = String(value ?? "").trim();
  return normalized || null;
};

const resolveCountryAndCity = ({ data, countryName, cityName }) => {
  if (data && typeof data === "object") {
    return {
      country:
        normalizeValue(data.country) ||
        normalizeValue(data.countryName) ||
        normalizeValue(data.name),
      city: normalizeValue(data.city) || normalizeValue(data.cityName),
    };
  }

  if (typeof data === "string") {
    return {
      country: normalizeValue(data),
      city: normalizeValue(cityName),
    };
  }

  return {
    country: normalizeValue(countryName),
    city: normalizeValue(cityName),
  };
};

export const CountryFlags = ({
  data,
  title = false,
  size = "md",
  className = "",
  style,
  countryName,
  cityName,
}) => {
  const { country, city } = resolveCountryAndCity({
    data,
    countryName,
    cityName,
  });

  const countryCode = getCountryCode(country);

  if (!country && !city) return null;

  const { flag: flagSize, textClass } = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;
  const flagStyle = { width: flagSize, height: flagSize, ...style };

  if (!title) {
    if (!countryCode) return null;

    return (
      <ReactCountryFlag
        className={className}
        countryCode={countryCode}
        svg
        style={flagStyle}
        title={country}
      />
    );
  }

  return (
    <span
      className={`flex w-fit justify-start items-center gap-1 *:leading-none capitalize secondary text-cream ${className}`}
    >
      {countryCode && (
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={flagStyle}
          title={country}
        />
      )}
      {country && <span className={`${textClass} `}>{country}</span>}
      {country && city && <Dot />}
      {city && <span className={`${textClass}`}>{city}</span>}
    </span>
  );
};
