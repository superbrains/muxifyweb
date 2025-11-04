// Country API Response Types
export interface Country {
  id: number;
  name: string;
  iso3: string;
  numeric_code: string;
  iso2: string;
  phonecode: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  region_id: number;
  subregion: string;
  subregion_id: number;
  nationality: string;
  timezones: string;
  translations: string;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
  created_at: string;
  updated_at: string;
  flag: number;
  wikiDataId: string | null;
}

export interface CountriesResponse {
  status: number;
  countries: Country[];
}

// State API Response Types
export interface State {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  fips_code: string;
  iso2: string;
  type: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
  flag: number;
  wikiDataId: string | null;
}

export interface StatesResponse {
  status: number;
  states: State[];
}

// Form-friendly types
export interface CountryOption {
  label: string;
  value: string;
  id: number;
  iso2: string;
  emoji: string;
}

export interface StateOption {
  label: string;
  value: string;
  id: number;
  country_id: number;
  type: string;
}

// Store State Types
export interface LocationStoreState {
  countries: CountryOption[];
  states: StateOption[];
  selectedCountry: CountryOption | null;
  loading: {
    countries: boolean;
    states: boolean;
  };
  error: {
    countries: string | null;
    states: string | null;
  };
}
