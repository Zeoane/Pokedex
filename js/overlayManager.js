import * as UI from './ui.js'; // UI Modul import

const pokemonDetailOverlay = document.getElementById('pokemonDetailOverlay');
const pokemonDetailContent = document.getElementById('pokemonDetailContent'); // Used for the background color
const closeOverlayButton = document.getElementById('closeOverlayButton');
const largePokemonCard = document.getElementById('largePokemonCard'); // Container for the contents of the large map
const prevPokemonButton = document.getElementById('prevPokemonButton');
const nextPokemonButton = document.getElementById('nextPokemonButton');

let _allLoadedPokemon = [];
let _currentPokemonIndex = -1;

/**
 * Opens the overlay and displays the details of the clicked Pokémon.
 * @param {number} pokemonId - The ID of the clicked Pokémon.
 * @param {Array<Object>} allPokemonData - The complete list of currently loaded Pokémon.
 */
export function openPokemonDetailOverlay(pokemonId, allPokemonData) {
    _allLoadedPokemon = allPokemonData;
    _currentPokemonIndex = _allLoadedPokemon.findIndex(p => p.id === pokemonId);
    if (_currentPokemonIndex === -1) {
        console.error(`Pokémon with ID ${pokemonId} not found in loaded data.`);
        return;
    }
    const pokemonDetails = _allLoadedPokemon[_currentPokemonIndex];
    // Ensure that the loading screen is displayed before rendering begins
    UI.showLoadingScreen(document.getElementById('loadingScreen'));
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    // Sets the background color of the OVERLAY CONTENT based on the primary type
    // pokemonDetails.types is already an array of strings (e.g., ['grass', 'poison'])
    const primaryType = pokemonDetails.types[0]; // Direct access to the type name
    if (pokemonDetailContent) { // Ensure that the element exists
        pokemonDetailContent.style.backgroundColor = UI.typeColors[primaryType] || '#EEE';
    } else {
        console.warn("Element 'pokemonDetailContent' not found for background color.");
    }
    largePokemonCard.innerHTML = UI.createLargePokemonCardHTML(pokemonDetails);
    pokemonDetailOverlay.classList.remove('hidden'); // show Overlay 
    updateNavigationButtons();
    // Hide loading screen after everything has been rendered and displayed
    UI.hideLoadingScreen(document.getElementById('loadingScreen'));
}

/**
 * close Overlay.
 */
export function closePokemonDetailOverlay() {
    pokemonDetailOverlay.classList.add('hidden');
    document.body.style.overflow = ''; // Allow background scrolling again
    largePokemonCard.innerHTML = ''; // Empty contents
    // Reset background color of overlay content
    if (pokemonDetailContent) {
        pokemonDetailContent.style.backgroundColor = ''; 
    }
    _currentPokemonIndex = -1; // Reset index
}

/**
* Handles clicks on the overlay to close it when clicked outside the content.
 * @param {Event} event - click event
 */
function handleOverlayClick(event) {
    if (event.target === pokemonDetailOverlay) {
        closePokemonDetailOverlay();
    }
}

/**
 * Navigates to the previous or next Pokémon in the overlay.
 * @param {number} direction - -1 for previous, 1 for next.
*/
export function navigatePokemon(direction) {
    const newIndex = _currentPokemonIndex + direction;
    if (newIndex >= 0 && newIndex < _allLoadedPokemon.length) {
        _currentPokemonIndex = newIndex;
        const nextPokemon = _allLoadedPokemon[_currentPokemonIndex];
        UI.showLoadingScreen(document.getElementById('loadingScreen'));
        // Sets the background color also for navigation
        const primaryType = nextPokemon.types[0]; // Direct access to the type name
        if (pokemonDetailContent) { // Ensure that the element exists
            pokemonDetailContent.style.backgroundColor = UI.typeColors[primaryType] || '#EEE';
        }
        largePokemonCard.innerHTML = UI.createLargePokemonCardHTML(nextPokemon);
        updateNavigationButtons();
        UI.hideLoadingScreen(document.getElementById('loadingScreen'));
    }
}

/**
 * Updates the 'disabled' status of the navigation buttons.
 */
function updateNavigationButtons() {
    if (prevPokemonButton && nextPokemonButton) {
        prevPokemonButton.disabled = (_currentPokemonIndex <= 0);
        nextPokemonButton.disabled = (_currentPokemonIndex >= _allLoadedPokemon.length - 1);
    }
}
// Register event listeners only here in the module
// Checking whether the elements exist is important because the script is loaded
// before the entire DOM is available, and getElementById could return null.
if (closeOverlayButton) {
    closeOverlayButton.addEventListener('click', closePokemonDetailOverlay);
}
if (pokemonDetailOverlay) {
    pokemonDetailOverlay.addEventListener('click', handleOverlayClick);
}
if (prevPokemonButton) {
    prevPokemonButton.addEventListener('click', () => navigatePokemon(-1));
}
if (nextPokemonButton) {
    nextPokemonButton.addEventListener('click', () => navigatePokemon(1));
}