// js/ui.js

// Exportiere typeColors, damit es von anderen Modulen importiert werden kann
export const typeColors = { // <-- HIER IST DIE ÄNDERUNG: 'export' hinzugefügt
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
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

export function createPokemonCardHTML(pokemonDetails) {
    const pokemonName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    const pokemonId = pokemonDetails.id;
    const imageUrl = pokemonDetails.sprites.other?.['official-artwork']?.front_default || pokemonDetails.sprites.front_default || 'placeholder.png';

    const typesHTML = pokemonDetails.types.map(typeInfo =>
        `<span class="pokemon-type" style="background-color: ${typeColors[typeInfo.type.name] || '#777'}">
            ${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
        </span>`
    ).join('');

    const primaryType = pokemonDetails.types[0].type.name;
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

export function createLargePokemonCardHTML(pokemonDetails) {
    const pokemonName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    const pokemonId = String(pokemonDetails.id).padStart(3, '0');
    const imageUrl = pokemonDetails.sprites.other?.['official-artwork']?.front_default || pokemonDetails.sprites.front_default || 'placeholder.png';

    const typesHTML = pokemonDetails.types.map(typeInfo =>
        `<span class="pokemon-type" style="background-color: ${typeColors[typeInfo.type.name] || '#777'}">
            ${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
        </span>`
    ).join('');

    const primaryType = pokemonDetails.types[0].type.name;
    // Hier wird die Hintergrundfarbe nicht direkt gesetzt, da dies in overlayManager.js passiert.
    // largePokemonCard.style.backgroundColor = typeColors[primaryType] || '#EEE';

    const statsHTML = pokemonDetails.stats.map(statInfo => `
        <p><strong>${statInfo.stat.name.toUpperCase()}:</strong> ${statInfo.base_stat}</p>
    `).join('');

    return `
        <h2>${pokemonName} #${pokemonId}</h2>
        <img src="${imageUrl}" alt="${pokemonName}" class="large-pokemon-image">
        <div class="large-pokemon-types">${typesHTML}</div>
        <div class="pokemon-details-stats">
            <h3>Base Stats:</h3>
            ${statsHTML}
        </div>
        <p><strong>Height:</strong> ${pokemonDetails.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemonDetails.weight / 10} kg</p>
    `;
}

export function renderPokemonCards(detailedPokemonList, containerElement) {
    if (!containerElement) {
        console.error('Container element for Pokémon cards not found!');
        return;
    }
    detailedPokemonList.forEach(pokemonDetails => {
        if (pokemonDetails) {
            const cardHTML = createPokemonCardHTML(pokemonDetails);
            containerElement.innerHTML += cardHTML;
        }
    });
}