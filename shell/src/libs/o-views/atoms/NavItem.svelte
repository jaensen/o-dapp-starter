<script lang="ts">
  import Icon from "fa-svelte";

  export let mapping: any;
</script>

<div
  class="flex items-center justify-center w-16 px-2 text-center hover:text-secondary-lighter">
  <span>
    {#if mapping.design.icon}
      <Icon icon={mapping.design.icon} class="text-2xl" />
    {/if}
    <p class="lowercase text-xxs md:text-xs">{mapping.data.label}</p></span>
</div>
