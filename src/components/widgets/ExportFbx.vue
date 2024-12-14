<script setup>
import { onUnmounted, ref, watchEffect } from 'vue'
//import { getCurrentInstance } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import TableList from '@/components/lists/TableList.vue'
import { ElMessage } from 'element-plus'

//const _this = getCurrentInstance().appContext.config.globalProperties
const doodleWork = doodleWorkStore()
const props = defineProps(['name', 'isDrop'])
doodleWork.state.currentDoodleWorkType = props.name
const isDragOver = ref(false)
const handleDragOver = event => {
  event.preventDefault()
  if (!isDragOver.value) {
    isDragOver.value = true
    if (props.isDrop) {
      event.dataTransfer.dropEffect = 'none'
    } else {
      event.dataTransfer.dropEffect = 'copy'
    }
  }
}

const onViewLog = work_task => {
  doodleWork.state.viewLogWorkTask = work_task
  doodleWork.state.isActiveLogModal = true
  doodleWork.actions.getWorkTaskLog(work_task.id)
}
const onDrop = event => {
  event.preventDefault()
  doodleWork.state.isActiveModal = true
  isDragOver.value = false
  const files = event.dataTransfer.files
  doodleWork.currentDoodleWorkState.addFilesData(files)
}
// const onQuantityChange = event => {
//   console.log('onQuantityChange', event)
//   doodleWork.actions.setWorkSetting()
// }
doodleWork.actions.loadLocalDoodleWork()
const intervalId = setInterval(() => {
  if (doodleWork.state.isReload) doodleWork.actions.loadLocalDoodleWork()
}, 1000)

const onAction = async (action_name, task) => {
  if (action_name === 'remove-task') {
    doodleWork.actions.deleteDoodleWorkTask(task.id)
  } else if (action_name === 'view-log') {
    onViewLog(task)
  } else if (action_name === 'cancel-task') {
    try {
      await doodleWork.actions.cancelDoodleWorkTask(task)
      ElMessage({
        message: '移除成功',
        type: 'success'
      })
    } catch (e) {
      ElMessage.error('移除失败')
    }
  }
}

onUnmounted(() => {
  clearInterval(intervalId)
})
watchEffect(() => {
  if (doodleWork.currentDoodleWorkState.workList) {
    if (doodleWork.state.viewLogWorkTask)
      doodleWork.state.viewLogWorkTask =
        doodleWork.currentDoodleWorkState.workList.get(
          doodleWork.state.viewLogWorkTask.id
        )
    const temp = [
      ...doodleWork.currentDoodleWorkState.workList.values()
    ].filter(item => {
      return ['submitted', 'assigned', 'running'].includes(item.status)
    })
    doodleWork.state.isReload = temp.length !== 0
  } else doodleWork.state.isReload = false
})
</script>

<template>
  <div class="datatable-main" @drop="onDrop" @dragover="handleDragOver">
    <table-list
      :table-header-filed="doodleWork.state.tableHeaderFiled"
      :body-list="doodleWork.currentDoodleWorkState.workList"
      :is-drop="false"
      :is-show-view-log="true"
      @add-data="doodleWork.currentDoodleWorkState.addFilesData"
      @remove-data="doodleWork.currentDoodleWorkState.workList.delete"
      @view-log="onViewLog"
      @handle-action="onAction"
    ></table-list>
  </div>
</template>

<style scoped lang="scss">
.datatable-main {
  display: flex;
  flex-direction: column;
  padding: 2em;
  border-radius: 5px;
  max-height: 100%;
  overflow: auto;
  margin-bottom: 1rem;
}

.settings {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 0.5em;
}

.settings-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
}

.input {
  max-width: 100px;
  max-height: 30px;
}
</style>
