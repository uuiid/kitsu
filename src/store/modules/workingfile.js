import { ref } from 'vue'
import { defineStore } from 'pinia'
import workingfile from '@/store/api/workingfile.js'
function initState() {
  return {
    workingFiles: new Map(),
    tempSelectedAssets: [],
    isLoading: false
  }
}

export const workingFileStore = defineStore('workingFileStore', () => {
  const state = ref(initState())
  const actions = {
    async getWorkingFilesFromSequence(projectId, sequenceId) {
      state.value.workingFiles.clear()
      const res = await workingfile.getWorkingFilesFromSequence(
        projectId,
        sequenceId
      )
      for (const workingFile of res) {
        if (state.value.workingFiles.has(workingFile.entity_id)) {
          state.value.workingFiles.get(workingFile.entity_id).push(workingFile)
        } else {
          state.value.workingFiles.set(workingFile.entity_id, [workingFile])
        }
      }
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
        for (const workingFile of res) {
          if (state.value.workingFiles.has(workingFile.entity_id)) {
            state.value.workingFiles
              .get(workingFile.entity_id)
              .push(workingFile)
          } else {
            state.value.workingFiles.set(workingFile.entity_id, [workingFile])
          }
        }
        state.value.isLoading = false
      })
    }
  }

  return {
    state,
    actions
  }
})
