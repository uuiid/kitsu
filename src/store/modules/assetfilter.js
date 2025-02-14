import { defineStore } from 'pinia'
import { ref } from 'vue'

function initState() {
  return {
    assetFilters: new Map(),
    filteredAssets: [],
    oldDisplayedAssetsByType: null,
    treeFilterData: [],
    filters: []
  }
}

export const assetFilterStore = defineStore('assetFilterStore', () => {
  const state = ref(initState())
  state.value.assetFilters.set('ji_shu', {
    id: 'ji_shu',
    values: [22, 0, undefined],
    parent: 'data'
  })
  state.value.assetFilters.set('ji_shu_lie', {
    id: 'ji_shu_lie',
    values: [0],
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
          const ch = {
            id: '',
            label: '',
            num: 1,
            parent: key,
            value: ''
          }
          if (item.parent) {
            ch.id = `${key}:${asset[item.parent][key]}`
            ch.label = asset[item.parent][key]
            ch.value = asset[item.parent][key]
            if (
              asset[item.parent][key] === undefined ||
              asset[item.parent][key] === ''
            ) {
              ch.id = `${key}:undefined`
              ch.label = '其他'
              ch.value = undefined
            }
          } else {
            ch.id = `${key}:${asset[key]}`
            ch.label = asset[key]
            ch.value = asset[key]
            if (asset[key] === undefined || asset[key] === '') {
              ch.id = `${key}:undefined`
              ch.label = '其他'
              ch.value = undefined
            }
          }
          let filter_value = false
          if (i === 0) {
            filter_value = true
          } else {
            const last_item = state.value.assetFilters.get(keys[i - 1])
            const last_key = keys[i - 1]
            let asset_value = asset[last_key]
            if (last_item.parent) {
              asset_value = asset[last_item.parent][last_key]
              if (asset[key] === '') asset_value = undefined
            }
            if (last_item.values.includes(asset_value)) {
              filter_value = true
            }
          }
          if (i === state.value.assetFilters.size - 1 && filter_value) {
            value = item.values.includes(ch.value)
          }
          if (filter_value) {
            if (temp.has(item.id)) {
              temp.get(item.id).num += 1
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
                value: item.id,
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
      const temp_filters = []
      state.value.assetFilters.forEach((value, key) => {
        if (value.values.length > 0) {
          value.values.forEach(item => {
            temp_filters.push(`${key}:${item}`)
            console.log(`${key}:${item}`)
          })
        }
      })
      state.value.filters = temp_filters
      return result
    }
  }
  return { state, getters, actions }
})
