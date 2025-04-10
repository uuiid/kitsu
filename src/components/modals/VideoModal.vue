<script setup>
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { ref, onMounted, watch } from 'vue'

const doodleWork = doodleWorkStore()
defineProps({})

const videoSrc = ref('')
onMounted(() => {
  videoSrc.value = `src/assets/video/${doodleWork.state.DemonstrateVideoName}.mp4`
  console.log(videoSrc.value)
})

watch(
  doodleWork.state.isShowDemonstrateVideo,
  () => {
    //.value = `@/assets/video/${doodleWork.state.DemonstrateVideoName}.mp4`
    console.log(videoSrc.value)
  },
  { deep: true }
)
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': doodleWork.state.isShowDemonstrateVideo
    }"
  >
    <div
      class="modal-background"
      @click="doodleWork.state.isShowDemonstrateVideo = false"
    ></div>
    <div>
      <div class="modal-content">
        <div class="box">
          <video style="width: 100%" :src="videoSrc" controls autoplay></video>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-content {
  height: 100%;
  width: 80%;
  padding: 0;
  overflow: hidden;
}

.box {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}
</style>
