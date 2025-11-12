import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/lib/i18n.js'
import people from '@/store/modules/people.js'
import tasks from '@/store/modules/tasks.js'
import departments from '@/store/modules/departments.js'
import tasksStore from '@/store/modules/tasks.js'

function initState() {
  return {
    assetFilters: new Map(),
    filteredAssets: [],
    oldDisplayedAssetsByType: null,
    treeFilterData: [],
    filters: [],
    sFilters: [],
    expandedKeys: new Set(),
    filteredShots: [],
    shotFilters: new Map(),
    shotExpandedKeys: new Set(),
    shotTreeFilterData: []
  }
}

export const assetFilterStore = defineStore('assetFilterStore', () => {
  const state = ref(initState())
  state.value.assetFilters.set('asset_type_name', {
    id: 'asset_type_name',
    values: [],
    isChecked: true
  })
  state.value.assetFilters.set('ji_du', {
    id: 'ji_du',
    values: [],
    parent: null,
    isChecked: true
  })
  state.value.assetFilters.set('ji_shu_lie', {
    id: 'ji_shu_lie',
    values: [],
    parent: null,
    isChecked: true
  })
  state.value.assetFilters.set('chang_ci', {
    id: 'chang_ci',
    values: [],
    parent: null,
    isChecked: true
  })
  state.value.assetFilters.set('task_status_id', {
    id: 'task_status_id',
    values: [],
    parent: 'tasks',
    isChecked: true
  })
  state.value.assetFilters.set('assignees', {
    id: 'assignees',
    values: [],
    parent: 'tasks',
    isChecked: true
  })
  state.value.shotFilters.set('sequence_name', {
    id: 'sequence_name',
    values: [],
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
          if (item.parent !== 'tasks') {
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
              //"4ffc748e-4e58-4336-ba83-51910253514e" task_type_id
              if (key === 'ji_shu_lie') {
                actions.addTreeFilterItem(temp, ch, item, asset)
              } else actions.addTreeFilterItem(temp, ch, item)
            }
          } else {
            let has = false
            if (asset.tasks.length === 0) {
              const ch = {
                id: `${key}:undefined`,
                label: '其他',
                num: 1,
                parent: key,
                value: undefined
              }
              const filter_value = actions.filterTree(key, asset, i, keys)
              if (filter_value) {
                actions.addTreeFilterItem(temp, ch, item)
              }
              if (
                i === state.value.assetFilters.size - 1 &&
                filter_value &&
                !has
              ) {
                if (item.isChecked) has = true
                else if (item.values.includes(ch.value)) has = true
              }
            } else {
              for (const task_id of asset.tasks) {
                const task = tasks.state.taskMap.get(task_id)
                if (item.id === 'assignees') {
                  if (task.assignees.length === 0) {
                    const ch = {
                      id: `${key}:undefined`,
                      label: '其他',
                      num: 1,
                      parent: key,
                      value: undefined
                    }
                    const filter_value = actions.filterTree(key, asset, i, keys)
                    if (filter_value) actions.addTreeFilterItem(temp, ch, item)
                    if (
                      i === state.value.assetFilters.size - 1 &&
                      filter_value &&
                      !has
                    ) {
                      if (item.isChecked) has = true
                      else if (item.values.includes(ch.value)) has = true
                    } else {
                      if (
                        item.values.length === 0 &&
                        i === state.value.assetFilters.size - 1
                      ) {
                        const last_item = state.value.assetFilters.get(
                          keys[i - 1]
                        )
                        if (last_item.values.includes(task[last_item.id])) {
                          has = true
                          break
                        }
                      }
                    }
                  } else {
                    for (const assignee of task.assignees) {
                      const ch = {
                        id: `${key}:${assignee}`,
                        label: '',
                        num: 1,
                        parent: 'assignees',
                        value: assignee
                      }
                      ch.label = people.getters
                        .personMap()
                        .get(assignee).first_name
                      const filter_value = actions.filterTree(
                        key,
                        asset,
                        i,
                        keys,
                        task
                      )
                      if (filter_value) {
                        actions.addTreeFilterItem(temp, ch, item)
                      }

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
                } else if (item.id === 'task_status_id') {
                  const ch = {
                    id: `${key}:${task.task_status_id}`,
                    label: task.task_status_short_name,
                    num: 1,
                    parent: 'task_status_id',
                    value: task.task_status_id
                  }
                  const filter_value = actions.filterTree(
                    key,
                    asset,
                    i,
                    keys,
                    task
                  )
                  if (filter_value) {
                    actions.addTreeFilterItem(temp, ch, item)
                  }

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
    filterTaskStatus: task => {},
    filterTree: (
      key,
      asset,
      i,
      keys,
      task = null,
      filters = state.value.assetFilters
    ) => {
      let filter_value = false
      for (let j = 0; j < i; j++) {
        const last_item = filters.get(keys[j])
        const last_key = keys[j]
        let asset_value = asset[last_key]
        if (last_item.parent) {
          if (last_item.parent === 'tasks') {
            if (task) {
              if (task[last_key]) {
                asset_value = task[last_key]
              } else {
                asset_value = undefined
              }
            }
          } else {
            asset_value = asset[last_item.parent][last_key]
            if (asset[key] === '') asset_value = undefined
          }
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
      return filter_value
    },
    resetFilter: () => {
      state.value.filters = []
      state.value.assetFilters.forEach(f => {
        f.isChecked = true
        f.values = []
      })
      //state.value.filteredAssets = []
      //state.value.oldDisplayedAssetsByType = null
      //state.value.treeFilterData = []
      state.value.sFilters = []
      state.value.expandedKeys = new Set()
      state.value.filteredShots = []
      state.value.shotFilters.forEach(f => {
        f.isChecked = true
        f.values = []
      })
      state.value.shotExpandedKeys = new Set()
      //state.value.shotTreeFilterData = []
    },
    addTreeAssigneesGroup: assignees => {
      const temp = new Map()
      assignees.children.forEach(child => {
        if (child.value !== undefined) {
          const person = people.getters.personMap().get(child.value)
          if (person) {
            if (temp.has(person.departments[0])) {
              temp.get(person.departments[0]).num += child.num
              temp.get(person.departments[0]).children.push(child)
            } else {
              temp.set(person.departments[0], {
                id: person.departments[0],
                label:
                  departments.getters.departmentMap().get(person.departments[0])
                    ?.name || '未知部门',
                num: child.num,
                value: person.departments[0],
                children: [child],
                parent: 'assignees',
                group: true
              })
            }
          }
        }
      })
      return [...temp.values()] //temp
    },
    addTreeFilterItem: (temp, ch, item, asset = null) => {
      if (temp.has(item.id)) {
        temp.get(item.id).num += 1
        let children = null
        temp.get(item.id).children.forEach(child => {
          if (child.id === ch.id) {
            children = child
          }
        })
        if (children === null) {
          actions.addTaskType(ch, asset)
          temp.get(item.id).children.push(ch)
          temp.get(item.id).children.sort((a, b) => {
            return String(a.label).localeCompare(String(b.label))
          })
        } else {
          actions.addTaskType(children, asset)
          children.num += 1
        }
      } else {
        actions.addTaskType(ch, asset)
        temp.set(item.id, {
          id: item.id,
          label: i18n.global.t('doodle_asset_tree.fields.' + item.id),
          num: 1,
          value: item.id,
          children: [ch]
        })
      }
    },
    addTaskType: (ch, asset) => {
      if (asset && !asset.canceled && asset.episode_id === undefined) {
        asset.tasks.forEach(task_id => {
          const task = tasksStore.state.taskMap.get(task_id)
          if (task) {
            if (
              task.task_status_id !== '4ffc748e-4e58-4336-ba83-51910253514e'
            ) {
              if (ch['task_type_ids'])
                ch['task_type_ids'].add(task.task_type_id)
              else ch['task_type_ids'] = new Set([task.task_type_id])
            }
            if (ch['all_task_type_ids'])
              ch['all_task_type_ids'].add(task.task_type_id)
            else ch['all_task_type_ids'] = new Set([task.task_type_id])
          }
        })
      }
    },
    filteringAssets: assets => {
      const temp = new Map()
      const keys = [...state.value.assetFilters.keys()]
      const result = assets.filter(asset => {
        return actions.filteringAsset(asset, temp, keys)
      })
      if (temp.has('assignees'))
        temp.get('assignees').children = [
          ...actions.addTreeAssigneesGroup(temp.get('assignees')),
          ...temp.get('assignees').children.filter(child => {
            return child.value === undefined
          })
        ]

      state.value.treeFilterData = [...temp.values()]
      state.value.treeFilterData[1]?.children.sort((a, b) => {
        return a.label - b.label
      })
      state.value.treeFilterData[2]?.children.sort((a, b) => {
        return a.label - b.label
      })
      state.value.treeFilterData[3]?.children.sort((a, b) => {
        return a.label - b.label
      })
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
    },
    filteringShot: (shot, temp, keys) => {
      let value = false
      if (shot !== {}) {
        for (let i = 0; i < state.value.shotFilters.size; i++) {
          const key = keys[i]
          const item = state.value.shotFilters.get(key)
          const ch = {
            id: '',
            label: '',
            num: 1,
            parent: key,
            value: ''
          }
          ch.id = `${key}:${shot[key]}`
          ch.label = shot[key]
          ch.value = shot[key]
          if (shot[key] === undefined || shot[key] === '') {
            ch.id = `${key}:undefined`
            ch.label = '其他'
            ch.value = undefined
          }
          let filter_value = false
          if (i === 0) {
            filter_value = true
          } else {
            for (let j = 0; j < i; j++) {
              const last_item = state.value.shotFilters.get(keys[j])
              const last_key = keys[j]
              let asset_value = shot[last_key]
              if (last_item.parent) {
                asset_value = shot[last_item.parent][last_key]
                if (shot[key] === '') asset_value = undefined
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

          if (i === state.value.shotFilters.size - 1 && filter_value) {
            if (item.isChecked) value = true
            else value = item.values.includes(ch.value)
          }

          if (filter_value) {
            actions.addTreeFilterItem(temp, ch, item, shot)
          }
        }
      }
      return value
    },
    filteringShots: shots => {
      if (shots.length === 0) {
        state.value.shotTreeFilterData = []
        //state.value.sFilters = []
        return []
      }
      const temp = new Map()
      const keys = [...state.value.shotFilters.keys()]
      const result = shots.filter(asset => {
        return actions.filteringShot(asset, temp, keys)
      })
      state.value.shotTreeFilterData = [...temp.values()]
      state.value.shotTreeFilterData[0]?.children.sort((a, b) => {
        return a.label - b.label
      })
      const temp_filters = []
      state.value.shotFilters.forEach((value, key) => {
        if (value.isChecked) temp_filters.push(value.id)
        if (value.values.length > 0) {
          value.values.forEach(item => {
            temp_filters.push(`${key}:${item}`)
          })
        }
      })
      state.value.sFilters = temp_filters
      return result
    }
  }
  return { state, getters, actions }
})
