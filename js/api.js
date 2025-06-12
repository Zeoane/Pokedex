export const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/';

/**
 * Retrieves raw data about a specific Pokémon from the API.
 * @param {string} url - URL of specific pokémon.
 * @returns {Promise<Object|null>} - Raw Pokémon data object or null if not found/error.
 */
// This function should be named fetchPokemonDetails as it fetches details for a single Pokemon.
export async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Pokémon not found at ${url}`);
                return null;
            }
            console.error(`Failed to fetch Pokémon details from ${url}: HTTP status ${response.status}`);
            return null;
        }
        return await response.json();
    } 
    catch (error) {
        console.error(`Error fetching Pokémon data from ${url}:`, error);
        return null;
    }
}

/**
 * Processes raw Pokémon data into a formatted object for display.
 * This function also handles selecting the best image URL and provides fallbacks.
 * @param {Object} data - Raw Pokémon data from the API.
 * @returns {Object|null} - Formatted Pokémon details object or null if input data is invalid.
 */
export function processPokemonDetails(data) {
    if (!data) return null;
    const imageUrl = data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || 'https://placehold.co/120x120/EFEFEF/AAAAAA?text=No+Image'; 
    return {
        id: data.id,
        name: data.name,
        imageUrl: imageUrl, 
        types: data.types.map(typeInfo => typeInfo.type?.name).filter(name => typeof name === 'string' && name), // Ensure types array only contains valid strings
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map(abilityInfo => abilityInfo.ability?.name).filter(name => typeof name === 'string' && name), // Ensure abilities array only contains valid strings
        stats: data.stats.map(statInfo => ({
            name: statInfo.stat?.name,
            base_stat: statInfo.base_stat
        })).filter(stat => typeof stat.name === 'string' && stat.name)
    };
}

/**
 * Get a list of Pokémon with offset and limit and their detailed information.
 * Fetches raw data for each Pokémon and then processes it.
 * @param {number} limit - Max number of Pokémon to return.
 * @param {number} offset - Query initiation point.
 * @returns {Promise<{list: Array<Object>, nextUrl: string|null}>} - Promise resolving to a list of formatted Pokémon and the URL for the next page.
 */
// This function correctly fetches a list of Pokémon and should remain fetchPokemonData.
export async function fetchPokemonData(limit, offset) {
    const listUrl = `${POKE_API_BASE_URL}pokemon?limit=${limit}&offset=${offset}`;
    try { const listResponse = await fetch(listUrl);
        if (!listResponse.ok) {
            console.error('Failed to fetch Pokémon list:', listResponse.status, await listResponse.text());
            return { list: [], nextUrl: null };
        }
        const listData = await listResponse.json();
        const rawDetailPromises = listData.results.map(pokemon => fetchPokemonDetails(pokemon.url)); // Call the fetchPokemonDetails for each individual Pokemon
        const rawDetails = await Promise.all(rawDetailPromises); // Process the raw details using processPokemonDetails
        const processedDetails = rawDetails.map(rawPokemon => processPokemonDetails(rawPokemon)); 
        const validDetailedPokemon = processedDetails.filter(details => details !== null);
        return { list: validDetailedPokemon, nextUrl: listData.next };
    } catch (error) {
        console.error('Error in fetchPokemonData:', error);
        return { list: [], nextUrl: null };
    }
}