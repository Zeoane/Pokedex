import * as UI from './ui.js';

const pokemonDetailOverlay = document.getElementById('pokemonDetailOverlay');
const pokemonDetailContent = document.getElementById('pokemonDetailContent');
const closeOverlayButton = document.getElementById('closeOverlayButton');
const largePokemonCard = document.getElementById('largePokemonCard');
const prevPokemonButton = document.getElementById('prevPokemonButton');
const nextPokemonButton = document.getElementById('nextPokemonButton');

let _allLoadedPokemon = [];
let _currentPokemonIndex = -1;

function initializeOverlayData(pokemonId, allPokemonData) {
    _allLoadedPokemon = allPokemonData;
    _currentPokemonIndex = _allLoadedPokemon.findIndex(p => p.id === pokemonId);

    if (_currentPokemonIndex === -1) {
        console.error(`Pokémon with ID ${pokemonId} not found in loaded data.`);
        return null;
    }
    return _allLoadedPokemon[_currentPokemonIndex];
}

function renderOverlayContent(pokemonDetails) {
    UI.showLoadingScreen(document.getElementById('loadingScreen'));
    document.body.style.overflow = 'hidden';

    const primaryType = pokemonDetails.types[0];
    if (pokemonDetailContent) {
        pokemonDetailContent.style.backgroundColor = UI.typeColors[primaryType] || '#EEE';
    } else {
        console.warn("Element 'pokemonDetailContent' not found for background color.");
    }
    largePokemonCard.innerHTML = UI.createLargePokemonCardHTML(pokemonDetails);
}

function finalizeOverlayDisplay() {
    pokemonDetailOverlay.classList.remove('hidden');
    updateNavigationButtons();
    UI.hideLoadingScreen(document.getElementById('loadingScreen'));
}

export function openPokemonDetailOverlay(pokemonId, allPokemonData) {
    const pokemonDetails = initializeOverlayData(pokemonId, allPokemonData);
    if (!pokemonDetails) {
        return;
    }
    renderOverlayContent(pokemonDetails);
    finalizeOverlayDisplay();
}

export function closePokemonDetailOverlay() {
    pokemonDetailOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    largePokemonCard.innerHTML = '';
    if (pokemonDetailContent) {
        pokemonDetailContent.style.backgroundColor = '';
    }
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
        const primaryType = nextPokemon.types[0];
        if (pokemonDetailContent) {
            pokemonDetailContent.style.backgroundColor = UI.typeColors[primaryType] || '#EEE';
        }
        largePokemonCard.innerHTML = UI.createLargePokemonCardHTML(nextPokemon);
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    if (prevPokemonButton && nextPokemonButton) {
        prevPokemonButton.disabled = (_currentPokemonIndex <= 0);
        nextPokemonButton.disabled = (_currentPokemonIndex >= _allLoadedPokemon.length - 1);
    }
}

function initializeOverlayEventListeners() {
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
}

initializeOverlayEventListeners();