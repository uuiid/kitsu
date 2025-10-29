import { ref } from 'vue'
import { defineStore } from 'pinia'
import workingfile from '@/store/api/workingfile.js'
import tasks from '@/store/modules/tasks.js'
function initState() {
  return {
    workingFiles: new Map(),
    tempSelectedAssets: []
  }
}

export const workingFileStore = defineStore('workingFileStore', () => {
  const state = ref(initState())
  const actions = {
    async getWorkingFilesFromSequence(projectId, sequenceId) {
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
    groupEntitiesTaskByParents(
      entities,
      parentNameField,
      keyName,
      isMap = false
    ) {
      const entitiesByParents = new Map()
      for (const entity of entities) {
        const parentKey = entity[parentNameField]
        const task_type_id = tasks.state.taskMap.get(parentKey)[keyName]
        if (!entitiesByParents.has(task_type_id)) {
          entitiesByParents.set(task_type_id, [])
        }
        entitiesByParents.get(task_type_id).push(entity)
      }

      // 如果需要数组形式的结果
      if (isMap) return entitiesByParents
      return Array.from(entitiesByParents.values())
    }
  }

  return {
    state,
    actions
  }
})
