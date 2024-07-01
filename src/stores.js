// src/stores.js
import { writable, readable, derived } from 'svelte/store';
import { csv, autoType, stratify } from 'd3';

// Helper function to fetch and parse CSV data
async function fetchData(url) {
  try {
    const data = await csv(url, autoType);
    // console.log('Loaded data:', data); // Debugging output
    return data;
  } catch (error) {
    // console.error('Error loading CSV:', error);
    return [];
  }
}

// Helper function to create a stratified derived store
function createStratifiedStore(flatStore) {
  return derived(flatStore, ($flatStore) => {
    if ($flatStore.length === 0) {
      return null;
    }

    const stratifier = stratify()
      .id(d => d.country)
      .parentId(d => d.parent);

    try {
      const root = stratifier($flatStore);
      // console.log('Stratified data:', root); // Debugging output
      return root;
    } catch (error) {
      // console.error('Error stratifying data:', error);
      return null;
    }
  });
}

// Create flat and derived stores for both outer and inner data
export const flatOuter = writable([]);
export const outerData = createStratifiedStore(flatOuter);

export const flatInner = writable([]);
export const innerData = createStratifiedStore(flatInner);

// Functions to fetch and set data for outer and inner stores
export async function fetchOuter(url) {
  const data = await fetchData(url);
  flatOuter.set(data);
}

export async function fetchInner(url) {
  const data = await fetchData(url);
  flatInner.set(data);
}


// ******************************************************************

export const rawData = writable([], async (set) => {
  const loadedData = await csv(
    "https://raw.githubusercontent.com/mharoruiz/datasets/main/e-waste/ewaste.csv", 
    autoType);
  set(loadedData);
});

// Create a derived store that sorts the data by ewaste_kg_capita
export const dataPerCapita = derived(rawData, ($rawData) => {
  // Ensure the data is not empty before sorting
  if ($rawData.length > 0) {
    return $rawData.slice().sort((a, b) => b.ewaste_kg_capita - a.ewaste_kg_capita);
  } else {
    return [];
  }
});