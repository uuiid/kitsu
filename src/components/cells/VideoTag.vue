<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { X } from 'lucide-vue-next'

const selected = ref(false)
const closable = ref(false)
const visible = ref(false)
const inputValue = ref()
const inputVisible = ref(false)
const tagVisible = ref(true)
const InputRef = ref()
const emits = defineEmits(['close', 'modify', 'click'])
const props = defineProps({
  tag: {
    type: Object,
    default: null
  }
})

function onMouseEnter() {
  closable.value = true
}

function onMouseLeave() {
  closable.value = false
}

function onClose() {
  visible.value = true
}

async function handleInputConfirm() {
  inputVisible.value = false
  tagVisible.value = true
  if (props.tag.name !== InputRef.value.input.value) {
    const data = {
      id: props.tag.id,
      name: InputRef.value.input.value
    }
    emits('modify', data)
  }
}

function onClick() {
  selected.value = !selected.value
  emits('click', props.tag, selected.value)
}

async function onDblclick() {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.input.focus()
  })
}

onMounted(() => {
  console.log(props.tag)
})
</script>

<template>
  <el-tag
    :closable="false"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    :class="{
      selected: selected,
      'm-tag': !selected,
      input: inputVisible
    }"
    @click="onClick"
    @close="onClose"
    @dblclick="onDblclick"
  >
    <el-input
      v-if="inputVisible"
      ref="InputRef"
      class="input-tag"
      :value="tag.name"
      v-model="inputValue"
      size="small"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <span v-if="!inputVisible">{{ tag.name }}</span>
    <el-popconfirm
      title="确定删除吗?"
      @confirm="emits('close')"
      v-if="!inputVisible"
    >
      <template #reference>
        <i class="el-icon el-tag__close" v-if="closable">
          <x style="color: #f87c7c"></x>
        </i>
      </template>
    </el-popconfirm>
  </el-tag>
</template>

<style scoped lang="scss">
.selected {
  background: var(--background-selectable);
  color: var(--text);
  width: 80px;
  border-radius: 5px;
  position: relative;

  &:hover {
    background-color: var(--background-selectable);
    cursor: pointer;
    color: var(--text);
  }
}

.input-tag {
  position: absolute;
  top: 0;
  left: 0;
  min-height: 20px;
  background: var(--background-alt-3);
  user-select: none;
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

:deep(.el-tag__close) {
  position: absolute;
  right: 2px;
}

:deep(.is-closable) {
  position: relative;
  color: red;
}

:deep(.el-tag) {
  background-color: var(--background-tag-button);
  color: var(--text);
}
</style>
