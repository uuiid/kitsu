<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AiImageAction from '@/components/cells/AiImageAction.vue'

const previewSrc = ref('')
const isDrop = ref(false)
const fileInput = ref()
const imageCellRef = ref()
const isShowActon = ref(false)
const size = {
  width: 0,
  height: 0
}
const openFilePicker = () => {
  fileInput.value.click()
}

function updateDocumentSize() {
  console.log(imageCellRef.value.clientWidth)
  size.width = imageCellRef.value.clientWidth
  size.height = imageCellRef.value.clientHeight
}

onMounted(() => {
  window.addEventListener('resize', updateDocumentSize)
  size.width = imageCellRef.value.clientWidth
  size.height = imageCellRef.value.clientHeight
})
onUnmounted(() => {
  window.removeEventListener('resize', updateDocumentSize)
})
const handleDragOver = async event => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
  isDrop.value = true
}
const handleDrop = async event => {
  event.preventDefault()
  if (isDrop.value) {
    const files = event.dataTransfer.files
    await handleData(files)
  }
  isDrop.value = false
}

const handleFileChange = event => {
  const files = event.target.files
  handleData(files)
  // 处理文件...
}

async function handleData(files) {
  const file = files[0]
  if (file.type.startsWith('image/')) {
    try {
      previewSrc.value = await readFileAsBase64(file)
      isShowActon.value = false
    } catch (e) {
      console.error(e)
    }
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(reader.result)
    }

    reader.onerror = () => {
      reject(reader.error)
    }

    reader.readAsDataURL(file)
  })
}

defineExpose({
  previewSrc
})
</script>

<template>
  <div
    ref="imageCellRef"
    class="image-cell"
    @drag="handleDrop"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @click="openFilePicker"
    @mouseenter="previewSrc !== '' ? (isShowActon = true) : false"
    @mouseleave="isShowActon = false"
  >
    <ai-image-action
      v-if="isShowActon && previewSrc !== ''"
      @remove="previewSrc = ''"
      :style="`position: absolute;width:${size.width}px;height:${size.height}px;background: rgba(0, 0, 0, 0.49);border-radius: 5px;`"
    ></ai-image-action>
    <img
      class="auto-resize"
      style="width: auto; height: auto"
      alt=""
      :src="previewSrc"
    />
    <div>
      <span v-if="previewSrc === ''">拖入或点击</span>
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        accept="image/*"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 150px;
  min-height: 150px;
  width: 100%;
  border: 1px solid rgba(255, 0, 0, 0.42);
  border-radius: 5px;
  background: var(--background-alt-3);
  user-select: none;
  cursor: pointer;
  color: rgba(204, 203, 203, 0.42);
}

.auto-resize {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}
</style>
