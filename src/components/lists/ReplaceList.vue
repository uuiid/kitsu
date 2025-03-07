<script setup>
import { ArrowRightLeft, CircleX } from 'lucide-vue-next'
import ReplaceListCell from '@/components/cells/ReplaceListCell.vue'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import i18n from '@/lib/i18n.js'

const filePath = ref('')
const isDragOver = ref(false)
const isAddData = ref(true)
const errorFilLists = ref(new Set())
const props = defineProps({
  bodyList: { type: Map, default: () => new Map() }
})

const emit = defineEmits(['add-data', 'delete-data', 'submit'])
const displayWorkList = computed(() => {
  return props.bodyList
})
const isShowPrompt = computed(() => {
  return props.bodyList.size <= 0
})

const checkReplaceFiles = (files, file_path) => {
  let isReplace = true
  files.forEach(file_list => {
    if (file_list[0] === file_path) {
      isReplace = false
    }
  })
  return isReplace
}

const handleDrop = (event, key, index) => {
  event.preventDefault()
  const files = event.dataTransfer.files
  const regex = /\.ma$/i
  if (files.length > 0 && regex.test(files[0].path)) {
    if (
      index !== 0 ||
      checkReplaceFiles([...displayWorkList.value.values()], files[0].path)
    ) {
      displayWorkList.value.get(key)[index] = files[0].path
      filePath.value = files[0].path // 获取文件路径
    } else {
      ElMessage.error(`${files[0].path} already exists`)
    }
  } else {
    ElMessage.error('仅支持ma文件')
  }
}
const onDrop = event => {
  if (isAddData.value) {
    event.preventDefault()
    isDragOver.value = false
    const files = event.dataTransfer.files
    emit('add-data', files)
  }
}

const handleDragOver = event => {
  if (isAddData.value) {
    event.preventDefault()
    if (!isDragOver.value) {
      isDragOver.value = true
      event.dataTransfer.dropEffect = 'copy'
    }
  }
}
const onClipboard = event => {
  if (isAddData.value) {
    event.preventDefault()
    isDragOver.value = false
    const clipboardData = event.clipboardData || window.clipboardData
    const files = clipboardData.files
    emit('add-data', files)
  }
}
const replaceIndex = key => {
  if (
    checkReplaceFiles(
      [...displayWorkList.value.values()],
      displayWorkList.value.get(key)[1]
    )
  )
    displayWorkList.value.set(key, [
      displayWorkList.value.get(key)[1],
      displayWorkList.value.get(key)[0]
    ])
  else
    ElMessage.error(
      `${displayWorkList.value.get(key)[1]} ${i18n.global.t('doodle.already_exists')}`
    )
}
const onDelete = event => {
  emit('delete-data', event)
}

const onSubmit = () => {
  const fs = require('fs')
  displayWorkList.value.forEach((value, key) => {
    if (value[0] === '' || !fs.existsSync(value[0])) {
      errorFilLists.value.add(`${key}|0`)
    } else if (value[1] === '' || !fs.existsSync(value[1])) {
      errorFilLists.value.add(`${key}|1`)
    }
  })
  if (errorFilLists.value.size === 0) emit('submit')
}
</script>

<template>
  <div
    class="replace-list"
    :class="{ placeholder: isShowPrompt }"
    @drop="onDrop"
    @dragover="handleDragOver"
    @paste="onClipboard"
  >
    <div v-if="isShowPrompt">
      {{ $t('video_library.placeholder') }}
    </div>
    <div class="replace-list-header" v-if="!isShowPrompt">
      <div class="replace-list-header-title">
        <span>old</span>
      </div>
      <div class="replace-list-header-gap"></div>
      <div class="replace-list-header-title">new</div>
    </div>
    <div class="replace-list-content" v-if="!isShowPrompt">
      <replace-list-cell :key="work[0]" v-for="work in displayWorkList">
        <template #default>
          <div class="replace-list-item-content">
            <input
              class="input"
              type="text"
              v-model="work[1][0]"
              :class="{
                'replace-list-item-error': errorFilLists.has(`${work[0]}|0`)
              }"
              @dragover.prevent
              @drop.stop="handleDrop($event, work[0], 0)"
              @dragenter="isAddData = true"
              @dragleave="isAddData = false"
              @change="errorFilLists.delete(`${work[0]}|0`)"
              placeholder="拖放文件到这里或手动输入路径"
            />
          </div>
          <arrow-right-left
            class="replace-list-item-icon"
            :size="40"
            @click="replaceIndex(work[0])"
          ></arrow-right-left>
          <div class="replace-list-item-content">
            <input
              class="input"
              :class="{
                'replace-list-item-error': errorFilLists.has(`${work[0]}|1`)
              }"
              type="text"
              v-model="work[1][1]"
              @dragover.prevent
              @drop.stop="handleDrop($event, work[0], 1)"
              @dragenter="isAddData = true"
              @dragleave="isAddData = false"
              @change="errorFilLists.delete(`${work[0]}|1`)"
              placeholder="拖放文件到这里或手动输入路径"
            />
          </div>
        </template>
        <template #hover-content>
          <circle-x :size="15" @click="onDelete(work[0])"></circle-x>
        </template>
      </replace-list-cell>
    </div>
  </div>
  <div class="has-text-right">
    <a
      :class="{
        button: true
      }"
    >
      <span @click="onSubmit">执行</span>
    </a>
  </div>
</template>

<style scoped lang="scss">
.replace-list {
  display: flex;
  flex-direction: column;
  height: 30vh;
  gap: 1em;
  border-radius: 5px;
  border: 1px solid #00b89c;
  max-height: 80%;
}

.replace-list-content {
  display: flex;
  flex-direction: column;
  gap: 1em;
  overflow: auto;
}

.replace-list-header {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 2em 3em 0 2em;
  width: 100%;

  .replace-list-header-title {
    width: 100%;
    text-align: center;
  }

  .replace-list-header-gap {
    width: 20px;
  }
}

.replace-list-item-error {
  border-color: red;
}

.replace-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 1em 0 2em;
  gap: 10px;
  width: 100%;
  border-radius: 5px;

  .replace-list-item-content {
    width: 100%;
    text-align: center;
  }

  .replace-list-item-icon {
    cursor: pointer;

    &:hover {
      color: #00b242;
    }
  }
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  width: 100%;
  color: #bdbdbd;
}
</style>
