import { create } from "zustand";
import type { LocationStoreState, CountryOption } from "../types/location";
import { LocationService } from "../services/locationService";

interface LocationStoreActions {
  // Actions
  fetchCountries: () => Promise<void>;
  fetchStatesByCountry: (countryId: number) => Promise<void>;
  setSelectedCountry: (country: CountryOption | null) => void;
  clearStates: () => void;
  reset: () => void;
}

type LocationStore = LocationStoreState & LocationStoreActions;

const initialState: LocationStoreState = {
  countries: [],
  states: [],
  selectedCountry: null,
  loading: {
    countries: false,
    states: false,
  },
  error: {
    countries: null,
    states: null,
  },
};

export const useLocationStore = create<LocationStore>((set, get) => ({
  ...initialState,

  /**
   * Fetch all countries from the API
   */
  fetchCountries: async () => {
    const { loading } = get();

    // Don't fetch if already loading or if countries are already loaded
    if (loading.countries || get().countries.length > 0) {
      return;
    }

    set((state) => ({
      loading: { ...state.loading, countries: true },
      error: { ...state.error, countries: null },
    }));

    try {
      const countries = await LocationService.getCountries();
      set((state) => ({
        countries,
        loading: { ...state.loading, countries: false },
        error: { ...state.error, countries: null },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch countries";
      set((state) => ({
        loading: { ...state.loading, countries: false },
        error: { ...state.error, countries: errorMessage },
      }));
    }
  },

  /**
   * Fetch states for a specific country
   */
  fetchStatesByCountry: async (countryId: number) => {
    const { loading, selectedCountry } = get();

    // Don't fetch if already loading or if states for this country are already loaded
    if (
      loading.states ||
      (selectedCountry &&
        selectedCountry.id === countryId &&
        get().states.length > 0)
    ) {
      return;
    }

    set((state) => ({
      loading: { ...state.loading, states: true },
      error: { ...state.error, states: null },
    }));

    try {
      const states = await LocationService.getStatesByCountryId(countryId);
      set((state) => ({
        states,
        loading: { ...state.loading, states: false },
        error: { ...state.error, states: null },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch states";
      set((state) => ({
        loading: { ...state.loading, states: false },
        error: { ...state.error, states: errorMessage },
      }));
    }
  },

  /**
   * Set the selected country and fetch its states
   */
  setSelectedCountry: async (country: CountryOption | null) => {
    set({ selectedCountry: country });

    if (country) {
      // Clear existing states and fetch new ones
      set({ states: [] });
      await get().fetchStatesByCountry(country.id);
    } else {
      // Clear states when no country is selected
      set({ states: [] });
    }
  },

  /**
   * Clear all states
   */
  clearStates: () => {
    set({ states: [] });
  },

  /**
   * Reset the store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));
