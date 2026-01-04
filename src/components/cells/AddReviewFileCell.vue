<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  isDrop: {
    type: Boolean,
    default: true
  },
  fileList: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Object,
    default: () => {}
  }
})
const isShowPrompt = computed(() => {
  return props.modelValue.name === ''
})

const emit = defineEmits(['add-data', 'update:modelValue'])
const isDragOver = ref(false)
const handleDragOver = event => {
  event.preventDefault()
  if (!isDragOver.value) {
    isDragOver.value = true
    if (props.isDrop) {
      event.dataTransfer.dropEffect = 'copy'
    } else {
      event.dataTransfer.dropEffect = 'none'
    }
  }
}

const onDrop = event => {
  event.preventDefault()
  if (props.isDrop) {
    isDragOver.value = false
    const files = event.dataTransfer.files
    console.log(files[0].path)
    emit('update:modelValue', { name: files[0].name, file: files[0] })
    emit('add-data', files)
  }
}
</script>

<template>
  <div class="datatable-main" @drop="onDrop" @dragover="handleDragOver">
    <div class="datatable-title">{{ title }}</div>
    <div class="datatable-content" :class="{ placeholder: isShowPrompt }">
      <div class="doodle-work-placeholder" v-if="isShowPrompt && isDrop">
        <div style="padding: 0 10px">
          {{ $t('video_library.placeholder') }}
        </div>
      </div>
      <div class="datatable-wrapper" v-if="!isShowPrompt">
        <div class="item">{{ modelValue.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.datatable-main {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: 1px solid #00b89c;
}
.datatable-content {
  width: 100%;
  height: 100%;
}
.datatable-wrapper {
  padding: 10px;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  width: 100%;
  color: #bdbdbd;
}
.datatable-title {
  display: flex;
  align-items: center;
  padding-left: 10px;
  height: 30px;
  border-bottom: 1px solid #00b89c;
}
.item {
  width: 100%;
}
</style>
