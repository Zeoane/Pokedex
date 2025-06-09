// main.js

// Importe die Module aus dem 'js' Ordner
import * as API from './js/api.js';
import * as UI from './js/ui.js';
import * as OverlayManager from './js/overlayManager.js';
import * as Search from './js/search.js'; // Assuming search.js is a module that exports its logic

// Globale Variable für die Anzahl der zu ladenden Pokémon pro Anfrage
const POKEMON_PER_PAGE = 20;
let currentOffset = 0;
let allLoadedPokemon = []; // Globale Liste aller geladenen Pokémon

// DOM-Elemente, die von main.js direkt verwendet werden
const loadMoreButton = document.getElementById('loadMoreButton');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');
const loadingScreen = document.getElementById('loadingScreen');
const searchInput = document.getElementById('searchInput'); // Hinzugefügt für Search-Modul
const searchButton = document.getElementById('searchButton'); // Hinzugefügt für Search-Modul


// -----------------------------------------------------------------------------
// HAUPTLOGIK UND EVENT HANDLER
// -----------------------------------------------------------------------------

async function initializePokedex() {
    UI.showLoadingScreen(loadingScreen);
    if (loadMoreButton) loadMoreButton.disabled = true;

    const fetchedData = await API.fetchPokemonData(POKEMON_PER_PAGE, currentOffset);

    if (fetchedData.list.length > 0) {
        UI.renderPokemonCards(fetchedData.list, pokemonCardContainer);
        allLoadedPokemon.push(...fetchedData.list); // Füge neue Pokémon zur globalen Liste hinzu
        allLoadedPokemon.sort((a, b) => a.id - b.id); // Sortiere nach ID
        currentOffset += POKEMON_PER_PAGE;
        if (fetchedData.nextUrl && loadMoreButton) {
            loadMoreButton.disabled = false;
        } else if (loadMoreButton) {
            loadMoreButton.textContent = 'All Pokémon Loaded';
        }
    } else {
        pokemonCardContainer.innerHTML = '<p>Error loading Pokémon. Please try again later.</p>';
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Loading Error';
            loadMoreButton.disabled = true;
        }
    }
    UI.hideLoadingScreen(loadingScreen);
}

// Event Listener für Klick auf eine Pokémon-Karte, um das Overlay zu öffnen
pokemonCardContainer.addEventListener('click', async (event) => {
    const clickedCard = event.target.closest('.pokemon-card');
    if (clickedCard) {
        const pokemonId = parseInt(clickedCard.dataset.id);
        OverlayManager.openPokemonDetailOverlay(pokemonId, allLoadedPokemon); // allLoadedPokemon übergeben
    }
});

loadMoreButton.addEventListener('click', async () => {
    loadMoreButton.disabled = true;
    UI.showLoadingScreen(loadingScreen);
    const fetchedData = await API.fetchPokemonData(POKEMON_PER_PAGE, currentOffset);
    if (fetchedData.list.length > 0) {
        UI.renderPokemonCards(fetchedData.list, pokemonCardContainer);
        allLoadedPokemon.push(...fetchedData.list);
        allLoadedPokemon.sort((a, b) => a.id - b.id);
        currentOffset += POKEMON_PER_PAGE;
    }
    UI.hideLoadingScreen(loadingScreen);
    if (fetchedData.nextUrl) {
        loadMoreButton.disabled = false;
    } else {
        loadMoreButton.textContent = 'All Pokémon Loaded';
        loadMoreButton.disabled = true;
    }
});

// Event Listener für den Such-Button - integriert in search.js, aber hier als Beispiel für main.js Zugriff
// Da search.js nun ein Modul ist, sollte es seinen eigenen Listener registrieren.
// Wenn search.js eine handleSearch exportiert:
if (searchButton) {
    searchButton.addEventListener('click', Search.handleSearch); // Hier kann Search.handleSearch aufgerufen werden
}
// searchInput.addEventListener('input', (event) => { /* Live-Suche? */ });


document.addEventListener('DOMContentLoaded', initializePokedex);

