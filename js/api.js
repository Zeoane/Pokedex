export const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/';

function handleFetchError(response, url) {
    if (response.status === 404) {
        console.warn(`Pokémon not found at ${url}`);
    } else {
        console.error(`Failed to fetch from ${url}: HTTP status ${response.status}`);
    }
    return null;
}

export async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return handleFetchError(response, url);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Pokémon data from ${url}:`, error);
        return null;
    }
}

function extractAndFilterNames(dataArray) {
    return dataArray.map(itemInfo => itemInfo.type?.name || itemInfo.ability?.name || itemInfo.stat?.name)
                    .filter(name => typeof name === 'string' && name);
}

function extractImageUrl(sprites) {
    return sprites.other?.['official-artwork']?.front_default ||
           sprites.front_default ||
           'https://placehold.co/120x120/EFEFEF/AAAAAA?text=No+Image';
}

function extractAndFormatStats(statsData) {
    return statsData.map(statInfo => ({
        name: statInfo.stat?.name,
        base_stat: statInfo.base_stat
    })).filter(stat => typeof stat.name === 'string' && stat.name);
}

export function processPokemonDetails(data) {
    if (!data) return null;

    const imageUrl = extractImageUrl(data.sprites);
    const types = extractAndFilterNames(data.types);
    const abilities = extractAndFilterNames(data.abilities);
    const stats = extractAndFormatStats(data.stats);

    return {
        id: data.id,
        name: data.name,
        imageUrl: imageUrl,
        types: types,
        weight: data.weight,
        height: data.height,
        abilities: abilities,
        stats: stats
    };
}

async function fetchPokemonListRaw(limit, offset) {
    const listUrl = `${POKE_API_BASE_URL}pokemon?limit=${limit}&offset=${offset}`;
    try {
        const listResponse = await fetch(listUrl);
        if (!listResponse.ok) {
            console.error('Failed to fetch Pokémon list:', listResponse.status, await listResponse.text());
            return null;
        }
        return await listResponse.json();
    } catch (error) {
        console.error('Error fetching Pokémon list:', error);
        return null;
    }
}

async function getDetailedPokemonFromResults(results) {
    const rawDetailPromises = results.map(pokemon => fetchPokemonDetails(pokemon.url));
    const rawDetails = await Promise.all(rawDetailPromises);
    const processedDetails = rawDetails.map(rawPokemon => processPokemonDetails(rawPokemon));
    return processedDetails.filter(details => details !== null);
}

export async function fetchPokemonData(limit, offset) {
    const listData = await fetchPokemonListRaw(limit, offset);
    if (!listData) {
        return { list: [], nextUrl: null };
    }

    const validDetailedPokemon = await getDetailedPokemonFromResults(listData.results);
    return { list: validDetailedPokemon, nextUrl: listData.next };
}