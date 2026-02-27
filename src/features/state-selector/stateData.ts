////////////////////////////////////////////////////////////////////
// STATE DATA — src/features/state-selector/stateData.ts
//
// Client-side copy of state legal data used for:
//   1. Populating the state selector dropdown
//   2. Filtering products client-side before server confirms
//
// The authoritative source is the state_laws table in Supabase.
// This file provides a fast client-side fallback and initial render.
////////////////////////////////////////////////////////////////////

export interface StateInfo {
  code: string;           // Two-letter state code: "TX"
  name: string;           // Full name: "Texas"
  allowsFlower: boolean;
  allowsVapes: boolean;
  allowsEdibles: boolean;
  allowsAccessories: boolean;
  shippingAllowed: boolean;
}

////////////////////////////////////////////////////////////////////
// ALL 50 STATES + DC
// Update allowsFlower / shippingAllowed as laws change.
// The Admin → State Laws page lets you update Supabase directly.
////////////////////////////////////////////////////////////////////
export const statesData: StateInfo[] = [
  { code: "AL", name: "Alabama",        allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "AK", name: "Alaska",         allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "AZ", name: "Arizona",        allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "AR", name: "Arkansas",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "CA", name: "California",     allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "CO", name: "Colorado",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "CT", name: "Connecticut",    allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "DE", name: "Delaware",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "FL", name: "Florida",        allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "GA", name: "Georgia",        allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "HI", name: "Hawaii",         allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "ID", name: "Idaho",          allowsFlower: false, allowsVapes: false, allowsEdibles: false, allowsAccessories: true,  shippingAllowed: false },
  { code: "IL", name: "Illinois",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "IN", name: "Indiana",        allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "IA", name: "Iowa",           allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "KS", name: "Kansas",         allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "KY", name: "Kentucky",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "LA", name: "Louisiana",      allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "ME", name: "Maine",          allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "MD", name: "Maryland",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "MA", name: "Massachusetts",  allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "MI", name: "Michigan",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "MN", name: "Minnesota",      allowsFlower: false, allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "MS", name: "Mississippi",    allowsFlower: false, allowsVapes: false, allowsEdibles: false, allowsAccessories: true,  shippingAllowed: false },
  { code: "MO", name: "Missouri",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "MT", name: "Montana",        allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "NE", name: "Nebraska",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "NV", name: "Nevada",         allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "NH", name: "New Hampshire",  allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "NJ", name: "New Jersey",     allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "NM", name: "New Mexico",     allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "NY", name: "New York",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "NC", name: "North Carolina", allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "ND", name: "North Dakota",   allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "OH", name: "Ohio",           allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "OK", name: "Oklahoma",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "OR", name: "Oregon",         allowsFlower: false, allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "PA", name: "Pennsylvania",   allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "RI", name: "Rhode Island",   allowsFlower: false, allowsVapes: false, allowsEdibles: false, allowsAccessories: true,  shippingAllowed: false },
  { code: "SC", name: "South Carolina", allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "SD", name: "South Dakota",   allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "TN", name: "Tennessee",      allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "TX", name: "Texas",          allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "UT", name: "Utah",           allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "VT", name: "Vermont",        allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "VA", name: "Virginia",       allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "WA", name: "Washington",     allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "WV", name: "West Virginia",  allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "WI", name: "Wisconsin",      allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
  { code: "WY", name: "Wyoming",        allowsFlower: true,  allowsVapes: true,  allowsEdibles: true,  allowsAccessories: true,  shippingAllowed: true  },
];

////////////////////////////////////////////////////////////////////
// LOOKUP HELPERS
////////////////////////////////////////////////////////////////////

// Get state info by code — returns undefined if not found
export function getStateByCode(code: string): StateInfo | undefined {
  return statesData.find((s) => s.code === code.toUpperCase());
}

// Get all states sorted alphabetically by name
export function getSortedStates(): StateInfo[] {
  return [...statesData].sort((a, b) => a.name.localeCompare(b.name));
}

// Check if a product category is allowed in a given state
export function isCategoryAllowedInState(
  stateCode: string,
  category: string
): boolean {
  const state = getStateByCode(stateCode);
  if (!state) return false;

  switch (category) {
    case "flower":    return state.allowsFlower;
    case "vape":      return state.allowsVapes;
    case "edible":    return state.allowsEdibles;
    case "accessory": return state.allowsAccessories;
    default:          return state.shippingAllowed;
  }
}

// States where we can ship at all
export const shippableStates = statesData.filter((s) => s.shippingAllowed);