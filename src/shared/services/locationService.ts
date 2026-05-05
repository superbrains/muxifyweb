import type {
  CountryOption,
  StateOption,
  Country,
  State,
} from "../types/location";

const API_BASE_URL = "https://api.countrystatecity.in/v1";
const API_KEY = import.meta.env.VITE_LOCATION_API_KEY;

export class LocationService {
  /**
   * Helper to perform fetch with API key
   */
  private static async fetchCSCAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "X-CSCAPI-KEY": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Location API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch all countries from the API
   */
  static async getCountries(): Promise<CountryOption[]> {
    try {
      const countries = await this.fetchCSCAPI<Country[]>("/countries");

      return countries.map(
        (country): CountryOption => ({
          label: country.name,
          value: country.iso2.toLowerCase(),
          id: country.id,
          iso2: country.iso2,
          emoji: country.emoji,
        })
      );
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw new Error("Failed to fetch countries. Please try again.");
    }
  }

  /**
   * Fetch states for a specific country by country ISO2 code
   */
  static async getStatesByCountryCode(
    countryCode: string
  ): Promise<StateOption[]> {
    try {
      const states = await this.fetchCSCAPI<State[]>(
        `/countries/${countryCode.toUpperCase()}/states`
      );

      return states.map(
        (state): StateOption => ({
          label: state.name,
          value: state.iso2 ? state.iso2.toLowerCase() : state.name.toLowerCase().replace(/\s+/g, "-"),
          id: state.id,
          // New API doesn't provide country_id or type in the states list, 
          // passing 0 and "state" respectively as placeholders if required by types
          country_id: 0, 
          type: "state",
        })
      );
    } catch (error) {
      console.error("Error fetching states by country code:", error);
      throw new Error("Failed to fetch states. Please try again.");
    }
  }

  /**
   * Fetch states for a specific country by country ID
   * @deprecated The new API primarily uses country codes for state fetching.
   */
  static async getStatesByCountryId(countryId: number): Promise<StateOption[]> {
    try {
      // Find the country by ID first to get its ISO2 code
      const countries = await this.getCountries();
      const country = countries.find((c) => c.id === countryId);

      if (!country) {
        throw new Error("Country not found");
      }

      return this.getStatesByCountryCode(country.iso2);
    } catch (error) {
      console.error("Error fetching states by country ID:", error);
      throw new Error("Failed to fetch states. Please try again.");
    }
  }

  /**
   * Get a specific country by ISO2 code
   */
  static async getCountryByCode(
    countryCode: string
  ): Promise<CountryOption | null> {
    try {
      const countries = await this.getCountries();
      return (
        countries.find(
          (c) => c.iso2.toLowerCase() === countryCode.toLowerCase()
        ) || null
      );
    } catch (error) {
      console.error("Error fetching country by code:", error);
      return null;
    }
  }
}
