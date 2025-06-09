import * as API from './api.js'; // API Modul importieren
import * as UI from './ui.js';   // UI Modul importieren

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const pokemonCardContainer = document.getElementById('pokemonCardContainer');
const loadMoreButton = document.getElementById('loadMoreButton'); // Braucht Zugriff darauf

export async function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm.length < 3) {
        alert('Please enter at least 3 characters to search.');
        return;
    }

    UI.showLoadingScreen(document.getElementById('loadingScreen'));
    pokemonCardContainer.innerHTML = ''; // Leere den aktuellen Container für die Suchergebnisse
    // currentOffset = 0; // Beim Suchen setzen wir den Offset oft zurück, um nur Suchergebnisse anzuzeigen

    if (loadMoreButton) {
        loadMoreButton.disabled = true;
        loadMoreButton.textContent = 'Searching...';
    }

    try {
        // Versuche, das spezifische Pokémon zu finden
        const pokemonByName = await API.fetchPokemonDetails(`${API.POKE_API_BASE_URL}pokemon/${searchTerm}`);
        if (pokemonByName) {
            UI.renderPokemonCards([pokemonByName], pokemonCardContainer);
            // allLoadedPokemon müsste hier auch auf das Suchergebnis aktualisiert werden,
            // wenn das Overlay diese Daten nutzen soll. Das sollte von main.js aus verwaltet werden.
        } else {
            pokemonCardContainer.innerHTML = '<p>No Pokémon found matching your search.</p>';
        }
    } catch (error) {
        console.error('Error during search:', error);
        pokemonCardContainer.innerHTML = '<p>An error occurred during search. Please try again.</p>';
    } finally {
        UI.hideLoadingScreen(document.getElementById('loadingScreen'));
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Load more Pokémon'; // Setze Text zurück
            // Hier müsstest du entscheiden, ob loadMoreButton wieder aktiviert wird,
            // je nachdem, ob nach der Suche weitere Pokémon geladen werden können sollen.
            // loadMoreButton.disabled = false; // Oder bleibt disabled
        }
    }
}

// Event-Listener für den Such-Button
if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
}