import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/lib/i18n.js'
import people from '@/store/modules/people.js'
import tasks from '@/store/modules/tasks.js'

function initState() {
  return {
    assetFilters: new Map(),
    filteredAssets: [],
    oldDisplayedAssetsByType: null,
    treeFilterData: [],
    filters: [],
    expanded_keys: new Set()
  }
}

export const assetFilterStore = defineStore('assetFilterStore', () => {
  const state = ref(initState())
  state.value.assetFilters.set('asset_type_name', {
    id: 'asset_type_name',
    values: [],
    isChecked: true
  })
  state.value.assetFilters.set('ji_shu', {
    id: 'ji_shu',
    values: [],
    parent: 'data',
    isChecked: true
  })
  state.value.assetFilters.set('ji_shu_lie', {
    id: 'ji_shu_lie',
    values: [],
    parent: 'data',
    isChecked: true
  })
  state.value.assetFilters.set('assignees', {
    id: 'assignees',
    values: [],
    parent: 'task',
    isChecked: true
  })
  const getters = {}
  const actions = {
    filteringAsset: (asset, temp, keys) => {
      let value = false
      if (asset !== {}) {
        for (let i = 0; i < state.value.assetFilters.size; i++) {
          const item = state.value.assetFilters.get(keys[i])
          const key = keys[i]
          if (item.parent !== 'task') {
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
              for (let j = 0; j < i; j++) {
                const last_item = state.value.assetFilters.get(keys[j])
                const last_key = keys[j]
                let asset_value = asset[last_key]
                if (last_item.parent) {
                  asset_value = asset[last_item.parent][last_key]
                  if (asset[key] === '') asset_value = undefined
                }
                if (last_item.isChecked) filter_value = true
                else {
                  if (last_item.values.includes(asset_value)) {
                    filter_value = true
                  } else {
                    filter_value = false
                    break
                  }
                }
              }
            }

            if (i === state.value.assetFilters.size - 1 && filter_value) {
              if (item.isChecked) value = true
              else value = item.values.includes(ch.value)
            }

            if (filter_value) {
              actions.addTreeFilterItem(temp, ch, item)
            }
          } else {
            let has = false
            for (const task_id of asset.tasks) {
              const task = tasks.state.taskMap.get(task_id)
              if (item.id === 'assignees') {
                for (const assignee of task.assignees) {
                  const ch = {
                    id: '',
                    label: '',
                    num: 1,
                    parent: key,
                    value: ''
                  }
                  ch.id = `${key}:${assignee}`
                  ch.label = people.getters.personMap().get(assignee).first_name
                  ch.value = assignee
                  ch.parent = key
                  let filter_value = false
                  for (let j = 0; j < i; j++) {
                    const last_item = state.value.assetFilters.get(keys[j])
                    const last_key = keys[j]
                    let asset_value = asset[last_key]
                    if (last_item.parent) {
                      asset_value = asset[last_item.parent][last_key]
                      if (asset[key] === '') asset_value = undefined
                    }
                    if (last_item.isChecked) filter_value = true
                    else {
                      if (last_item.values.includes(asset_value)) {
                        filter_value = true
                      } else {
                        filter_value = false
                        break
                      }
                    }
                  }
                  if (filter_value) actions.addTreeFilterItem(temp, ch, item)
                  if (
                    i === state.value.assetFilters.size - 1 &&
                    filter_value &&
                    !has
                  ) {
                    if (item.isChecked) has = true
                    else if (item.values.includes(ch.value)) has = true
                  }
                }
              }
            }
            value = has
          }
        }
      }
      return value
    },
    addTreeFilterItem: (temp, ch, item) => {
      if (temp.has(item.id)) {
        temp.get(item.id).num += 1
        let children = null
        temp.get(item.id).children.forEach(child => {
          if (child.id === ch.id) {
            children = child
          }
        })
        if (children === null) {
          temp.get(item.id).children.push(ch)
          temp.get(item.id).children.sort((a, b) => {
            return String(a.label).localeCompare(String(b.label))
          })
        } else {
          children.num += 1
        }
      } else {
        temp.set(item.id, {
          id: item.id,
          label: i18n.global.t('doodle_asset_tree.fields.' + item.id),
          num: 1,
          value: item.id,
          children: [ch]
        })
      }
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
        if (value.isChecked) temp_filters.push(value.id)
        if (value.values.length > 0) {
          value.values.forEach(item => {
            temp_filters.push(`${key}:${item}`)
          })
        }
      })
      state.value.filters = temp_filters
      return result
    }
  }
  return { state, getters, actions }
})
