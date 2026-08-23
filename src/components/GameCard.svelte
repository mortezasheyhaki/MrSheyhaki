<script>
  import StateDisplay from './StateDisplay.svelte';
  export let game;
</script>

<div class="card">
  <div class="card-header">
    <!-- Icon -->
    <div class="icon">
      {#if game.type === 'BE'}
        <span class="emoji">🌍</span>
      {:else if game.type === 'MR'}
        <span class="emoji">⌚</span>
      {:else}
        <span class="emoji">❓</span>
      {/if}
    </div>
    
    <!-- Title -->
    <h2>{game.title}</h2>
  </div>

  <p class="description">{game.description || game.details}</p>

  <!-- Progress -->
  <div class="info-bar">
    <span class="progress">{Math.round(game.progress * 100)}%</span>
    <span class="status">Ready to play</span>
  </div>

  <!-- StateDisplay right next to PLAY (exactly as you wanted) -->
  <div class="play-area">
    <button class="play-btn">PLAY</button>
    <StateDisplay bestStars={game.bestStars} size="sm" />
  </div>
</div>

<style>
  .card {
    width: 280px;
    background: linear-gradient(#f0f9f4, #e6f5f0);
    border: 2px solid #a3e8d6;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    padding: 18px;
  }
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .icon {
    width: 36px;
    height: 36px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
  h2 {
    margin: 0;
    font-size: 18px;
    color: #1f2937;
  }
  .description {
    font-size: 13px;
    line-height: 1.4;
    color: #4b5563;
    margin-bottom: 12px;
    min-height: 60px;
  }
  .info-bar {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 12px;
  }
  .play-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 8px 12px;
    border-radius: 12px;
  }
  .play-btn {
    background: #10b981;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }
  .small { font-size: 12px; color: #64748b; }
  .muted { opacity: 0.7; }
  .best-1 { color: #f59e0b; }
  .best-2 { color: #eab308; }
  .best-3 { color: #f97316; }
</style>