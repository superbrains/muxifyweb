import type {
  CountriesResponse,
  StatesResponse,
  CountryOption,
  StateOption,
} from "../types/location";
import { axiosInstance } from "@app/lib/axiosInstance";

const API_BASE_URL = "https://csc.sidsworld.co.in/api";

export class LocationService {
  /**
   * Fetch all countries from the API
   */
  static async getCountries(): Promise<CountryOption[]> {
    try {
      const response = await axiosInstance.get<CountriesResponse>(
        `${API_BASE_URL}/countries`
      );

      if (response.data.status !== 200) {
        throw new Error("Failed to fetch countries");
      }

      return response.data.countries.map(
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
   * Fetch states for a specific country by country ID
   */
  static async getStatesByCountryId(countryId: number): Promise<StateOption[]> {
    try {
      const response = await axiosInstance.get<StatesResponse>(
        `${API_BASE_URL}/states/${countryId}`
      );

      if (response.data.status !== 200) {
        throw new Error("Failed to fetch states");
      }

      return response.data.states.map(
        (state): StateOption => ({
          label: state.name,
          value: state.name.toLowerCase().replace(/\s+/g, "-"),
          id: state.id,
          country_id: state.country_id,
          type: state.type,
        })
      );
    } catch (error) {
      console.error("Error fetching states:", error);
      throw new Error("Failed to fetch states. Please try again.");
    }
  }

  /**
   * Fetch states for a specific country by country ISO2 code
   */
  static async getStatesByCountryCode(
    countryCode: string
  ): Promise<StateOption[]> {
    try {
      // First, we need to find the country ID from the country code
      const countries = await this.getCountries();
      const country = countries.find(
        (c) => c.iso2.toLowerCase() === countryCode.toLowerCase()
      );

      if (!country) {
        throw new Error("Country not found");
      }

      return this.getStatesByCountryId(country.id);
    } catch (error) {
      console.error("Error fetching states by country code:", error);
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
