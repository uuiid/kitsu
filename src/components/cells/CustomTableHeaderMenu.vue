<script setup>
import { ref, onMounted } from 'vue'

const menuRef = ref()
onMounted(() => {
  menuRef.value.focus()
})
defineExpose({
  focus() {
    menuRef.value?.focus()
  }
})
</script>

<template>
  <div class="header-menu" ref="menuRef" tabindex="0" @focus="console.log(555)">
    <slot name="list"></slot>
  </div>
</template>

<style scoped lang="scss">
.dark .header-menu {
  background-color: $dark-grey-light;
  box-shadow: 0 2px 6px $dark-grey-light;
}

.header-menu {
  position: absolute;
  background: white;
  color: var(--color);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 0 2px 6px $light-grey;
  top: 25px;
  left: -10px;
  z-index: 100;
}

.header-menu div {
  cursor: pointer;
}

.header-menu div {
  padding: 0.5em;
}
</style>
