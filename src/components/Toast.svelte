<script>
  import { toastMessage } from '../stores/marketplaceStore';
  import Icon from './Icon.svelte';
</script>

{#if $toastMessage}
  <div class="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in shadow-xl rounded-xl border p-4 bg-white transition-all transform flex items-start gap-3 {$toastMessage.type === 'success' ? 'border-emerald-200 text-slate-800' : 'border-blue-200 text-slate-800'}">
    <div class="p-1 rounded-lg {$toastMessage.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}">
      <Icon name={$toastMessage.type === 'success' ? 'check-circle' : 'alert-circle'} size={18} />
    </div>
    <div class="flex-1 text-sm font-medium leading-snug">
      {$toastMessage.message}
    </div>
    <button
      on:click={() => toastMessage.set(null)}
      class="text-slate-400 hover:text-slate-600 transition"
    >
      <Icon name="x" size={16} />
    </button>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
  }
</style>
