// Globale Variable für die Anzahl der zu ladenden Pokémon pro Anfrage
const POKEMON_PER_PAGE = 20;
let currentOffset = 0;

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/';

// DOM-Elemente
const loadingScreen = document.getElementById('loadingScreen');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');
const loadMoreButton = document.getElementById('loadMoreButton');

// Typ-zu-Farbe Mapping (kann erweitert/angepasst werden)
const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

// -----------------------------------------------------------------------------
// HILFSFUNKTIONEN FÜR UI-MANIPULATION (Ladebildschirm)
// -----------------------------------------------------------------------------

/**
 * Zeigt den Ladebildschirm an.
 */
function showLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

/**
 * Versteckt den Ladebildschirm.
 */
function hideLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

// -----------------------------------------------------------------------------
// FUNKTIONEN ZUM ERSTELLEN UND RENDERN VON POKEMON-KARTEN
// -----------------------------------------------------------------------------

/**
 * Erzeugt den HTML-String für eine einzelne kleine Pokémon-Karte.
 * @param {Object} pokemonDetails - Das detaillierte Pokémon-Objekt.
 *                                  Muss mindestens id, name, sprites.front_default und types enthalten.
 * @returns {string} Der HTML-String für die Pokémon-Karte.
 */
function createPokemonCardHTML(pokemonDetails) {
    const pokemonName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    const pokemonId = pokemonDetails.id;
    const imageUrl = pokemonDetails.sprites.other?.['official-artwork']?.front_default || pokemonDetails.sprites.front_default || 'placeholder.png'; // Offizielles Artwork bevorzugen

    const typesHTML = pokemonDetails.types.map(typeInfo =>
        `<span class="pokemon-type" style="background-color: ${typeColors[typeInfo.type.name] || '#777'}">
            ${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
        </span>`
    ).join('');

      // Haupttyp für die Hintergrundfarbe der Karte (der erste Typ)
    const primaryType = pokemonDetails.types[0].type.name;
    const cardBackgroundColor = typeColors[primaryType] || '#EEE'; // Fallback auf eine neutrale Farbe

    return `
        <div class="pokemon-card" 
             data-id="${pokemonId}" 
             data-name="${pokemonDetails.name}" 
             style="background-color: ${cardBackgroundColor};">
            <img src="${imageUrl}" alt="${pokemonName}" class="pokemon-image">
            <h3>${pokemonName}</h3>
            <p class="pokemon-id">#${String(pokemonId).padStart(3, '0')}</p> {/* ID mit führenden Nullen */}
            <div class="pokemon-types">${typesHTML}</div>
        </div>
    `;
}


/**
 * Rendert die Pokémon-Karten im DOM.
 * @param {Array<Object>} detailedPokemonList - Eine Liste von detaillierten Pokémon-Objekten.
 */
function renderPokemonCards(detailedPokemonList) {
    if (!pokemonCardContainer) {
        console.error('Pokemon card container not found!');
        return;
    }
    detailedPokemonList.forEach(pokemonDetails => {
        if (pokemonDetails) { // Sicherstellen, dass das Detail-Objekt existiert
            const cardHTML = createPokemonCardHTML(pokemonDetails);
            pokemonCardContainer.innerHTML += cardHTML;
        }
    });
}

// -----------------------------------------------------------------------------
// FUNKTIONEN FÜR API-ABFRAGEN
// -----------------------------------------------------------------------------

/**
 * Ruft die Detailinformationen für ein einzelnes Pokémon ab.
 * @async
 * @param {string} url - Die URL zur Detailansicht des Pokémons.
 * @returns {Promise<Object|null>} Ein Promise, das zum Detailobjekt des Pokémons oder null bei Fehler auflöst.
 */
async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch Pokémon details from ${url}:`, response.status);
            return null; // Wichtig für Promise.all, damit es nicht komplett fehlschlägt
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Pokémon details from ${url}:`, error);
        return null;
    }
}

/**
 * Ruft eine Liste von Pokémon von der PokéAPI ab und holt für jedes die Detaildaten.
 * @async
 * @param {number} limit - Die Anzahl der Pokémon, die abgerufen werden sollen.
 * @param {number} offset - Der Startindex für die Pokémon-Liste.
 * @returns {Promise<Object>} Ein Promise, das zu einem Objekt mit {list: Array, nextUrl: string|null} auflöst.
 *                            'list' ist das Array der detaillierten Pokémon-Objekte.
 */

async function fetchPokemonData(limit, offset) { 
    const listUrl = `${POKE_API_BASE_URL}pokemon?limit=${limit}&offset=${offset}`;
    try {
        const listResponse = await fetch(listUrl);
        if (!listResponse.ok) {
            console.error('Failed to fetch Pokémon list:', listResponse.status, await listResponse.text());
            return { list: [], nextUrl: null };
        }
        const listData = await listResponse.json();

        // erstellt ein Array von Promises für alle Detail-Abfragen
        const detailPromises = listData.results.map(pokemon => fetchPokemonDetails(pokemon.url));
        // warten, bis alle Detail-Abfragen abgeschlossen sind
        const detailedPokemon = await Promise.all(detailPromises);

        // Filtert null-Werte heraus, falls einzelne Detail-Abfragen fehlschlagen
        const validDetailedPokemon = detailedPokemon.filter(details => details !== null);

        return { list: validDetailedPokemon, nextUrl: listData.next };
    } catch (error) {
        console.error('Error in fetchPokemonData:', error);
        return { list: [], nextUrl: null };
    }
}


// -----------------------------------------------------------------------------
// HAUPTLOGIK UND EVENT HANDLER
// -----------------------------------------------------------------------------

/**
 * Klick auf den "Load More" Button.
 * @async
 */
async function handleLoadMore() {
    if (!loadMoreButton) return;
    loadMoreButton.disabled = true;
    showLoadingScreen();

    const fetchedData = await fetchPokemonData(POKEMON_PER_PAGE, currentOffset); // fetchPokemonData verwenden

    if (fetchedData.list.length > 0) {
        renderPokemonCards(fetchedData.list);
        currentOffset += POKEMON_PER_PAGE; // Offset wird nur erhöht, wenn erfolgreich geladen
    } else {
        console.log('No more Pokémon data or error during fetch for "load more".');
    }

    hideLoadingScreen();

    if (fetchedData.nextUrl) {
        loadMoreButton.disabled = false;
    } else {
        loadMoreButton.disabled = true;
        loadMoreButton.textContent = 'Alle Pokémon geladen';
        console.log('All Pokémon have been loaded.');
    }
}

/**
 * Hauptfunktion, um die ersten Pokémon zu laden und anzuzeigen.
 * @async
 */
async function initializePokedex() {
    showLoadingScreen();
    if (loadMoreButton) loadMoreButton.disabled = true;

    const fetchedData = await fetchPokemonData(POKEMON_PER_PAGE, currentOffset); // fetchPokemonData verwenden

    if (fetchedData.list.length > 0) {
        renderPokemonCards(fetchedData.list);
        currentOffset += POKEMON_PER_PAGE; // Offset nur erhöhen, wenn erfolgreich geladen
        if (fetchedData.nextUrl && loadMoreButton) {
            loadMoreButton.disabled = false;
        } else if (loadMoreButton) {
            loadMoreButton.textContent = 'Alle Pokémon geladen';
        }
    } else {
        pokemonCardContainer.innerHTML = '<p>Fehler beim Laden der Pokémon. Bitte versuche es später erneut.</p>';
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Fehler beim Laden';
            loadMoreButton.disabled = true;
        }
    }
    hideLoadingScreen();
}

// -----------------------------------------------------------------------------
// EVENT LISTENER
// -----------------------------------------------------------------------------
if (loadMoreButton) {
    loadMoreButton.addEventListener('click', handleLoadMore);
}

document.addEventListener('DOMContentLoaded', initializePokedex);
