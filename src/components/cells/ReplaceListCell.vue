<template>
  <div>
    <!-- 父组件 -->
    <div
      class="replace-list-item"
      @mouseenter="startShow"
      @mouseleave="hideChild"
    >
      <slot name="default"></slot>
      <!-- 子组件 -->
      <div style="min-width: 15px">
        <div v-if="showChild" class="error replace-list-item-icon">
          <slot name="hover-content" class="error"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showChild = ref(false)
let timeoutId = null

const startShow = () => {
  timeoutId = setTimeout(() => {
    showChild.value = true
  }, 300) // 延迟 300ms 显示
}

const hideChild = () => {
  clearTimeout(timeoutId)
  showChild.value = false
}
</script>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.replace-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 1em 0 2em;
  gap: 10px;
  width: 100%;
  border-radius: 5px;
}
.replace-list-item-icon {
  cursor: pointer;
}
</style>
