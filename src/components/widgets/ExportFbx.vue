<script setup>
import { onMounted, onUnmounted } from 'vue'
//import { getCurrentInstance } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import TableList from '@/components/lists/TableList.vue'
import { ElMessage } from 'element-plus'
import io from 'socket.io-client'
//const _this = getCurrentInstance().appContext.config.globalProperties
const doodleWork = doodleWorkStore()
const props = defineProps(['name', 'isDrop', 'isSetOutPath'])
doodleWork.state.currentDoodleWorkType = props.name
//const isDragOver = ref(false)

const socket_io = io('http://127.0.0.1:5000')
socket_io.on('connect', socket => {
  console.log('connection connected')
  socket_io.emit('login', { id: 'Client1' })
})
socket_io.on('message', data => {
  console.log(data)
  socket_io.emit('res', data)
})
onMounted(() => {
  if (props.isSetOutPath && doodleWork.state.outPath === '') {
    doodleWork.state.dialogFormVisible = true
  }
  document.addEventListener('paste', onClipboard)
})
// const handleDragOver = event => {
//   event.preventDefault()
//   if (!isDragOver.value) {
//     isDragOver.value = true
//     if (props.isDrop) {
//       event.dataTransfer.dropEffect = 'none'
//     } else {
//       event.dataTransfer.dropEffect = 'copy'
//     }
//   }
// }
const reload = async () => {
  try {
    await doodleWork.actions.loadLocalDoodleWork()
    doodleWork.actions.isReloadDoodleWork()
    ElMessage({
      message: '刷新成功',
      type: 'success'
    })
  } catch (e) {
    console.error(e)
    ElMessage({
      message: '刷新失败',
      type: 'error'
    })
  }
}

const onViewLog = work_task => {
  doodleWork.state.viewLogWorkTask = work_task
  doodleWork.state.isActiveLogModal = true
  doodleWork.actions.getWorkTaskLog(work_task.id).then(log => {
    doodleWork.state.workTaskLogData = log
  })
}

const onAddData = files => {
  doodleWork.currentDoodleWorkState.addFilesData(files)
  if (doodleWork.currentDoodleWorkState.uncommittedWorkList.size > 0) {
    doodleWork.state.isActiveModal = true
  } else {
    ElMessage({
      message: '添加失败，请检查文件名称',
      type: 'error'
    })
  }
}

const onClipboard = event => {
  event.preventDefault()
  const clipboardData = event.clipboardData || window.clipboardData
  const files = clipboardData.files
  if (!doodleWork.state.isActiveModal) onAddData(files)
}

// const onQuantityChange = event => {
//   console.log('onQuantityChange', event)
//   doodleWork.actions.setWorkSetting()
// }
doodleWork.actions.loadLocalDoodleWork()
doodleWork.actions.isReloadDoodleWork()
const intervalId = setInterval(() => {
  if (doodleWork.currentDoodleWorkState.isReload) {
    doodleWork.actions.loadLocalDoodleWork()
    doodleWork.actions.isReloadDoodleWork()
  } else {
    doodleWork.actions.isReloadDoodleWork()
  }
}, 1000)

const reExecute = async () => {
  doodleWork.currentDoodleWorkState.workList.forEach(work => {
    if (work.status === 'failed') {
      doodleWork.actions.resubmitLocalDoodleWork(work)
    }
  })
  doodleWork.currentDoodleWorkState.isReload = true
}
const onAction = async (action_name, task) => {
  if (action_name === 'remove-task') {
    doodleWork.actions.deleteDoodleWorkTask(task.id)
    doodleWork.currentDoodleWorkState.value.workList.delete(task.id)
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
  } else if (action_name === 'restart') {
    doodleWork.actions.resubmitLocalDoodleWork(task)
  }
}

onUnmounted(() => {
  clearInterval(intervalId)
  socket_io.disconnect()
  document.removeEventListener('paste', onClipboard)
})
</script>

<template>
  <div class="datatable-main">
    <table-list
      :table-header-filed="doodleWork.currentDoodleWorkState.tableHeaderFiled"
      :body-list="doodleWork.currentDoodleWorkState.workList"
      name="刷新"
      :is-drop="true"
      :is-show-submit="false"
      :is-show-view-log="true"
      @add-data="onAddData"
      @remove-data="doodleWork.currentDoodleWorkState.workList.delete"
      @view-log="onViewLog"
      @handle-action="onAction"
    ></table-list>
    <div class="has-text-right">
      <div class="buttons">
        <a
          :class="{
            button: true
          }"
          @click="doodleWork.state.isActiveHistoryModal = true"
        >
          {{ `历史` }}
        </a>
        <div
          class="buttons"
          v-show="doodleWork.currentDoodleWorkState.workList.size > 0"
        >
          <a
            :class="{
              button: true
            }"
            @click="reload"
          >
            {{ `刷新` }}
          </a>
          <a
            :class="{
              button: true
            }"
            @click="reExecute"
          >
            {{ `重新执行错误任务` }}
          </a>
        </div>
      </div>
    </div>
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

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
