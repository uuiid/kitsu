<script setup>
import { ref } from 'vue'

defineProps(['headerName'])
const isDrop = ref(false)
const isActive = ref(false)
const isShowPlaceholder = ref(false)

const allFiles = ref([])
const handleData = files => {
  allFiles.value = [...allFiles.value, ...files]
}
const handleDragEnter = async event => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
  isDrop.value = true
}
const handleDragLeave = async event => {
  event.preventDefault()
  isDrop.value = false
}
const handleDragOver = async event => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
  isDrop.value = true
}
const handleDrop = async event => {
  event.preventDefault()
  if (isDrop.value) {
    const files = event.dataTransfer.files
    handleData(files)
  }
  isDrop.value = false
}
const handleFocus = () => {
  isActive.value = true
}
const handleBlur = () => {
  isActive.value = false
}
</script>

<template>
  <div
    class="update-file-box"
    :class="{ 'update-file-box-enter': isDrop }"
    tabindex="0"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <div class="update-file-box-header">{{ headerName }}</div>
    <span class="placeholder" v-if="isShowPlaceholder && !assetToEdit">{{
      $t('video_library.placeholder')
    }}</span>
    <div class="file-list-box">
      <ul class="list">
        <li v-for="(item, index) in allFiles" :key="index">
          <div :class="{ selectedItem: item.isSelected }">
            {{ item.name }}
          </div>
        </li>
      </ul>
    </div>
    <div class="box-bottom"></div>
  </div>
</template>

<style scoped lang="scss">
.update-file-box {
  display: flex;
  flex-direction: column;
  width: 240px;
  gap: 5px;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 5px;

  ul {
    margin: 0;
  }

  li {
    list-style-type: none;
    margin: 0;
  }
}

.update-file-box-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.file-list-box {
  flex: 1;
  max-height: 80%;
  overflow-y: auto;
}

.list {
  height: 100%;
  overflow: auto;
  border-radius: 5px;
}

.update-file-box-enter {
  border: 1px solid rgba(65, 144, 248, 0.76);
}

.dark {
  .update-file-box {
    color: white;
  }

  .update-file-box {
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .update-file-box-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }
}

.box-bottom {
  max-height: 20px;
}
</style>
