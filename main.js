// Import the modules from the 'js' folder
import * as API from './js/api.js';
import * as UI from './js/ui.js';
import * as OverlayManager from './js/overlayManager.js';
import * as Search from './js/search.js'; // Import of the search module is correct

// Global Variables
const POKEMON_PER_PAGE = 20; 
let currentOffset = 0; 
let allLoadedPokemon = []; 
const loadMoreButton = document.getElementById('loadMoreButton');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');
const loadingScreen = document.getElementById('loadingScreen');
// searchInput and searchButton are managed directly in the search.js module,
// so their references do not need to be stored explicitly here.

/**
* Initializes the Pokedex when the page loads.
* Gets the first Pokémon and renders them.
*/
async function initializePokedex() {
    UI.showLoadingScreen(loadingScreen); 
        loadMoreButton.disabled = true; 
    }
    // Get Pokémon data from the API
    const fetchedData = await API.fetchPokemonData(POKEMON_PER_PAGE, currentOffset);
    if (fetchedData.list.length > 0) {
        // render pokemon cards
        UI.renderPokemonCards(fetchedData.list, pokemonCardContainer);
        //Add newly loaded Pokémon to the global list
        allLoadedPokemon.push(...fetchedData.list); 
        // Sort the entire list by ID to ensure consistent ordering
        allLoadedPokemon.sort((a, b) => a.id - b.id); 
        // Initialize the search module with the updated Pokémon data.
        // This ensures that the search always considers the currently loaded Pokémon.
        Search.initializeSearch(allLoadedPokemon);
        // Update offset for the next "Load More" request
        currentOffset += POKEMON_PER_PAGE;
        // Activate/deactivate the "Load More" button depending on the availability of additional data
    if (fetchedData.nextUrl && loadMoreButton) {
        loadMoreButton.disabled = false;
    } else if (loadMoreButton) {
        loadMoreButton.textContent = 'Alle Pokémon geladen'; // adjust text
        loadMoreButton.disabled = true; // Deactivate button if no further data is available
        }
    } else {
        // Display error message if no Pokémon could be loaded
        pokemonCardContainer.innerHTML = '<p>Fehler beim Laden der Pokémon. Bitte versuche es später noch einmal.</p>';
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Ladefehler';
            loadMoreButton.disabled = true;
        }
    }
    UI.hideLoadingScreen(loadingScreen); // Hide loading screen

/**
 * Event listener for clicking on a Pokémon card.
 * Opens the overlay with the details of the clicked Pokémon.
 */
pokemonCardContainer.addEventListener('click', async (event) => {
    // Find the next parent card with the class 'pokemon-card'
    const clickedCard = event.target.closest('.pokemon-card');
    if (clickedCard) {
        const pokemonId = parseInt(clickedCard.dataset.id);
        // Open the overlay with the Pokémon's details and the entire list for navigation
        OverlayManager.openPokemonDetailOverlay(pokemonId, allLoadedPokemon); 
    }
});

/**
 * Event listener for the "Load More Pokémon" button.
 * Loads additional Pokémon and adds them to the display.
 */
loadMoreButton.addEventListener('click', async () => {
    loadMoreButton.disabled = true; // Disable button immediately to prevent multiple clicks
    UI.showLoadingScreen(loadingScreen); // Show loading screen
    const fetchedData = await API.fetchPokemonData(POKEMON_PER_PAGE, currentOffset);
    if (fetchedData.list.length > 0) {
        UI.renderPokemonCards(fetchedData.list, pokemonCardContainer);
        allLoadedPokemon.push(...fetchedData.list); // Add newly loaded Pokémon
        allLoadedPokemon.sort((a, b) => a.id - b.id); // Sort the list again
        currentOffset += POKEMON_PER_PAGE; // Update offset
    //Update the search module with the newly loaded Pokémon.
    // IMPORTANT: This is crucial for the search to find the newly loaded Pokémon.
        Search.initializeSearch(allLoadedPokemon); 
    }
    UI.hideLoadingScreen(loadingScreen); // Hide loading screen
    // Update the status of the "Load More" button based on the API response
    if (fetchedData.nextUrl) {
        loadMoreButton.disabled = false; // Reactivate when more data is available
    } else {
        loadMoreButton.textContent = 'Alle Pokémon geladen';
        loadMoreButton.disabled = true; // Deactivate when all Pokémon have been loaded
    }
});

// Starting point: Initialize the Pokedex as soon as the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePokedex);
