<script setup>
import { ref, watch, onMounted } from 'vue'
import { ModelLibraryStore } from '@/store/modules/modellibrary.js'

const props = defineProps({
  inputTags: {
    type: Array,
    default: null
  }
})
const tags = ref()
const options = ref([])
let isInitail = false
const modelLibrary = ModelLibraryStore()

async function handleInputConfirm() {
  await ModelLibraryStore().actions.handleInputConfirm(
    tags.value[tags.value.length - 1],
    handleInputConfirmCallback
  )
}

defineExpose({
  tags
})
onMounted(() => {
  handleOptions()
  tags.value = props.inputTags
})

function handleInputConfirmCallback(tag) {
  if (tag) {
    options.value.push(tag)
    tags.value[tags.value.length - 1] = tag.id
  }
}

async function handleOptions() {
  options.value = await modelLibrary.actions.getAllTags()
}

watch(tags, async (newValue, oldValue) => {
  if (newValue?.length > oldValue?.length && isInitail) {
    await handleOptions()
    if (
      options.value.filter(option => {
        return option.id === newValue[newValue.length - 1]
      }).length === 0
    ) {
      if (isInitail) await handleInputConfirm()
    }
  }
  isInitail = true
})
watch(
  () => props.inputTags,
  () => {
    isInitail = false
    tags.value = props.inputTags
  }
)
</script>

<template>
  <div class="field" style="margin-bottom: 15px">
    <label class="label">标签</label>
    <el-select
      size="large"
      v-model="tags"
      ref="tagsRef"
      multiple
      filterable
      allow-create
      default-first-option
      :reserve-keyword="false"
      placeholder=""
      @focus="handleOptions"
    >
      <el-option
        v-for="item in options"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
  </div>
</template>

<style scoped lang="scss"></style>
