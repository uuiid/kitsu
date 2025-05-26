<script setup>
import { ref, watchEffect, onMounted, nextTick, watch } from 'vue'
import { assetFilterStore } from '@/store/modules/assetfilter.js'

const treeRef = ref()
const defaultProps = {
  children: 'children',
  label: 'label'
}
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
    const rect = myElement.value.getBoundingClientRect()
    selfPosition.value = rect.x
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

watchEffect(() => {
  if (extendWidth.value.isStartHandle) {
    addEvents()
  } else {
    removeEvents()
  }
})

watch(
  () => assetFilter.state.filters,
  () => {
    treeRef.value.setCheckedKeys(assetFilter.state.filters, false)
  },
  { deep: true }
)
</script>

<template>
  <div
    class="bottom-wrapper"
    ref="myElement"
    :style="`min-width: ${extendWidth.width}px;max-width: ${extendWidth.width}px`"
  >
    <div class="update-file-boxes">
      <el-tree
        ref="treeRef"
        style="max-width: 600px"
        class="filter-tree"
        :data="assetFilter.state.treeFilterData"
        :props="defaultProps"
        :show-checkbox="true"
        :check-on-click-node="true"
        :expand-on-click-node="false"
        @check="onCheck"
        @check-change="onCheckChange"
        node-key="id"
        :default-expanded-keys="[...assetFilter.state.expanded_keys.values()]"
        @node-expand="data => assetFilter.state.expanded_keys.add(data.id)"
        @node-collapse="
          data => {
            if (assetFilter.state.expanded_keys.has(data.id))
              assetFilter.state.expanded_keys.delete(data.id)
          }
        "
      >
        <template #default="{ node }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>{{ node.data.num }}</span>
          </span>
        </template>
      </el-tree>
    </div>
    <div
      class="extend-bar"
      @mousedown.prevent="onExtendDown"
      @touchstart.prevent="onExtendDown"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.bottom-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
  margin-right: 10px;
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
  overflow: auto;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
