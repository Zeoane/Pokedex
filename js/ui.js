export const typeColors = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD',
};

/**
 * Displays the loading screen.
 * @param {HTMLElement} loadingScreenElement
 */
export function showLoadingScreen(loadingScreenElement) {
    if (loadingScreenElement) {
        loadingScreenElement.classList.remove('hidden');
    }
}

/**
 * Hides the loading screen.
 * @param {HTMLElement} loadingScreenElement
 */
export function hideLoadingScreen(loadingScreenElement) {
    if (loadingScreenElement) {
        loadingScreenElement.classList.add('hidden');
    }
}

/**
 * Generates the HTML string for a single Pokémon type span.
 * @param {string} typeName
 * @returns {string}
 */
function createTypeSpanHTML(typeName) {
    const displayTypeName = typeof typeName === 'string'
                                ? typeName.charAt(0).toUpperCase() + typeName.slice(1)
                                : 'Unknown Type';
    return `<span class="pokemon-type" style="background-color: ${typeColors[typeName] || '#777'}">${displayTypeName}</span>`;
}

/**
 * Creates the image HTML for a Pokémon card.
 * @param {string} imageUrl
 * @param {string} pokemonName
 * @param {string} size - 'small' or 'large'
 * @returns {string}
 */
function createPokemonImageHTML(imageUrl, pokemonName, size = 'small') {
    const className = size === 'large' ? 'large-pokemon-image' : 'pokemon-image';
    return `<img src="${imageUrl}" alt="${pokemonName}" class="${className}">`;
}

/**
 * Creates the textual content HTML (name, ID, types) for a small Pokémon card.
 * @param {Object} pokemonDetails
 * @param {string} typesHTML
 * @returns {string}
 */
function createSmallCardContentHTML(pokemonDetails, typesHTML) {
    const pokemonName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    const pokemonId = String(pokemonDetails.id).padStart(3, '0');
    return `
        <h3>${pokemonName}</h3>
        <p class="pokemon-id">#${pokemonId}</p>
        <div class="pokemon-types">${typesHTML}</div>`;
}

/**
 * Creates the HTML string for a small Pokémon card.
 * @param {Object} pokemonDetails
 * @returns {string}
 */
export function createPokemonCardHTML(pokemonDetails) {
    const imageUrl = pokemonDetails.imageUrl || 'https://placehold.co/120x120/EFEFEF/AAAAAA?text=No+Image';
    const typesHTML = pokemonDetails.types.map(createTypeSpanHTML).join('');
    const primaryType = pokemonDetails.types[0];
    const cardBackgroundColor = typeColors[primaryType] || '#EEE';
    const imageElement = createPokemonImageHTML(imageUrl, pokemonDetails.name, 'small');
    const contentElement = createSmallCardContentHTML(pokemonDetails, typesHTML);
    return `
        <div class="pokemon-card"
             data-id="${pokemonDetails.id}"
             data-name="${pokemonDetails.name}"
             style="background-color: ${cardBackgroundColor};">
            ${imageElement}${contentElement}</div>`;
}

/**
 * Generates the HTML for individual stat lines.
 * @param {Object} statInfo
 * @returns {string}
 */
function createStatLineHTML(statInfo) {
    const statName = typeof statInfo.name === 'string'
                               ? statInfo.name.charAt(0).toUpperCase() + statInfo.name.slice(1)
                               : 'Unknown Stat';
    return `<p><strong>${statName}:</strong> ${statInfo.base_stat}</p>`;
}

/**
 * Generates the HTML for Pokémon abilities.
 * @param {Array<string>} abilities
 * @returns {string}
 */
function formatAbilitiesHTML(abilities) {
    return abilities.map(abilityName =>
        typeof abilityName === 'string'
        ? abilityName.charAt(0).toUpperCase() + abilityName.slice(1)
        : 'Unknown Ability'
    ).join(', ');
}

/**
 * Creates the HTML for the detailed stats section of the large card.
 * @param {Object} pokemonDetails
 * @param {string} abilitiesHTML
 * @param {string} statsHTML
 * @returns {string}
 */
function createDetailedStatsHTML(pokemonDetails, abilitiesHTML, statsHTML) {
    return `
        <div class="pokemon-details-stats">
            <h3>Details:</h3>
            <p><strong>Height:</strong> ${pokemonDetails.height / 10} m</p>
            <p><strong>Weight:</strong> ${pokemonDetails.weight / 10} kg</p>
            <p><strong>Abilities:</strong> ${abilitiesHTML}</p>
            <h3>Base Stats:</h3>
            ${statsHTML}
        </div>`;
}

/**
 * Creates the HTML string for the large Pokémon card in the overlay.
 * @param {Object} pokemonDetails
 * @returns {string}
 */
export function createLargePokemonCardHTML(pokemonDetails) {
    const pokemonName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    const pokemonId = String(pokemonDetails.id).padStart(3, '0');
    const imageUrl = pokemonDetails.imageUrl || 'https://placehold.co/200x200/EFEFEF/AAAAAA?text=No+Image';
    const typesHTML = pokemonDetails.types.map(createTypeSpanHTML).join('');
    const statsHTML = pokemonDetails.stats.map(createStatLineHTML).join('');
    const abilitiesHTML = formatAbilitiesHTML(pokemonDetails.abilities);
    const imageElement = createPokemonImageHTML(imageUrl, pokemonName, 'large');
    const detailedStatsElement = createDetailedStatsHTML(pokemonDetails, abilitiesHTML, statsHTML);
    return `<h2>#${pokemonId} ${pokemonName}</h2>
        ${imageElement}
        <div class="large-pokemon-types">${typesHTML}</div>
        ${detailedStatsElement}`;
}

/**
 * Renders a list of Pokémon cards into a specified container.
 * @param {Array<Object>} detailedPokemonList
 * @param {HTMLElement} containerElement
 */
export function renderPokemonCards(detailedPokemonList, containerElement) {
    if (!containerElement) {
        console.error('Container element for Pokémon cards not found!');
        return;
    }
    const fragment = document.createDocumentFragment();
    detailedPokemonList.forEach(pokemonDetails => {
        if (pokemonDetails) {
            const cardElement = createPokemonCardElement(pokemonDetails); 
            if (cardElement) {
                fragment.appendChild(cardElement);
        }}
    });
    containerElement.appendChild(fragment);
}

function createPokemonCardElement(pokemonDetails) {
    const cardHTMLString = createPokemonCardHTML(pokemonDetails);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHTMLString;
    return tempDiv.firstElementChild;
}

/**
 * Renders the details of a single Pokémon into the large overlay card.
 * This function is already handled by renderOverlayContent in overlayManager.js,
 * but if you need to call it directly for specific cases, it's here.
 * @param {Object} pokemonDetails
 * @param {HTMLElement} containerElement
 */
export function renderLargePokemonCard(pokemonDetails, containerElement) {
    if (!pokemonDetails || !containerElement) {
        console.error('Invalid Pokémon data or container for large card rendering.');
        return;
    }
    const cardHTML = createLargePokemonCardHTML(pokemonDetails);
    containerElement.innerHTML = cardHTML;
    const primaryType = pokemonDetails.types[0];
    const overlayContent = document.getElementById('pokemonDetailContent');
    if (overlayContent) {
        overlayContent.style.backgroundColor = typeColors[primaryType] || '#EEE';
    }
}