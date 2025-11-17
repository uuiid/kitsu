<script setup>
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { computed, ref, onMounted } from 'vue'
import TableList from '@/components/lists/TableList.vue'
import { ElMessage } from 'element-plus'
const localLogPath = ref('')
const doodleWork = doodleWorkStore()

const displayWork = computed(() => {
  return doodleWork.doodleWorkStateMap.get('auto_light')
})
onMounted(() => {
  doodleWork.actions.getLocalLogPath().then(path => {
    localLogPath.value = path.tmp_dir
  })
})

const onViewLog = work_task => {
  doodleWork.state.viewLogWorkTask = work_task
  doodleWork.state.isActiveLogModal = true
  doodleWork.actions.getWorkTaskLog(work_task.id).then(log => {
    doodleWork.state.workTaskLogData = log
  })
}

const onAction = async (action_name, task) => {
  if (action_name === 'remove-task') {
    doodleWork.actions.deleteDoodleWorkTask(task.id)
    displayWork.value.workList.delete(task.id)
  } else if (action_name === 'view-log') {
    //onViewLog(task)
    const fs = require('fs')
    const logPath = `${localLogPath.value}/${task.id}.log`
    if (fs.existsSync(logPath)) {
      window.api.openPath(logPath)
    } else ElMessage.error('文件不存在，请稍后尝试')
  } else if (action_name === 'cancel-task') {
    try {
      const res = await doodleWork.actions.cancelDoodleWorkTask(task)
      if (res) {
        task.status = 'canceled'
        ElMessage({
          message: '移除成功',
          type: 'success'
        })
      } else {
        ElMessage.error('移除失败')
      }
    } catch (e) {
      ElMessage.error('移除失败')
    }
  } else if (action_name === 'restart') {
    doodleWork.actions.resubmitLocalDoodleWork(task)
  }
}
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': doodleWork.state.isShowAutoLightList
    }"
  >
    <div
      class="modal-background"
      @click="doodleWork.state.isShowAutoLightList = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle_work.auto_light_list') }}
        </h1>
        <table-list
          class="table-list"
          :table-header-filed="displayWork.tableHeaderFiled"
          :body-list="displayWork.workList"
          name="刷新"
          :is-drop="false"
          :is-show-submit="false"
          :is-show-view-log="true"
          :is-show-restart="true"
          :is-show-demonstrate="true"
          @remove-data="displayWork.workList.delete"
          @view-log="onViewLog"
          @handle-action="onAction"
        ></table-list>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-list {
  max-height: 60vh;
}

.interval {
  display: flex;
  flex-direction: row;
  gap: 2em;
  margin-bottom: 10px;
}

.project-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.modal-content {
  min-width: 60%;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input {
  max-width: 100px;
  max-height: 30px;
}

.input-checkbox {
  height: 30px;
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
