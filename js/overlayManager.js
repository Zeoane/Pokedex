import * as UI from './ui.js'; // UI Modul importieren

const pokemonDetailOverlay = document.getElementById('pokemonDetailOverlay');
const pokemonDetailContent = document.getElementById('pokemonDetailContent');
const closeOverlayButton = document.getElementById('closeOverlayButton');
const largePokemonCard = document.getElementById('largePokemonCard');
const prevPokemonButton = document.getElementById('prevPokemonButton');
const nextPokemonButton = document.getElementById('nextPokemonButton');

let _allLoadedPokemon = [];
let _currentPokemonIndex = -1;

export function openPokemonDetailOverlay(pokemonId, allPokemonData) {
    _allLoadedPokemon = allPokemonData;
    _currentPokemonIndex = _allLoadedPokemon.findIndex(p => p.id === pokemonId);

    if (_currentPokemonIndex === -1) {
        console.error(`Pokémon with ID ${pokemonId} not found in loaded data.`);
        return;
    }

    const pokemonDetails = _allLoadedPokemon[_currentPokemonIndex];

    // Setzt die Hintergrundfarbe der großen Karte hier, da es zur UI-Logik des Overlays gehört
    const primaryType = pokemonDetails.types[0].type.name;
    // Zugriff auf typeColors aus UI-Modul
    largePokemonCard.style.backgroundColor = UI.typeColors[primaryType] || '#EEE';


    UI.showLoadingScreen(document.getElementById('loadingScreen'));
    document.body.style.overflow = 'hidden';

    largePokemonCard.innerHTML = UI.createLargePokemonCardHTML(pokemonDetails);
    pokemonDetailOverlay.classList.remove('hidden');
    updateNavigationButtons();

    UI.hideLoadingScreen(document.getElementById('loadingScreen'));
}

export function closePokemonDetailOverlay() {
    pokemonDetailOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    largePokemonCard.innerHTML = '';
    largePokemonCard.style.backgroundColor = ''; // Hintergrundfarbe zurücksetzen
    _currentPokemonIndex = -1;
}

function handleOverlayClick(event) {
    if (event.target === pokemonDetailOverlay) {
        closePokemonDetailOverlay();
    }
}

export function navigatePokemon(direction) {
    const newIndex = _currentPokemonIndex + direction;
    if (newIndex >= 0 && newIndex < _allLoadedPokemon.length) {
        _currentPokemonIndex = newIndex;
        const nextPokemon = _allLoadedPokemon[_currentPokemonIndex];

        // Setzt die Hintergrundfarbe auch bei Navigation
        const primaryType = nextPokemon.types[0].type.name;
        largePokemonCard.style.backgroundColor = UI.typeColors[primaryType] || '#EEE';

        UI.showLoadingScreen(document.getElementById('loadingScreen'));
        largePokemonCard.innerHTML = UI.createLargePokemonCardHTML(nextPokemon);
        updateNavigationButtons();
        UI.hideLoadingScreen(document.getElementById('loadingScreen'));
    }
}

function updateNavigationButtons() {
    if (prevPokemonButton && nextPokemonButton) {
        prevPokemonButton.disabled = (_currentPokemonIndex <= 0);
        nextPokemonButton.disabled = (_currentPokemonIndex >= _allLoadedPokemon.length - 1);
    }
}

// Event-Listener nur hier im Modul registrieren
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