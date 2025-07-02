<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
//import { getCurrentInstance } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import TableList from '@/components/lists/TableList.vue'
import { ElMessage } from 'element-plus'
import { SearchIcon } from 'lucide-vue-next'
//const _this = getCurrentInstance().appContext.config.globalProperties
const doodleWork = doodleWorkStore()
const props = defineProps(['name', 'isDrop', 'isSetOutPath'])
doodleWork.state.currentDoodleWorkType = props.name
//const isDragOver = ref(false)
const inputValue = ref('')
const inputValueModel = ref('')

const statusNum = computed(() => {
  let temp = 0
  doodleWork.currentDoodleWorkState.workList.forEach((value, key) => {
    if (value.status === 'failed') {
      //temp_list.push(value)
      temp++
    }
  })
  return temp
})

const filteredWorkList = computed(() => {
  if (inputValue.value) {
    const temp = new Map()
    //const temp_list = []
    doodleWork.currentDoodleWorkState.workList.forEach((value, key) => {
      if (
        new RegExp(`.*?${inputValue.value}.*$`, 'gmi').test(value.last_line_log)
      ) {
        //temp_list.push(value)
        temp.set(value.id, value)
      }
    })
    // temp_list.sort((a, b) => {
    //   return a.name.localeCompare(b.name)
    // })
    // temp_list.forEach(item => {
    //   temp.set(item.id, item)
    // })
    return temp
  }
  return doodleWork.currentDoodleWorkState.workList
})

onMounted(() => {
  if (props.isSetOutPath && doodleWork.state.outPath === '') {
    doodleWork.state.dialogFormVisible = true
    document.addEventListener('paste', onClipboard)
  }
  //document.addEventListener('paste', onClipboard)
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
  }
}

const onClipboard = event => {
  if (doodleWork.state.outPath) {
    event.preventDefault()
    const clipboardData = event.clipboardData || window.clipboardData
    const files = clipboardData.files
    if (!doodleWork.state.isActiveModal) onAddData(files)
  }
}

// const onQuantityChange = event => {
//   console.log('onQuantityChange', event)
//   doodleWork.actions.setWorkSetting()
// }
doodleWork.actions.loadLocalDoodleWork()
doodleWork.actions.isReloadDoodleWork()
// const intervalId = setInterval(() => {
//   if (doodleWork.currentDoodleWorkState.isReload) {
//     doodleWork.actions.loadLocalDoodleWork()
//     doodleWork.actions.isReloadDoodleWork()
//   } else {
//     doodleWork.actions.isReloadDoodleWork()
//   }
// }, 1000)

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
    //onViewLog(task)
    const os = require('os')
    const fs = require('fs')
    const logPath = `${os.tmpdir()}/doodle/server_task/${task.id}.log`
    if (fs.existsSync(logPath)) {
      window.api.openPath(logPath)
    } else ElMessage.error('文件不存在，请稍后尝试')
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
  //clearInterval(intervalId)
  document.removeEventListener('paste', onClipboard)
})
</script>

<template>
  <div class="datatable-main">
    <div class="has-right">
      <div class="search-field-main">
        <span class="search-icon">
          <search-icon :size="20" />
        </span>
        <input
          ref="search-field"
          class="input"
          :placeholder="$t('doodle_work.log')"
          v-model.trim="inputValueModel"
          @keydown.enter="inputValue = inputValueModel"
          @input="inputValueModel ? undefined : (inputValue = inputValueModel)"
        />
      </div>
    </div>
    <table-list
      :table-header-filed="doodleWork.currentDoodleWorkState.tableHeaderFiled"
      :body-list="
        filteredWorkList || doodleWork.currentDoodleWorkState.workList
      "
      name="刷新"
      :is-drop="true"
      :is-show-submit="false"
      :is-show-view-log="true"
      :is-show-restart="true"
      :is-show-demonstrate="true"
      @add-data="onAddData"
      @remove-data="doodleWork.currentDoodleWorkState.workList.delete"
      @view-log="onViewLog"
      @handle-action="onAction"
    ></table-list>
    <div
      class="has-right"
      v-if="doodleWork.currentDoodleWorkState.workList.size > 0"
    >
      <span>失败/所有:</span>
      <span>
        {{ statusNum }}/{{ doodleWork.currentDoodleWorkState.workList.size }}
      </span>
    </div>
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

.search-field-main {
  margin-bottom: 5px;
  //display: flex;
  padding-top: 0;
  position: relative;

  .input {
    font-size: 0.8em;
    border-radius: 10px;
    padding-left: 40px;
  }

  .search-icon {
    position: absolute;
    color: $grey;
    z-index: 4;
    top: 6px;
    left: 10px;
  }
}

.has-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 5px;
}

.input {
  min-width: 180px;
}
</style>
