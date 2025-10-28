<script setup>
import { ref } from 'vue'
import AssetImageCell from '@/components/cells/AssetImageCell.vue'

const emit = defineEmits(['drag-end'])
const assetEntry = ref(null)
const isEnterShow = ref(false)
const isError = ref(false)
const dragCounter = ref(0)
const props = defineProps({
  entry: {
    type: Object,
    default: () => {}
  },
  isSource: {
    type: Boolean,
    default: false
  },
  casting: {
    type: Object,
    default: () => {}
  },
  selectedAssets: {
    type: Array,
    default: () => []
  }
})

function onDragEnd() {
  isEnterShow.value = false
  if (!isError.value) {
    assetEntry.value = props.entry
    emit('drag-end', assetEntry.value)
  }
  isError.value = false
}

function onDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

function onDragEnter(event) {
  event.preventDefault()
  dragCounter.value++
  isEnterShow.value = true
  if (props.isSource) {
    isError.value = true
    props.selectedAssets.forEach(asset => {
      if (props.casting[asset]) {
        if (
          props.casting[asset].find(entry => entry.asset_id === props.entry.id)
        ) {
          isError.value = false
        }
      }
    })
  }
}

function onDragLeave(e) {
  dragCounter.value--
  if (dragCounter.value === 0) {
    isEnterShow.value = false
    isError.value = false
  }
}
defineExpose({
  assetEntry,
  isEnterShow
})
</script>

<template>
  <div
    class="replace-asset-cell"
    :class="{
      'replace-asset-cell-success': isEnterShow,
      'replace-asset-cell-error': isError
    }"
    @drop="onDragEnd"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
  >
    <div v-if="assetEntry" class="asset">
      <asset-image-cell
        :is-show="false"
        :src="`/api/pictures/thumbnails-square/preview-files/${assetEntry.preview_file_id}.png`"
      ></asset-image-cell>
      <span class="asset-name" style="text-align: center">{{
        assetEntry.name
      }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.asset {
  border-radius: 5px;
  max-width: 95px;
  width: 95px;
  max-height: 120px;
}

.dark .asset {
  background-color: $dark-grey-lightest;
}

.replace-asset-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border: 2px dashed grey;
  border-radius: 5px;
}

.replace-asset-cell-success {
  border-color: limegreen;
}

.replace-asset-cell-error {
  border-color: red;
}

.asset-name {
  width: 100%;
  text-align: center;
}
</style>
