<script setup>
import { ref, watchEffect, onMounted, nextTick, watch } from 'vue'
import assets from '@/store/modules/assets.js'
import { assetFilterStore } from '@/store/modules/assetfilter.js'

const treeRef = ref()
// const filter = ref(['ji_shu:22'])
// const initialLoading = ref()
const defaultProps = {
  children: 'children',
  label: 'label'
}
const assetFilter = assetFilterStore()

// const intervalId = setInterval(() => {
//   if (assets.cache.assets.length > 0) {
//     initialLoading.value = assets.cache.assets.length
//     //treeRef.value.setCheckedKeys(['ji_shu'], false)
//   }
// }, 1000)
//
// const initAssets = () => {}
const myElement = ref(null)
const extendWidth = ref({
  maxWidth: 340,
  width: 240,
  startWidth: 0,
  isStartHandle: false
})
//
// const filterAsset = () => {
//   const temp = new Map()
//   const keys = [...assetFilter.state.assetFilters.keys()]
//   const filteredAsset = assetFilter.state.oldDisplayedAssetsByType.filter(
//     asset => {
//       if (asset !== {}) {
//         let value = false
//         for (let i = 0; i < assetFilter.state.assetFilters.size; i++) {
//           const item = assetFilter.state.assetFilters.get(keys[i])
//           const key = keys[i]
//           let filter_value = false
//           if (i === 0) {
//             filter_value = true
//           } else {
//             const last_item = assetFilter.state.assetFilters.get(keys[i - 1])
//             const last_key = keys[i - 1]
//             if (last_item.values.includes(asset[last_item.parent][last_key])) {
//               filter_value = true
//             }
//           }
//           if (item.values.includes(asset[item.parent][key])) {
//             value = true
//           }
//           if (filter_value) {
//             const ch = {
//               id: '',
//               label: '',
//               num: 1,
//               parent: key
//             }
//             if (item.parent === 'data') {
//               ch.id = `${key}:${asset.data[key]}`
//               ch.label = asset.data[key]
//             } else {
//               ch.id = `${key}:${asset[key]}`
//               ch.label = asset[key]
//             }
//             if (temp.has(item.id)) {
//               temp.get(item.id).num += 1
//               console.log(ch.id)
//               if (ch.id === `${key}:undefined` || ch.id === '${key}:') {
//                 ch.id = `${key}:undefined`
//                 ch.label = '其他'
//               }
//               const children = temp
//                 .get(item.id)
//                 .children.filter(i => i.id === ch.id)
//               if (children.length === 0) {
//                 temp.get(item.id).children.push(ch)
//                 temp.get(item.id).children.sort((a, b) => {
//                   return String(a.label).localeCompare(String(b.label))
//                 })
//               } else {
//                 children[0].num += 1
//               }
//             } else {
//               temp.set(item.id, {
//                 id: item.id,
//                 label: item.id,
//                 num: 1,
//                 children: [ch]
//               })
//             }
//           }
//         }
//         return value
//       }
//     }
//   )
// }
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

const onCheckChange = (o, n, s) => {
  //console.log(o, n, s)
  // const id_split = o.id.split(':')
  // if (s) {
  //
  //   assetFilter.state.assetFilter.get(id_split[0]).values.push(id_split[0][1])
  // } else {
  //
  //   assetFilter.state.assetFilter.get(id_split[0]).values.pop(id_split[0][1])
  // }
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

watch(assets.state.displayedAssets, () => {
  console.log(assets.state.displayedAssets)
})
watch(
  () => assetFilter.state.oldDisplayedAssetsByType,
  () => {
    //filterAsset()
    console.log(assetFilter.state.oldDisplayedAssetsByType)
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
        :default-checked-keys="['ji_shu:0', 'ji_shu:22']"
        @check-change="onCheckChange"
        node-key="id"
        default-expand-all
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
