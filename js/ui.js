export const typeColors = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD',
};

export function showLoadingScreen(loadingScreenElement) {
    if (loadingScreenElement) {
        loadingScreenElement.classList.remove('hidden');
    }
}

export function hideLoadingScreen(loadingScreenElement) {
    if (loadingScreenElement) {
        loadingScreenElement.classList.add('hidden');
    }
}

/**
* Creates the HTML string for a small Pokémon card.
* Expects a pre-formatted Pokémon details object.
 * @param {Object} pokemonDetails - A formatted Pokémon details object (from api.js).
 * @returns {string} - HTML-String card
 */
export function createPokemonCardHTML(pokemonDetails) {
    const pokemonName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    const pokemonId = pokemonDetails.id;
   // Use image URL directly from pokemonDetails as it has already been formatted in api.js
    const imageUrl = pokemonDetails.imageUrl || 'https://via.placeholder.com/120x120.png?text=No+Image'; // Fallback picture
    const typesHTML = pokemonDetails.types.map(typeName =>
        `<span class="pokemon-type" style="background-color: ${typeColors[typeName] || '#777'}">
            ${typeName.charAt(0).toUpperCase() + typeName.slice(1)}
        </span>`
    ).join('');
    const primaryType = pokemonDetails.types[0];
    const cardBackgroundColor = typeColors[primaryType] || '#EEE';
    return `
        <div class="pokemon-card"
             data-id="${pokemonId}"
             data-name="${pokemonDetails.name}"
             style="background-color: ${cardBackgroundColor};">
            <img src="${imageUrl}" alt="${pokemonName}" class="pokemon-image">
            <h3>${pokemonName}</h3>
            <p class="pokemon-id">#${String(pokemonId).padStart(3, '0')}</p>
            <div class="pokemon-types">${typesHTML}</div>
        </div>
    `;
}

/**
 * Creates the HTML string for the large Pokémon map in the overlay.
 * Expects a pre-formatted Pokémon details object.
 * @param {Object} pokemonDetails - A formatted Pokémon details object (from api.js).
 * @returns {string} - The HTML string of the large map.
 */
export function createLargePokemonCardHTML(pokemonDetails) {
    const pokemonName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    const pokemonId = String(pokemonDetails.id).padStart(3, '0');
   // Use image URL directly from pokemonDetailsHTML.
    const imageUrl = pokemonDetails.imageUrl || 'https://via.placeholder.com/200x200.png?text=No+Image'; // Fallback-Bild für Overlay
    const typesHTML = pokemonDetails.types.map(typeName =>
        `<span class="pokemon-type" style="background-color: ${typeColors[typeName] || '#777'}">
            ${typeName.charAt(0).toUpperCase() + typeName.slice(1)}
        </span>`
    ).join('');
    const statsHTML = pokemonDetails.stats.map(statInfo => `
        <p><strong>${statInfo.name.charAt(0).toUpperCase() + statInfo.name.slice(1)}:</strong> ${statInfo.base_stat}</p>
    `).join('');
    const abilitiesHTML = pokemonDetails.abilities.map(abilityName =>
        abilityName.charAt(0).toUpperCase() + abilityName.slice(1)
    ).join(', ');
    return `
        <h2>#${pokemonId} ${pokemonName}</h2>
        <img src="${imageUrl}" alt="${pokemonName}" class="large-pokemon-image">
        <div class="large-pokemon-types">${typesHTML}</div>
        <div class="pokemon-details-stats">
            <h3>Details:</h3>
            <p><strong>Height:</strong> ${pokemonDetails.height / 10} m</p>
            <p><strong>Weight:</strong> ${pokemonDetails.weight / 10} kg</p>
            <p><strong>Abilities:</strong> ${abilitiesHTML}</p>
            <h3>Base Stats:</h3>
            ${statsHTML}
        </div>
    `;
}

/**
 * Renders a list of Pokémon cards in a specified container.
 * Uses createPokemonCardHTML to generate the HTML.
 * @param {Array<Object>} detailedPokemonList - A list of formatted Pokémon detail objects.
 * @param {HTMLElement} containerElement - The DOM element into which the maps are rendered.
 */
export function renderPokemonCards(detailedPokemonList, containerElement) {
    if (!containerElement) {
        console.error('Container element for Pokémon cards not found!');
        return;
    }
    const fragment = document.createDocumentFragment();
    detailedPokemonList.forEach(pokemonDetails => {
        if (pokemonDetails) {
            const cardHTMLString = createPokemonCardHTML(pokemonDetails);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHTMLString;
            if (tempDiv.firstElementChild) {
                fragment.appendChild(tempDiv.firstElementChild);
            }
        }
    });
    containerElement.appendChild(fragment);
}

/**
 * Renders the details of a single Pokémon in the large overlay map.
 * Uses createLargePokemonCardHTML to generate the HTML.
 * @param {Object} pokemonDetails - A formatted Pokémon detail object.
 * @param {HTMLElement} containerElement - The DOM element of the large Pokémon card.
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