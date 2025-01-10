<script setup>
import { ref, watchEffect } from 'vue'
import UpdateFileBox from '@/components/widgets/UpdateFileBox.vue'

const extendHeight = ref({
  maxHeight: 340,
  height: 240,
  startHeight: 0,
  isStartHandle: false
})
const onExtendDown = event => {
  extendHeight.value.isStartHandle = true
  extendHeight.value.startHeight = event.clientY
}

const onExtendUp = event => {
  extendHeight.value.isStartHandle = false
  extendHeight.value.startHeight = event.clientY
}

const onExtendMove = event => {
  if (extendHeight.value.isStartHandle) {
    extendHeight.value.height =
      extendHeight.value.height + extendHeight.value.startHeight - event.clientY
    extendHeight.value.startHeight = event.clientY
    console.log(extendHeight.value.maxHeight)
  }
}

const addEvents = () => {
  document.addEventListener('mousemove', onExtendMove)
  document.addEventListener('mouseup', onExtendUp)
}
const removeEvents = () => {
  document.removeEventListener('mousemove', onExtendMove)
  document.removeEventListener('mouseup', onExtendUp)
}

watchEffect(() => {
  if (extendHeight.value.isStartHandle) {
    addEvents()
  } else {
    removeEvents()
  }
})
</script>

<template>
  <div
    class="bottom-wrapper"
    :style="`min-height: ${extendHeight.height}px;max-height: ${extendHeight.height}px`"
  >
    <div
      class="extend-bar"
      @mousedown.prevent="onExtendDown"
      @touchstart.prevent="onExtendDown"
    ></div>
    <div class="update-file-boxes">
      <update-file-box header-name="maya 文件" />
      <update-file-box header-name="ue 文件" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.bottom-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  //border: 1px solid red;
}

.extend-bar {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.2);
  cursor: s-resize;
}

.dark {
  .extend-bar {
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    cursor: s-resize;
  }
}
.update-file-boxes {
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 10px;
  height: 100%;
}
</style>
