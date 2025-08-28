import { DateRange } from "react-day-picker";
import { create } from "zustand";

interface MonthYearStore {
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  typeQuery: string;
  setTypeQuery: (typeQuery: string) => void;
  endpoint: "fleets" | "products" | "inspections" | "maintenance";
  setEndpoint: (endpoint: "fleets" | "products" | "inspections" | "maintenance") => void;
  locationId: number | null;
  setLocationId: (locationId: number | null) => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handlePrevYear: () => void;
  handleNextYear: () => void;
  handleClearDate: () => void;
  currentMonth: () => Date;
}

export const useMonthYearState = create<MonthYearStore>((set) => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
  dateRange: { from: undefined, to: undefined },
  setDateRange: (dateRange) => set({ dateRange }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  typeQuery: "",
  setTypeQuery: (typeQuery) => set({ typeQuery }),
  endpoint: "fleets",
  setEndpoint: (endpoint) => set({ endpoint, typeQuery: "" }), // Reset typeQuery when changing endpoint
  locationId: null,
  setLocationId: (locationId) => set({ locationId }),

  // function
  handleClearDate: () => set({ dateRange: { from: undefined, to: undefined } }),
  handlePrevMonth: () =>
    set((state) => {
      state.handleClearDate();
      return { month: state.month === 1 ? 12 : state.month - 1 };
    }),
  handleNextMonth: () =>
    set((state) => {
      state.handleClearDate();
      return { month: state.month === 12 ? 1 : state.month + 1 };
    }),
  handlePrevYear: () =>
    set((state) => {
      state.handleClearDate();
      return { year: state.year - 1 };
    }),
  handleNextYear: () =>
    set((state) => {
      state.handleClearDate();
      return { year: state.year + 1 };
    }),
  currentMonth: (): Date => {
    const { month, year } = useMonthYearState.getState();
    const monthIndex = month - 1;
    return new Date(year, monthIndex, 1);
  },
}));
