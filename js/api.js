const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/';

export async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch Pokémon details from ${url}:`, response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Pokémon details from ${url}:`, error);
        return null;
    }
}

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