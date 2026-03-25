<template>
  <div
    @mouseenter="isShowPencil = true"
    @mouseleave="isShowPencil = false"
    class="editable-label"
    :style="`width: ${width}px;height: ${height + 20}px`"
  >
    <!-- 1. 给el-input绑定ref -->
    <el-input
      ref="inputRef"
      :style="`width: ${width}px;height: ${height + 20}px`"
      v-model="modelValue"
      :type="type"
      @blur="isEditing = false"
      v-if="isEditing"
      @change="$emit('update-value', modelValue)"
    ></el-input>
    <span :style="`width: ${width - 20}px;height: ${height}px`" v-else>{{
      modelValue
    }}</span>
    <!-- 手动触发焦点（可选） -->
    <pencil-icon
      @click="setFocus"
      style="cursor: pointer"
      :size="14"
      v-if="isShowPencil && !isEditing"
    ></pencil-icon>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { PencilIcon } from 'lucide-vue-next'

const props = defineProps({
  value: { type: String || Number, default: () => '' },
  type: { type: String, default: () => 'text' },
  width: { type: Number, default: () => 150 },
  height: { type: Number, default: () => 20 }
})
const modelValue = ref('123')
onMounted(() => {
  modelValue.value = props.value
})
defineEmits(['update-value'])
// 2. 定义ref变量（名称需和模板中一致）
const inputRef = ref(null)
const isEditing = ref(false)
const isShowPencil = ref(false)

// 3. 页面挂载后自动获取焦点

// 手动触发焦点的方法
const setFocus = () => {
  isEditing.value = true
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}
</script>

<style scoped lang="scss">
.editable-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
