import * as UI from './ui.js';

const searchInput = document.getElementById('searchInput');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');

/**
 * Initializes the search logic with the loaded Pokémon data.
 * This function is mainly for setting the initial data for Search module.
 * @param {Array<Object>} pokemonList
 */
export function initializeSearch(pokemonList) {
}

/**
 * Performs the search based on the search term.
 * @param {string} searchTerm 
 * @param {Array<Object>} pokemonList 
 * @param {HTMLElement} containerElement 
 */
export function performSearch(searchTerm, pokemonList, containerElement) {
    UI.showLoadingScreen(document.getElementById('loadingScreen'));

    const filteredPokemon = pokemonList.filter(pokemon => {
        return pokemon.name.toLowerCase().includes(searchTerm);
    });

    containerElement.innerHTML = '';
    if (filteredPokemon.length > 0) {
        UI.renderPokemonCards(filteredPokemon, containerElement);
    } else {
        containerElement.innerHTML = '<p>Keine Pokémon gefunden, die deiner Suche entsprechen.</p>';
    }

    UI.hideLoadingScreen(document.getElementById('loadingScreen'));
}

/**
 * Handles the click event for the search button (or input change).
 * This function is now mainly a wrapper for performSearch to be called from main.js.
 * @param {Array<Object>} pokemonList 
 * @param {HTMLElement} containerElement 
 */
export function handleSearch(pokemonList, containerElement) {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm.length >= 3) {
        performSearch(searchTerm, pokemonList, containerElement);
    } else {
        containerElement.innerHTML = '<p>Bitte gib mindestens 3 Zeichen für die Suche ein.</p>';
    }
}