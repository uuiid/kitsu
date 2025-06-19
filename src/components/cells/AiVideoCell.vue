<script setup>
import { ref, computed } from 'vue'

const videoRef = ref()
const emits = defineEmits(['on-click'])
const isShowControls = ref(false)
defineProps(['src'])
const currentTime = ref()
const videoTime = computed(() => {
  if (videoRef.value && currentTime.value) {
    return `${formatVideoTime(currentTime.value)}/${formatVideoTime(videoRef.value.duration)}`
  }
  return ''
})

function onMouseEnter() {
  if (videoRef.value) {
    videoRef.value.muted = true
    videoRef.value.play()
    isShowControls.value = true
  }
}

function onMouseLeave() {
  if (videoRef.value) {
    videoRef.value.pause()
    isShowControls.value = false
  }
}

function formatVideoTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  // 补零操作
  const pad = num => num.toString().padStart(2, '0')

  return `${h}:${pad(m)}:${pad(s)}`
}

function onClick() {
  emits('on-click')
  enterFullscreen()
}

function enterFullscreen() {
  if (videoRef.value.requestFullscreen) {
    videoRef.value.muted = false
    videoRef.value.requestFullscreen()
  } else if (videoRef.value.webkitRequestFullscreen) {
    videoRef.value.webkitRequestFullscreen()
  }
}
</script>

<template>
  <div class="video-preview" @click="onClick">
    <video
      ref="videoRef"
      class="auto-resize"
      muted
      loop
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @timeupdate="currentTime = videoRef.currentTime"
      :src="src"
    ></video>
    <span class="video-time" v-if="isShowControls">{{ videoTime }}</span>
  </div>
</template>

<style scoped lang="scss">
.auto-resize {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.video-time {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.5em;
}

.video-preview {
  position: relative;
}
</style>
