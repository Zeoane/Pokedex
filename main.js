// Import the modules from the 'js' folder
import * as API from './js/api.js';
import * as UI from './js/ui.js';
import * as OverlayManager from './js/overlayManager.js';
import * as Search from './js/search.js';

// Global Variables
const POKEMON_PER_PAGE = 20;
let currentOffset = 0;
let allLoadedPokemon = [];
const loadMoreButton = document.getElementById('loadMoreButton');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');
const loadingScreen = document.getElementById('loadingScreen');

/**
 * Updates the global list of loaded Pokémon and the search module.
 * @param {Array<Object>} newPokemonList - List of newly fetched Pokémon.
 */
function updatePokemonData(newPokemonList) {
    allLoadedPokemon.push(...newPokemonList); // Add newly loaded Pokémon to the global list
    allLoadedPokemon.sort((a, b) => a.id - b.id); // Sort the entire list by ID to ensure consistent ordering
    Search.initializeSearch(allLoadedPokemon); // Initialize/update the search module with the current Pokémon data
}

/**
 * Handles the state of the "Load More" button.
 * @param {string|null} nextUrl - URL for the next page of Pokémon, or null if no more.
 */
function updateLoadMoreButtonState(nextUrl) {
    if (!loadMoreButton) return; // Exit if button element doesn't exist

    if (nextUrl) {
        loadMoreButton.disabled = false; // Reactivate when more data is available
        loadMoreButton.textContent = 'Load more Pokémon'; // Reset text if previously changed
    } else {
        loadMoreButton.textContent = 'All Pokémon loaded'; // Adjust text
        loadMoreButton.disabled = true; // Deactivate button if no further data is available
    }
}

/**
 * Displays an error message in the Pokémon card container.
 */
function displayLoadingError() {
    pokemonCardContainer.innerHTML = '<p>Error loading Pokémon. Please try again later.</p>'; // Display error message
    if (loadMoreButton) { // Check if button exists
        loadMoreButton.textContent = 'Load Error'; // Adjust button text
        loadMoreButton.disabled = true; // Disable button
    }
}

/**
 * Fetches and renders Pokémon data for the initial load or "Load More".
 * @param {number} limit - Number of Pokémon to fetch.
 * @param {number} offset - Starting offset for the fetch.
 * @returns {Promise<Object>} - Fetched data containing list and nextUrl.
 */
async function fetchAndRenderPokemon(limit, offset) {
    UI.showLoadingScreen(loadingScreen); // Show loading screen
    if (loadMoreButton) loadMoreButton.disabled = true; // Disable button immediately to prevent multiple clicks

    const fetchedData = await API.fetchPokemonData(limit, offset); // Get Pokémon data from the API

    if (fetchedData.list.length > 0) { // Check if data was successfully fetched
        UI.renderPokemonCards(fetchedData.list, pokemonCardContainer); // Render pokemon cards
        updatePokemonData(fetchedData.list); // Update global list and search
        currentOffset += POKEMON_PER_PAGE; // Update offset for the next request
    } else {
        displayLoadingError(); // Display error if no Pokémon loaded
    }

    UI.hideLoadingScreen(loadingScreen); // Hide loading screen
    updateLoadMoreButtonState(fetchedData.nextUrl); // Update load more button status
    return fetchedData; // Return fetched data for external use (e.g., Load More logic)
}


/**
 * Initializes the Pokedex when the page loads.
 * Gets the first Pokémon and renders them.
 */
async function initializePokedex() {
    await fetchAndRenderPokemon(POKEMON_PER_PAGE, currentOffset); // Fetch and render initial Pokémon
}

/**
 * Handles the "Load More Pokémon" button click.
 */
async function handleLoadMoreClick() {
    await fetchAndRenderPokemon(POKEMON_PER_PAGE, currentOffset); // Fetch and render more Pokémon
}

/**
 * Event listener for clicking on a Pokémon card.
 * Opens the overlay with the details of the clicked Pokémon.
 */
pokemonCardContainer.addEventListener('click', async (event) => {
    const clickedCard = event.target.closest('.pokemon-card'); // Find the closest parent card with the class 'pokemon-card'
    if (clickedCard) { // Check if a card was clicked
        const pokemonId = parseInt(clickedCard.dataset.id); // Get the Pokémon ID from the card's data attribute
        OverlayManager.openPokemonDetailOverlay(pokemonId, allLoadedPokemon); // Open the overlay with details and the full list for navigation
    }
});

// Event listener for the "Load More Pokémon" button.
if (loadMoreButton) { // Check if button exists
    loadMoreButton.addEventListener('click', handleLoadMoreClick); // Attach the click handler
}


// Starting point: Initialize the Pokedex as soon as the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePokedex);
