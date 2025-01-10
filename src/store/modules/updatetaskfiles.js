import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function initState() {
  return {
    isChecking: false,
    isShowCheckModal: false,
    isShowUpdatePanel: false,
    isShowUpdateModal: false,
    selectedTask: null,
    allFiles: new Map()
  }
}

export const updateTaskFilesStore = defineStore(
  'updateTaskFilesStorage',
  () => {
    const state = ref(initState())
    const isShowUpdatePanel = computed(() => {
      return (
        state.value.selectedTask.task.task_type_id ===
        '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
      )
    })
    const actions = {
      checkFiles: async files => {
        state.value.isChecking = true
      }
    }
    return { state, actions, isShowUpdatePanel }
  }
)
