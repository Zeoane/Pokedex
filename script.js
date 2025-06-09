// Globale Variable für die Anzahl der zu ladenden Pokémon pro Anfrage
const POKEMON_PER_PAGE = 20;
let currentOffset = 0;

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/';

// DOM-Elemente
const loadingScreen = document.getElementById('loadingScreen');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');
const loadMoreButton = document.getElementById('loadMoreButton');

// DOM-Elemente für Overlay
const pokemonDetailOverlay = document.getElementById('pokemonDetailOverlay');
const pokemonDetailContent = document.getElementById('pokemonDetailContent');
const closeOverlayButton = document.getElementById('closeOverlayButton');
const largePokemonCard = document.getElementById('largePokemonCard');

// DOM-Elemente für Overlay-Navigation
const prevPokemonButton = document.getElementById('prevPokemonButton');
const nextPokemonButton = document.getElementById('nextPokemonButton');

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
            <p class="pokemon-id">#${String(pokemonId).padStart(3, '0')}</p> 
            <div class="pokemon-types">${typesHTML}</div>
        </div>
    `;
}

/**
 * Erzeugt den HTML-String für die große Pokémon-Detailkarte im Overlay.
 * @param {Object} pokemonDetails - Das detaillierte Pokémon-Objekt.
 * @returns {string} Der HTML-String für die große Pokémon-Karte.
 */
function createLargePokemonCardHTML(pokemonDetails) {
    const pokemonName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    const pokemonId = String(pokemonDetails.id).padStart(3, '0');
    const imageUrl = pokemonDetails.sprites.other?.['official-artwork']?.front_default || pokemonDetails.sprites.front_default || 'placeholder.png';

    const typesHTML = pokemonDetails.types.map(typeInfo =>
        `<span class="pokemon-type" style="background-color: ${typeColors[typeInfo.type.name] || '#777'}">
            ${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
        </span>`
    ).join('');

    const primaryType = pokemonDetails.types[0].type.name;
    const cardBackgroundColor = typeColors[primaryType] || '#EEE';

    // Hier werden wir später die Stats hinzufügen
    const statsHTML = pokemonDetails.stats.map(statInfo => `
        <p><strong>${statInfo.stat.name.toUpperCase()}:</strong> ${statInfo.base_stat}</p>
    `).join('');


    return `
        <div class="large-pokemon-card" style="background-color: ${cardBackgroundColor};">
            <h2>${pokemonName} #${pokemonId}</h2>
            <img src="${imageUrl}" alt="${pokemonName}" class="large-pokemon-image">
            <div class="large-pokemon-types">${typesHTML}</div>
            <div class="pokemon-details-stats">
                <h3>Base Stats:</h3>
                ${statsHTML}
            </div>
            <p><strong>Height:</strong> ${pokemonDetails.height / 10} m</p>
            <p><strong>Weight:</strong> ${pokemonDetails.weight / 10} kg</p>
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
            // Füge das Pokémon zur globalen Liste hinzu, wenn es noch nicht existiert
            if (!allLoadedPokemon.some(p => p.id === pokemonDetails.id)) {
                allLoadedPokemon.push(pokemonDetails);
            }
        }
    });
    // Sortiere die Liste nach ID, damit die Navigation später einfacher ist
    allLoadedPokemon.sort((a, b) => a.id - b.id);
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

// Globale Variable, um die aktuell geladenen Pokémon zu speichern (für Navigation im Overlay)
let allLoadedPokemon = [];
let currentPokemonIndex = -1; // Index des aktuell im Overlay angezeigten Pokemons

/**
 * Behandelt den Klick auf eine kleine Pokémon-Karte.
 * Öffnet das Detail-Overlay.
 * @param {Event} event - Das Klick-Event.
 */
async function handlePokemonCardClick(event) {
    const clickedCard = event.target.closest('.pokemon-card');
    if (clickedCard) {
        const pokemonId = parseInt(clickedCard.dataset.id); // dataset.id gibt den Wert aus data-id
        await openPokemonDetailOverlay(pokemonId);
    }
}

/**
 * Öffnet das Pokémon Detail Overlay und lädt die Daten des spezifischen Pokémons.
 * @param {number} pokemonId - Die ID des Pokémons, dessen Details angezeigt werden sollen.
 */
async function openPokemonDetailOverlay(pokemonId) {
    showLoadingScreen(); // Ladebildschirm anzeigen

    document.body.style.overflow = 'hidden'; // Hintergrund-Scrolling verhindern

    // Holen der Pokémon-Details und Finden des Index
    const pokemonDetails = allLoadedPokemon.find(p => p.id === pokemonId);
    currentPokemonIndex = allLoadedPokemon.findIndex(p => p.id === pokemonId);

    if (pokemonDetails) {
        largePokemonCard.innerHTML = createLargePokemonCardHTML(pokemonDetails);
        pokemonDetailOverlay.classList.remove('hidden');
        updateNavigationButtons(); // Navigations-Buttons aktualisieren
    } else {
        console.error(`Could not find details for Pokémon ID: ${pokemonId}`);
        // Optional: Fehlermeldung im Overlay anzeigen
    }

    hideLoadingScreen(); // Ladebildschirm verstecken
}

/**
 * Behandelt Klicks auf das Overlay, um es zu schließen, wenn außerhalb des Inhalts geklickt wird.
 * @param {Event} event - Das Klick-Event.
 */
function handleOverlayClick(event) {
    // Überprüft, ob der Klick direkt auf dem Overlay-Element war (nicht auf einem Kindelement)
    if (event.target === pokemonDetailOverlay) {
        closePokemonDetailOverlay();
    }
}

/**
 * Schließt das Pokémon Detail Overlay.
 */
function closePokemonDetailOverlay() {
    pokemonDetailOverlay.classList.add('hidden');
    document.body.style.overflow = ''; // Hintergrund-Scrolling wieder zulassen
    largePokemonCard.innerHTML = ''; // Inhalt der großen Karte leeren
}

/**
 * Navigiert zwischen den Pokémon im Overlay.
 * @param {number} direction - -1 für vorheriges Pokémon, 1 für nächstes Pokémon.
 */
async function navigatePokemon(direction) {
    const newIndex = currentPokemonIndex + direction;

    // Überprüfen, ob der neue Index innerhalb der Grenzen liegt
    if (newIndex >= 0 && newIndex < allLoadedPokemon.length) {
        const nextPokemon = allLoadedPokemon[newIndex];
        // Das Overlay direkt mit den neuen Daten aktualisieren, ohne es komplett zu schließen/öffnen
        showLoadingScreen();
        largePokemonCard.innerHTML = createLargePokemonCardHTML(nextPokemon);
        currentPokemonIndex = newIndex;
        updateNavigationButtons(); // Navigations-Buttons nach dem Wechsel aktualisieren
        hideLoadingScreen();
    }
}

/**
 * Aktualisiert den Aktivierungszustand der Navigations-Buttons
 * basierend auf dem aktuellen Pokémon-Index.
 */
function updateNavigationButtons() {
    if (currentPokemonIndex <= 0) {
        prevPokemonButton.disabled = true;
    } else {
        prevPokemonButton.disabled = false;
    }

    if (currentPokemonIndex >= allLoadedPokemon.length - 1) {
        nextPokemonButton.disabled = true;
    } else {
        nextPokemonButton.disabled = false;
    }
}

// -----------------------------------------------------------------------------
// EVENT LISTENER
// -----------------------------------------------------------------------------
if (loadMoreButton) {
    loadMoreButton.addEventListener('click', handleLoadMore);
}

document.addEventListener('DOMContentLoaded', initializePokedex);

// Event Listener für Klick auf eine Pokémon-Karte, um das Overlay zu öffnen
if (pokemonCardContainer) {
    pokemonCardContainer.addEventListener('click', handlePokemonCardClick);
}

// Event Listener für den Schließen-Button im Overlay
if (closeOverlayButton) {
    closeOverlayButton.addEventListener('click', closePokemonDetailOverlay);
}

// Event Listener für das Schließen des Overlays durch Klick außerhalb des Inhalts
if (pokemonDetailOverlay) {
    pokemonDetailOverlay.addEventListener('click', handleOverlayClick);
}

// Event Listener für die Navigation im Overlay
if (prevPokemonButton) {
    prevPokemonButton.addEventListener('click', () => navigatePokemon(-1));
}
if (nextPokemonButton) {
    nextPokemonButton.addEventListener('click', () => navigatePokemon(1));
}