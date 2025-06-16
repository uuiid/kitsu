<script setup>
import { ref, onMounted } from 'vue'
// import { ModelLibraryStore } from '@/store/modules/modellibrary.js'

const props = defineProps({
  inputTags: {
    type: Array,
    default: () => []
  },
  inputOptions: {
    type: Array,
    default: null
  },
  name: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: true
  }
})
const tags = ref()
//const options = ref([])
//let isInitial = false
// const modelLibrary = ModelLibraryStore()

// async function handleInputConfirm() {
//   await ModelLibraryStore().actions.handleInputConfirm(
//     tags.value[tags.value.length - 1],
//     handleInputConfirmCallback
//   )
// }

defineExpose({
  tags
})
onMounted(() => {
  //handleOptions()
  if (props.multiple) {
    tags.value = [...props.inputTags]
  } else tags.value = props.inputTags[0]
})

// function handleInputConfirmCallback(tag) {
//   if (tag) {
//     options.value.push(tag)
//     tags.value[tags.value.length - 1] = tag.id
//   }
// }

// async function handleOptions() {
//   options.value = await modelLibrary.actions.getAllTags()
// }

// watch(tags, async (newValue, oldValue) => {
//   if (newValue?.length > oldValue?.length && isInitial) {
//     await handleOptions()
//     if (
//       options.value.filter(option => {
//         return option.id === newValue[newValue.length - 1]
//       }).length === 0
//     ) {
//       if (isInitial) await handleInputConfirm()
//     }
//   }
//   isInitial = true
// })
// watch(
//   () => props.inputTags,
//   () => {
//     //isInitial = false
//     if (props.multiple) {
//       tags.value = [...props.inputTags]
//     } else tags.value = props.inputTags[0]
//   }
// )
</script>

<template>
  <div class="field" style="margin-bottom: 15px">
    <label class="label">{{ name }}</label>
    <!--el-select
      size="large"
      v-model="tags"
      ref="tagsRef"
      multiple
      filterable
      :allow-create="inputOptions === null"
      default-first-option
      :reserve-keyword="false"
      placeholder=""
    >
      <el-option
        v-for="item in inputOptions || options"
        :key="item.id"
        :label="item.path || item.name"
        :value="item.id"
      />
    </el-select-->
    <el-tree-select
      v-model="tags"
      :multiple="multiple"
      :data="inputOptions"
      :render-after-expand="false"
      show-checkbox
      check-strictly
      check-on-click-node
      default-expand-all
      node-key="id"
      value-key="id"
      :placeholder="placeholder"
    />
  </div>
</template>

<style scoped lang="scss"></style>
