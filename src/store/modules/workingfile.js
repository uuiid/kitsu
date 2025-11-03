import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import workingfile from '@/store/api/workingfile.js'
import assets from '@/store/modules/assets.js'
function initState() {
  return {
    workingFiles: new Map(),
    tempSelectedAssets: [],
    isLoading: false,
    assetTypeMap: new Map()
  }
}

export const workingFileStore = defineStore('workingFileStore', () => {
  const state = ref(initState())
  const workingFilesMap = computed(() => {
    const temp_list = []
    for (const entity_id of state.value.workingFiles.keys()) {
      const entity = assets.state.assetMap.get(entity_id)
      if (entity) {
        const temp_entity = Object.assign({}, entity)
        temp_entity['work_files'] = actions.groupEntitiesByParents(
          state.value.workingFiles.get(entity_id),
          'task_type_id',
          true
        )
        temp_list.push(temp_entity)
      }
    }
    temp_list.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    const temp = actions.groupEntitiesByParents(
      temp_list,
      'asset_type_name',
      true
    )
    return temp || new Map()
  })
  const actions = {
    setWorkingFilesMap(WorkingFiles) {
      for (const workingFile of WorkingFiles) {
        if (state.value.workingFiles.has(workingFile.entity_id)) {
          state.value.workingFiles.get(workingFile.entity_id).push(workingFile)
        } else {
          state.value.workingFiles.set(workingFile.entity_id, [workingFile])
        }
      }
      for (const entity_id of state.value.workingFiles.keys()) {
        const entity = assets.state.assetMap.get(entity_id)
        if (entity) {
          const temp_entity = Object.assign({}, entity)
          temp_entity['work_files'] = state.value.workingFiles.get(entity_id)

          state.value.workingFiles.set(entity_id, temp_entity)
        }
      }
    },
    async getWorkingFilesFromSequence(projectId, sequenceId) {
      state.value.workingFiles.clear()
      const res = await workingfile.getWorkingFilesFromSequence(
        projectId,
        sequenceId
      )
      actions.setWorkingFilesMap(res)
    },
    groupEntitiesByParents(entities, parentNameField, isMap = false) {
      const entitiesByParents = new Map()
      for (const entity of entities) {
        const parentKey = entity[parentNameField]
        if (!entitiesByParents.has(parentKey)) {
          entitiesByParents.set(parentKey, [])
        }
        entitiesByParents.get(parentKey).push(entity)
      }

      // 如果需要数组形式的结果
      if (isMap) return entitiesByParents
      return Array.from(entitiesByParents.values())
    },

    async scanWorkingFiles(projectId) {
      state.value.isLoading = true
      const entities = [...state.value.workingFiles.keys()]
      if (entities.length === 0) return
      state.value.workingFiles.clear()
      workingfile.getWorkingFilesFromEntities(projectId, entities).then(res => {
        actions.setWorkingFilesMap(res)
        state.value.isLoading = false
      })
    }
  }

  return {
    state,
    actions,
    workingFilesMap
  }
})
