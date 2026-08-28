<script>
  export let bestStars = 0;
  export let size = 'md';
  $: stars = Math.max(0, Math.min(3, Number(bestStars) || 0));
</script>

<div class="state-display" class:small={size === 'sm'} aria-label={`Best score: ${stars} of 3 stars`}>
  <span class="label">{stars === 0 ? 'Never played' : `Best ${stars}`}</span>
  <span class="stars" aria-hidden="true">
    {#each [0, 1, 2] as index}
      <span class:filled={index < stars}>{index < stars ? '★' : '☆'}</span>
    {/each}
  </span>
</div>

<style>
  .state-display {
    font-family: monospace;
    font-size: 13px;
    color: #666;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .small { font-size: 11px; }
  .label { opacity: 0.75; }
  .stars { letter-spacing: 1px; color: #9ca3af; }
  .filled { color: #f5c542; }
</style>
