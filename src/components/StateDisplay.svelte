<script>
  export let bestStars = 0;
  export let size = 'md';
</script>

<div class="state-display" class:small={size === 'sm'}>
  {#if bestStars === 0}
    <span class="muted">Never played☆☆☆</span>
  {:else if bestStars === 1}
    <span class="best-1">Best 1★★☆☆</span>
  {:else if bestStars === 2}
    <span class="best-2">Best 2★★★☆</span>
  {:else if bestStars === 3}
    <span class="best-3">Best 3★★★★</span>
  {/if}
</div>

<style>
  .state-display {
    font-family: monospace;
    font-size: 13px;
    color: #666;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .small { font-size: 11px; }
  .muted { opacity: 0.6; }
  .best-1 { color: #f5d76e; }
  .best-2 { color: #f1c40f; }
  .best-3 { color: #f39c12; }
</style>