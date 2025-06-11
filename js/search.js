import * as UI from './ui.js'; // UI Modul import

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');

let allPokemonData = []; // This list is filled by main.js

/**
 * Initializes the search logic with the loaded Pokémon data.
* Called by main.js to pass the allLoadedPokemon list.
 * @param {Array<Object>} pokemonList - The complete list of all loaded Pokémon.
 */
export function initializeSearch(pokemonList) {
    allPokemonData = pokemonList;
    // Event listener for input in the search field (live search from 3 characters)
    // This listener is registered only once, when initializeSearch is called.
    if (!searchInput.hasAttribute('data-listener-added')) { // Prevents duplicate listeners
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            performSearch(searchTerm);
        });
        searchInput.setAttribute('data-listener-added', 'true'); // Mark that listener has been added
    }
}

/**
 * Performs the search based on the search term.
 * @param {string} searchTerm - The search term.
 */
function performSearch(searchTerm) {
    // If the search term is empty, show all loaded Pokémon
    if (searchTerm.length === 0) {
    //Here, the container is simply refilled with all loaded Pokemon.
    // If the "Load More" button is to be reactivated and the original Pokedex view
    // is to be restored with the correct offset, an event would have to be triggered here
    // or a callback function would have to be passed to main.js.
    UI.renderPokemonCards(allPokemonData, pokemonCardContainer);
    //Since the loadMoreButton has been removed from search.js,
    // no direct action can be performed here. main.js must handle this.
    // the current content is simply overwritten with all loaded Pokémon.
        return;
    }
    // If the search term has less than 3 characters, message is displayed
    if (searchTerm.length < 3) {
        pokemonCardContainer.innerHTML = '<p>Bitte gib mindestens 3 Zeichen für die Suche ein.</p>';
        return;
    }
    // Show loading screen, as filtering may take a short time depending on the amount of data
    UI.showLoadingScreen(document.getElementById('loadingScreen')); 
    const filteredPokemon = allPokemonData.filter(pokemon => {
    //Check if the Pokémon name contains the search term
    // .includes() is more flexible than === or startsWith
        return pokemon.name.toLowerCase().includes(searchTerm);
    });

    // Empty container before rendering new results
    pokemonCardContainer.innerHTML = '';
    if (filteredPokemon.length > 0) {
        UI.renderPokemonCards(filteredPokemon, pokemonCardContainer);
    } else {
        pokemonCardContainer.innerHTML = '<p>Keine Pokémon gefunden, die deiner Suche entsprechen.</p>';
    }
    UI.hideLoadingScreen(document.getElementById('loadingScreen')); // Hide loading screen
}

// The handleSearch function, if it's still called from main.js (with button click).
// It now calls performSearch internally to streamline the logic.
export function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    performSearch(searchTerm);
}

// The event listener for the search button remains here, as discussed.
// Adds a small check in case the button isn't immediately available.
if (searchButton) {
    // Again: Make sure that the listener is added only once
    if (!searchButton.hasAttribute('data-listener-added')) {
        searchButton.addEventListener('click', handleSearch);
        searchButton.setAttribute('data-listener-added', 'true');
    }
} else {
    console.warn("Search button not found, event listener not attached.");
}