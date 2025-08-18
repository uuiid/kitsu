<script setup>
import { ref, watchEffect, onMounted, nextTick, watch } from 'vue'
import { assetFilterStore } from '@/store/modules/assetfilter.js'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const treeRef = ref()
const defaultProps = {
  children: 'children',
  label: 'label'
}
const filterText = ref('')
const currentNode = ref(null)
const isOpen = ref(true)
const assetFilter = assetFilterStore()
const emit = defineEmits(['tree-selection-changed'])
const myElement = ref(null)
const extendWidth = ref({
  maxWidth: 340,
  width: 240,
  startWidth: 0,
  isStartHandle: false
})

const selfPosition = ref(0)
const onExtendDown = event => {
  extendWidth.value.isStartHandle = true
  extendWidth.value.startWidth = event.clientX
}

const onExtendUp = event => {
  extendWidth.value.isStartHandle = false
  extendWidth.value.startWidth = event.clientX
}

const onExtendMove = event => {
  if (extendWidth.value.isStartHandle) {
    extendWidth.value.width = event.clientX - selfPosition.value + 3
    extendWidth.value.startWidth = event.clientX
  }
}

onMounted(() => {
  nextTick(() => {
    const rect = myElement.value?.getBoundingClientRect()
    selfPosition.value = rect?.x
  })
})

const onCheckChange = event => {
  //console.log('onCheckChange', event)
}
const onCheck = (o, n) => {
  let id = ''
  if (o.parent) {
    if (assetFilter.state.assetFilters.has(o.parent)) {
      id = o.parent
    }
  } else id = o.id
  const assetFilterItem = assetFilter.state.assetFilters.get(id)
  assetFilterItem.isChecked =
    n.checkedNodes.filter(node => node.id === id).length > 0
  assetFilterItem.values = []
  n.checkedNodes.forEach(node => {
    if (node.parent === id) {
      assetFilterItem.values.push(node.value)
    }
  })
  emit('tree-selection-changed')
}
const addEvents = () => {
  document.addEventListener('mousemove', onExtendMove)
  document.addEventListener('mouseup', onExtendUp)
}
const removeEvents = () => {
  document.removeEventListener('mousemove', onExtendMove)
  document.removeEventListener('mouseup', onExtendUp)
}

function onClickFilter(node, data) {
  if (node.parent.data.group) {
    treeRef.value.setChecked(node.parent.parent, false, true)
  } else {
    treeRef.value.setChecked(node.parent, false, true)
  }

  treeRef.value.setChecked(data, true)
  onCheck(data, { checkedNodes: treeRef.value.getCheckedNodes() })
}

watchEffect(() => {
  if (extendWidth.value.isStartHandle) {
    addEvents()
  } else {
    removeEvents()
  }
})
const filterNode = (value, data) => {
  if (!value) return true
  return String(data.label)?.includes(value)
}
watch(
  () => assetFilter.state.filters,
  () => {
    treeRef.value.setCheckedKeys(assetFilter.state.filters, false)
  },
  { deep: true }
)
watch(filterText, val => {
  treeRef.value?.filter(val)
})
</script>

<template>
  <div class="bottom-wrapper-main">
    <div
      class="bottom-wrapper"
      ref="myElement"
      :style="`min-width: ${isOpen ? extendWidth.width : 0}px;max-width: ${isOpen ? extendWidth.width : 0}px`"
    >
      <div class="update-file-boxes">
        <el-input v-model="filterText" class="w-60 mb-2" placeholder="名称" />
        <el-tree
          ref="treeRef"
          style="max-width: 600px; height: 100%"
          class="filter-tree"
          :data="assetFilter.state.treeFilterData"
          :props="defaultProps"
          :show-checkbox="true"
          :check-on-click-node="true"
          :expand-on-click-node="false"
          @check="onCheck"
          @check-change="onCheckChange"
          node-key="id"
          :filter-node-method="filterNode"
          @mouseleave="currentNode = null"
          :default-expanded-keys="[...assetFilter.state.expanded_keys.values()]"
          @node-expand="data => assetFilter.state.expanded_keys.add(data.id)"
          @node-collapse="
            data => {
              if (assetFilter.state.expanded_keys.has(data.id))
                assetFilter.state.expanded_keys.delete(data.id)
            }
          "
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node" @mouseenter="currentNode = node">
              <div class="tag-container">
                <span>{{ node.data.label }}</span>
                <span>({{ node.data.num }})</span>
              </div>

              <span
                class="filter-tag"
                @click.stop="onClickFilter(node, data)"
                v-if="currentNode?.data.group ? false : currentNode === node"
                >仅筛选此项</span
              >
            </div>
          </template>
        </el-tree>
      </div>
      <div
        class="extend-bar"
        @mousedown.prevent="onExtendDown"
        @touchstart.prevent="onExtendDown"
      ></div>
    </div>
    <div class="extend-button">
      <chevron-right
        class="lucide-icon"
        v-if="!isOpen"
        @click="isOpen = !isOpen"
      />
      <chevron-left
        class="lucide-icon"
        v-if="isOpen"
        @click="isOpen = !isOpen"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.bottom-wrapper-main {
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
  position: relative;
  padding-right: 14px;
}

.bottom-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
  position: relative;
  //border: 1px solid red;
}

.extend-bar {
  width: 3px;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  cursor: w-resize;
}

.dark {
  .extend-bar {
    width: 3px;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    cursor: w-resize;
  }
}

.update-file-boxes {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 10px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.extend-button {
  position: absolute;
  right: -5px;
}

.lucide-icon {
  cursor: pointer;

  &:hover {
    color: $green;
  }
}

.filter-tag {
  background: $green;
  border-radius: 3px;
  padding: 1px 0.2em;
}
</style>
