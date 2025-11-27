# Country & State API Documentation

## Base URL

```
https://csc.sidsworld.co.in/api
```

## Endpoints

### 1. Get All Countries

**Endpoint:** `GET /countries`

**Response:**

```json
{
  "status": 200,
  "countries": [
    {
      "id": 1,
      "name": "Afghanistan",
      "iso2": "AF",
      "iso3": "AFG",
      "emoji": "🇦🇫",
      "phonecode": "+93",
      "capital": "Kabul",
      "currency": "AFN"
      // ... other fields
    }
  ]
}
```

**Usage:**

```typescript
const countries = await LocationService.getCountries();
// Returns: CountryOption[] with label, value, id, iso2, emoji
```

---

### 2. Get States by Country ID

**Endpoint:** `GET /states/{countryId}`

**Parameters:**

- `countryId` (number): The country's numeric ID

**Response:**

```json
{
  "status": 200,
  "states": [
    {
      "id": 1,
      "name": "California",
      "country_id": 231,
      "country_code": "US",
      "type": "State",
      "iso2": "CA"
      // ... other fields
    }
  ]
}
```

**Usage:**

```typescript
const states = await LocationService.getStatesByCountryId(231);
// Returns: StateOption[] with label, value, id, country_id, type
```

---

### 3. Get States by Country Code

**Endpoint:** `GET /states/{countryId}` (via country lookup)

**Parameters:**

- `countryCode` (string): ISO2 country code (e.g., "US", "NG")

**Usage:**

```typescript
const states = await LocationService.getStatesByCountryCode("US");
// Internally fetches country by code, then states by country ID
```

---

### 4. Get Country by Code

**Endpoint:** `GET /countries` (filtered)

**Parameters:**

- `countryCode` (string): ISO2 country code (e.g., "US", "NG")

**Usage:**

```typescript
const country = await LocationService.getCountryByCode("US");
// Returns: CountryOption | null
```

---

## Type Definitions

### API Response Types

#### Country

```typescript
interface Country {
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
```

#### CountriesResponse

```typescript
interface CountriesResponse {
  status: number;
  countries: Country[];
}
```

#### State

```typescript
interface State {
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
```

#### StatesResponse

```typescript
interface StatesResponse {
  status: number;
  states: State[];
}
```

### Form-Friendly Types

#### CountryOption

```typescript
interface CountryOption {
  label: string; // Country name (e.g., "United States")
  value: string; // Lowercase ISO2 (e.g., "us")
  id: number; // Country ID
  iso2: string; // ISO2 code (e.g., "US")
  emoji: string; // Country flag emoji
}
```

#### StateOption

```typescript
interface StateOption {
  label: string; // State name (e.g., "California")
  value: string; // Slugified name (e.g., "california")
  id: number; // State ID
  country_id: number; // Parent country ID
  type: string; // State type (e.g., "State", "Province")
}
```

### Store State Types

#### LocationStoreState

```typescript
interface LocationStoreState {
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
```

---

## Error Handling

All methods throw errors with descriptive messages:

- `"Failed to fetch countries. Please try again."`
- `"Failed to fetch states. Please try again."`
- `"Country not found"`

Errors are logged to console before being thrown.

---

## Notes

- All country codes are normalized to lowercase for comparison
- State values are slugified (lowercase, spaces replaced with hyphens)
- The API returns `status: 200` on success
- Country lookup by code requires fetching all countries first
