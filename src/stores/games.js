import { writable } from 'svelte/store';
import { loadGames, saveGames } from '$lib/game';

export const gamesStore = writable(loadGames());

gamesStore.subscribe(value => {
  saveGames(value);
});