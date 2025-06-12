import * as API from './js/api.js';
import * as UI from './js/ui.js';
import * as OverlayManager from './js/overlayManager.js';
import * as Search from './js/search.js';

const POKEMON_PER_PAGE = 20;
let currentOffset = 0;
let allLoadedPokemon = [];
const loadMoreButton = document.getElementById('loadMoreButton');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');
const loadingScreen = document.getElementById('loadingScreen');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

const clearSearchButton = document.createElement('button');
clearSearchButton.id = 'clearSearchButton';
clearSearchButton.textContent = 'Clear';
clearSearchButton.type = 'button';
clearSearchButton.classList.add('search-button-clear');

const searchContainer = document.querySelector('.search-container');
if (searchContainer) {
    searchContainer.appendChild(clearSearchButton);
}

function updatePokemonData(newPokemonList) {
    allLoadedPokemon.push(...newPokemonList);
    allLoadedPokemon.sort((a, b) => a.id - b.id);
    Search.initializeSearch(allLoadedPokemon);
}

function updateLoadMoreButtonState(nextUrl) {
    if (!loadMoreButton) return;
    if (searchInput.value.trim().length === 0) {
        setLoadMoreButtonVisibility(true, nextUrl);
    } else {
        loadMoreButton.style.display = 'none';
    }
}

function setLoadMoreButtonVisibility(isVisible, nextUrl) {
    if (isVisible) {
        loadMoreButton.disabled = !nextUrl;
        loadMoreButton.textContent = nextUrl ? 'Load more Pokémon' : 'All Pokémon loaded';
        loadMoreButton.style.display = 'block';
    } else {
        loadMoreButton.style.display = 'none';
    }
}

function displayLoadingError() {
    pokemonCardContainer.innerHTML = '<p>Error loading Pokémon. Please try again later.</p>';
    if (loadMoreButton) {
        loadMoreButton.textContent = 'Load Error';
        loadMoreButton.disabled = true;
        loadMoreButton.style.display = 'block';
    }
}

async function fetchAndRenderPokemonCards(limit, offset, clearContainer) {
    UI.showLoadingScreen(loadingScreen);
    if (loadMoreButton) loadMoreButton.disabled = true;

    if (clearContainer) {
        pokemonCardContainer.innerHTML = '';
        allLoadedPokemon = [];
    }

    const fetchedData = await API.fetchPokemonData(limit, offset);
    handleFetchedPokemonData(fetchedData);

    UI.hideLoadingScreen(loadingScreen);
    updateLoadMoreButtonState(fetchedData.nextUrl);
    return fetchedData;
}

function handleFetchedPokemonData(fetchedData) {
    if (fetchedData.list.length > 0) {
        UI.renderPokemonCards(fetchedData.list, pokemonCardContainer);
        if (searchInput.value.trim().length === 0) {
            updatePokemonData(fetchedData.list);
            currentOffset += POKEMON_PER_PAGE;
        }
    } else {
        handleEmptyFetchedData();
    }
}

function handleEmptyFetchedData() {
    if (searchInput.value.trim().length === 0) {
        displayLoadingError();
    } else {
        pokemonCardContainer.innerHTML = '<p>Keine Pokémon gefunden, die deiner Suche entsprechen.</p>';
    }
}

async function initializePokedex() {
    currentOffset = 0;
    allLoadedPokemon = [];
    await fetchAndRenderPokemonCards(POKEMON_PER_PAGE, currentOffset, true);
    if (clearSearchButton) {
        clearSearchButton.style.display = 'none';
    }
}

async function handleLoadMoreClick() {
    if (searchInput.value.trim().length === 0) {
        await fetchAndRenderPokemonCards(POKEMON_PER_PAGE, currentOffset);
    }
}

function handlePokemonCardClick(event) {
    const clickedCard = event.target.closest('.pokemon-card');
    if (clickedCard) {
        const pokemonId = parseInt(clickedCard.dataset.id);
        OverlayManager.openPokemonDetailOverlay(pokemonId, allLoadedPokemon);
    }
}

function handleSearchButtonClick() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm.length >= 3) {
        executeSearch(searchTerm);
    } else {
        displaySearchInputError();
    }
}

function executeSearch(searchTerm) {
    pokemonCardContainer.innerHTML = '';
    Search.performSearch(searchTerm, allLoadedPokemon, pokemonCardContainer);
    if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
    }
    if (clearSearchButton) {
        clearSearchButton.style.display = 'inline-block';
    }
}

function displaySearchInputError() {
    pokemonCardContainer.innerHTML = '<p>Bitte gib mindestens 3 Zeichen für die Suche ein.</p>';
    if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
    }
    if (clearSearchButton) {
        clearSearchButton.style.display = 'none';
    }
}

function handleSearchInput() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm.length >= 3) {
        executeSearch(searchTerm);
    } else if (searchTerm.length === 0) {
        resetPokedexView();
    } else {
        displaySearchInputError();
    }
}

function resetPokedexView() {
    initializePokedex();
    if (loadMoreButton) {
        loadMoreButton.style.display = 'block';
    }
    if (clearSearchButton) {
        clearSearchButton.style.display = 'none';
    }
}

function handleClearSearchClick() {
    searchInput.value = '';
    initializePokedex();
    if (clearSearchButton) {
        clearSearchButton.style.display = 'none';
    }
}

pokemonCardContainer.addEventListener('click', handlePokemonCardClick);
if (loadMoreButton) {
    loadMoreButton.addEventListener('click', handleLoadMoreClick);
}
if (searchButton) {
    searchButton.addEventListener('click', handleSearchButtonClick);
}
if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
}
if (clearSearchButton) {
    clearSearchButton.addEventListener('click', handleClearSearchClick);
}

document.addEventListener('DOMContentLoaded', initializePokedex);