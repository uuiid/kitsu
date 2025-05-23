<template>
  <div class="tags-list">
    <video-tag
      v-for="tag in dynamicTags"
      :key="tag.id"
      :disable-transitions="false"
      :tag="tag"
      @close="handleClose(tag)"
      @modify="handleModify"
      @click="onClick"
    >
    </video-tag>
    <el-input
      v-if="inputVisible"
      ref="InputRef"
      v-model="inputValue"
      class="w-20"
      size="small"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <button v-else class="m-tag w-20" @click="showInput">+ 新建标签</button>
  </div>
</template>

<script setup>
import { nextTick, ref, computed, onMounted } from 'vue'
import VideoTag from '@/components/cells/VideoTag.vue'
import { ModelLibraryStore } from '@/store/modules/modellibrary.js'

const modelLibrary = ModelLibraryStore()
const emits = defineEmits(['click'])
const inputValue = ref('')
const dynamicTags = computed(() => {
  return [...modelLibrary.state.tags.values()]
})
const inputVisible = ref(false)
const InputRef = ref('')

const handleClose = async tag => {
  await modelLibrary.actions.deleteTag(tag)
}

const handleModify = async tag => {
  modelLibrary.actions.modifyTag(tag)
}

onMounted(() => {
  //if (modelLibrary.state.tags.size === 0) modelLibrary.actions.setTags()
})

function onClick(tag, status) {
  if (status) {
    modelLibrary.state.selectedTags.set(tag.id, tag)
  } else {
    modelLibrary.state.selectedTags.delete(tag.id)
  }
  emits('click')
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.input.focus()
  })
}

const handleInputConfirm = async () => {
  if (inputValue.value) {
    await modelLibrary.actions.createTag({ name: inputValue.value })
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<style>
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.m-tag {
  width: 80px;
  border-radius: 5px;
  background-color: var(--background-tag-button);
  color: var(--text);
  position: relative;

  &:hover {
    background-color: var(--background-selectable);
    cursor: pointer;
    color: var(--text);
  }
}

.w-20 {
  max-width: 80px;
  height: 23px;
}
</style>
