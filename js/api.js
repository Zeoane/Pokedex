export const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/';
/**
 * Retrieves and formats details about a specific Pokémon.
 * @param {string} url - URL of specific pokémon.
 * @returns {Promise<Object|null>} - Formatted Pokémon details object or null if not found/error.
 */
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
        const data = await response.json();
        // **Logic for the best image URL
        const imageUrl = data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || 'https://via.placeholder.com/120x120.png?text=No+Image'; // Fallback-Bild
        return {
            id: data.id,
            name: data.name,
            imageUrl: imageUrl, 
            types: data.types.map(typeInfo => typeInfo.type.name),
            height: data.height,
            weight: data.weight,
            abilities: data.abilities.map(abilityInfo => abilityInfo.ability.name),
            stats: data.stats.map(statInfo => ({
                name: statInfo.stat.name,
                base_stat: statInfo.base_stat
            }))
        };
    } catch (error) {
        console.error(`Error fetching Pokémon details from ${url}:`, error);
        return null;
    }
}

/** Get a list of Pokémon with offset and limit and their detailed information.
 @param {number} limit 
 @param {number} offset 
 @returns {Promise<{list: Array<Object>, nextUrl: string|null}>} 
 */
export async function fetchPokemonData(limit, offset) {
    const listUrl = `${POKE_API_BASE_URL}pokemon?limit=${limit}&offset=${offset}`;
    try {
        const listResponse = await fetch(listUrl);
        if (!listResponse.ok) {
            console.error('Failed to fetch Pokémon list:', listResponse.status, await listResponse.text());
            return { list: [], nextUrl: null };
        }
        const listData = await listResponse.json();
        const detailPromises = listData.results.map(pokemon => fetchPokemonDetails(pokemon.url));
        const detailedPokemon = await Promise.all(detailPromises);
        const validDetailedPokemon = detailedPokemon.filter(details => details !== null);
    return { list: validDetailedPokemon, nextUrl: listData.next };
    } catch (error) {
        console.error('Error in fetchPokemonData:', error);
        return { list: [], nextUrl: null };
    }
}