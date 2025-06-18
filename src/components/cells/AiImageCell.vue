<template>
  <img
    class="ai-image-preview"
    :src="srcList?.[srcIndex]"
    @click="isShow = true"
    alt=""
  />
  <el-image-viewer
    :url-list="srcList"
    :initial-index="srcIndex"
    v-if="isShow"
    @close="isShow = false"
    teleported
  >
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
  </el-image-viewer>
</template>

<script setup>
import {
  Back,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Right,
  ZoomIn,
  ZoomOut
} from '@element-plus/icons-vue'
import { ArrowDownToLine } from 'lucide-vue-next'
import { ElImageViewer } from 'element-plus'
import { ref } from 'vue'

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
const isShow = ref(false)

const download = async index => {
  const url = props.srcList[index]
  if (!url) return
  const response = await fetch(url)
  const contentLength = +response.headers.get('Content-Length')
  const reader = response.body.getReader()
  let receivedLength = 0
  const chunks = []
  const temp = 1

  while (temp === 1) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    receivedLength += value.length
    console.log(`进度: ${((receivedLength / contentLength) * 100).toFixed(1)}%`)
  }

  // 合并所有分块
  const blob = new Blob(chunks)
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download =
    Date.now().toString() +
    '.' +
    response.headers.get('content-type').split('/')[1]
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(blobUrl)
  link.remove()
}
</script>
<style scoped>
.ai-image-preview {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  cursor: pointer;
}
</style>
