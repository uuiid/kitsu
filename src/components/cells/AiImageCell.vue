<template>
  <img
    class="ai-image-preview"
    :src="srcList?.[srcIndex].src"
    @click="onClick"
    alt=""
    style="cursor: pointer"
  />

  <!--el-image-viewer
    class="ai-image-viewer"
    :url-list="srcList"
    :initial-index="srcIndex"
    v-if="isShow"
    @close="isShow = false"
    teleported
  >
    <template #viewer>
      <div class="my-custom-content">
        <el-button type="primary" @click="onDownload">下载</el-button>
        <el-button type="success" @click="onLike">点赞</el-button>
      </div>
    </template>
    <template #toolbar="{ actions, prev, next, reset, activeIndex }">
      <el-icon @click="prev" v-if="srcList.length > 1">
        <back />
      </el-icon>
      <el-icon @click="next" v-if="srcList.length > 1">
        <right />
      </el-icon>
      <el-icon @click="actions('zoomOut')">
        <zoom-out />
      </el-icon>
      <el-icon @click="actions('zoomIn')">
        <zoom-in />
      </el-icon>
      <el-icon @click="actions('clockwise')">
        <refresh-right />
      </el-icon>
      <el-icon @click="actions('anticlockwise')">
        <refresh-left />
      </el-icon>
      <el-icon @click="reset">
        <refresh />
      </el-icon>
      <el-icon @click="download(activeIndex)">
        <arrow-down-to-line></arrow-down-to-line>
      </el-icon>
    </template>
  </el-image-viewer!-->
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  srcIndex: {
    type: Number,
    default: 0
  },
  srcList: {
    type: Array,
    default: () => []
  }
})
const emits = defineEmits(['on-click'])
const isShow = ref(false)
onMounted(() => {
  //console.log(props.srcList)
})

function onClick() {
  isShow.value = false
  emits('on-click', props.srcIndex, false)
}
</script>
<style lang="scss">
.ai-image-preview {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}
.my-custom-content {
  position: fixed;
  top: 30px;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}
</style>
