<script lang="ts">
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import NavItem from "../atoms/NavItem.svelte";

  export let isOpen: boolean;

  const close = {
    data: {
      label: "Close",
    },
    design: {
      icon: faTimes,
    },
  };
</script>

<div
  on:click={() => {
    isOpen = false;
  }}>
  <NavItem mapping={close} />
</div>
