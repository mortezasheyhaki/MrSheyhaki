<script>
  import { loadGames, saveGames } from '$lib/game';
  import GameCard from '../components/GameCard.svelte';
  
  let games = loadGames();

  function playGame(id) {
    const game = games.find(g => g.id === id);
    if (!game) return;
    
    // Replace this with your real game logic
    game.score = Math.floor(Math.random() * 80) + 20;
    game.accuracy = Math.floor(Math.random() * 15) + 85;
    game.progress = 1;
    
    const newStars = Math.min(3, Math.floor(game.score / 30));
    game.bestStars = Math.max(game.bestStars, newStars);
    game.bestScore = Math.max(game.bestScore, game.score);
    game.bestAccuracy = Math.max(game.bestAccuracy, game.accuracy);
    
    games = [...games];
    saveGames(games);
  }
</script>

<h1>Games</h1>
<div class="cards-grid">
  {#each games as game}
    <GameCard {game} on:click={() => playGame(game.id)} />
  {/each}
</div>

<style>
  .cards-grid {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    padding: 20px;
  }
</style>