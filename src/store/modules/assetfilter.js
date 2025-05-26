import { defineStore } from 'pinia'
import { ref } from 'vue'

function initState() {
  return {
    assetFilters: new Map(),
    filteredAssets: [],
    oldDisplayedAssetsByType: null,
    treeFilterData: []
  }
}

export const assetFilterStore = defineStore('assetFilterStore', () => {
  const state = ref(initState())
  state.value.assetFilters.set('ji_shu', {
    id: 'ji_shu',
    values: [22, 0],
    parent: 'data'
  })
  state.value.assetFilters.set('ji_shu_lie', {
    id: 'ji_shu_lie',
    values: [],
    parent: 'data'
  })
  const getters = {}
  const actions = {
    filteringAsset: (asset, temp, keys) => {
      let value = false
      if (asset !== {}) {
        for (let i = 0; i < state.value.assetFilters.size; i++) {
          const item = state.value.assetFilters.get(keys[i])
          const key = keys[i]
          let filter_value = false
          if (i === 0) {
            filter_value = true
          } else {
            const last_item = state.value.assetFilters.get(keys[i - 1])
            const last_key = keys[i - 1]
            if (last_item.values.includes(asset[last_item.parent][last_key])) {
              filter_value = true
            }
          }
          if (item.values.includes(asset[item.parent][key])) {
            value = true
          }
          if (filter_value) {
            const ch = {
              id: '',
              label: '',
              num: 1,
              parent: key
            }
            if (item.parent === 'data') {
              ch.id = `${key}:${asset.data[key]}`
              ch.label = asset.data[key]
            } else {
              ch.id = `${key}:${asset[key]}`
              ch.label = asset[key]
            }
            if (temp.has(item.id)) {
              temp.get(item.id).num += 1
              if (ch.id === `${key}:undefined` || ch.id === '${key}:') {
                ch.id = `${key}:undefined`
                ch.label = '其他'
              }
              const children = temp
                .get(item.id)
                .children.filter(i => i.id === ch.id)
              if (children.length === 0) {
                temp.get(item.id).children.push(ch)
                temp.get(item.id).children.sort((a, b) => {
                  return String(a.label).localeCompare(String(b.label))
                })
              } else {
                children[0].num += 1
              }
            } else {
              temp.set(item.id, {
                id: item.id,
                label: item.id,
                num: 1,
                children: [ch]
              })
            }
          }
        }
      }
      return value
    },
    filteringAssets: assets => {
      const temp = new Map()
      const keys = [...state.value.assetFilters.keys()]
      const result = assets.filter(asset => {
        return actions.filteringAsset(asset, temp, keys)
      })
      state.value.treeFilterData = [...temp.values()]
      console.log(state.value.treeFilterData)
      return result
    }
  }
  return { state, getters, actions }
})
