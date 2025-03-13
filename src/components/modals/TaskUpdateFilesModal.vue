<script setup>
import TableList from '@/components/lists/TableList.vue'
import { updateTaskFilesStore } from '@/store/modules/updatetaskfiles'
import { onUnmounted, onMounted, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import DoodleWorkLogModal from '@/components/modals/DoodleWorkLogModal.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'

const updateTaskFiles = updateTaskFilesStore()
const notNeedInspections = new Map()
const updateTypes = [
  { id: 0, label: 'maya文件', name: 'maya' },
  { id: 1, label: 'maya贴图', name: 'maya' },
  { id: 2, label: 'ue渲染图', name: 'ue' },
  { id: 3, label: 'ue文件', name: 'ue' }
]
const tests = computed(() => {
  return updateTypes.filter(
    type => type.id === updateTaskFiles.state.currentUpdateType
  )[0].label
})

const displayAllFiles = computed(() => {
  return [...updateTaskFiles.state.allFiles.values()].filter(
    task => task.updateType === updateTaskFiles.state.currentUpdateType
  )
})
onMounted(() => {
  if (doodleWorkStore().state.doodleSocket) {
    doodleWorkStore().state.doodleSocket.on(
      'doodle:task_info:update',
      async data => {
        if (data.type === 'check_maya') {
          const task = updateTaskFiles.state.allFiles.get(data.id)
          await doodleWorkStore().actions.formatTask(task, data)
          if (data.status === 'completed') {
            task.status = 'updating'
            updateTaskFiles.state.updateTaskQueue.enqueue(task)
          }
        }
      }
    )
  }
})
updateTaskFiles.doodleWork.state.currentDoodleWorkType = 'check_maya'
const intervalId = setInterval(() => {
  // updateTaskFiles.actions.isReloadDoodleWork()
  // if (updateTaskFiles.doodleWorkCheckFiles.isReload) {
  //   updateTaskFiles.state.allFiles.forEach(task => {
  //     if (!['failed', 'updating', 'updated', 'waiting'].includes(task.status)) {
  //       updateTaskFiles.actions.loadLocalDoodleWork(task)
  //     } else if (task.status === 'updating') {
  //       const currentTime = new Date()
  //       const date = new Date(task.run_time)
  //       task.computed_time =
  //         currentTime > date
  //           ? updateTaskFiles.doodleWork.actions.formatDiffTime(
  //               currentTime - date
  //             )
  //           : '00:00:00'
  //     }
  //   })
  // }
  if (
    updateTaskFiles.state.updateTaskQueue.size > 0 &&
    updateTaskFiles.state.loadingNum < 3
  ) {
    updateTaskFiles.state.loadingNum += 1
    updateTaskFiles.actions.updateTaskFile(
      updateTaskFiles.state.updateTaskQueue.dequeue()
    )
  }
}, 1000)

onUnmounted(() => {
  clearInterval(intervalId)
})

onMounted(() => {
  console.log(updateTaskFiles.state.selectedTask)
})
const onViewLog = work_task => {
  updateTaskFiles.doodleWork.state.viewLogWorkTask = work_task
  updateTaskFiles.doodleWork.state.isActiveLogModal = true
  updateTaskFiles.doodleWork.actions.getWorkTaskLog(work_task.id).then(log => {
    updateTaskFiles.doodleWork.state.workTaskLogData = log
  })
}

const onActions = async (action_name, task) => {
  if (action_name === 'remove-task') {
    updateTaskFiles.state.allFiles.delete(task.id)
    updateTaskFiles.doodleWorkCheckFiles.uncommittedWorkList.delete(task.id)
  } else if (action_name === 'view-log') {
    onViewLog(task)
  } else if (action_name === 'cancel-task') {
    try {
      await updateTaskFiles.doodleWork.actions.cancelDoodleWorkTask(task)
      ElMessage({
        message: '移除成功',
        type: 'success'
      })
    } catch (e) {
      ElMessage.error('移除失败')
    }
  }
}
const onAddData = files => {
  const messages = []
  const result = updateTaskFiles.actions.checkEntity(
    updateTaskFiles.state.selectedTask.entity
  )
  if (result !== '') {
    ElNotification({
      title: '添加失败',
      message: '请先设置：' + result,
      type: 'error',
      duration: 5000,
      offset: 150
    })
    return
  }
  const path = require('path')
  const fs = require('fs')
  const files_ = []
  const bian_hao = updateTaskFiles.state.selectedTask.entity.data.bian_hao
  const pin_yin_ming_cheng =
    updateTaskFiles.state.selectedTask.entity.data.pin_yin_ming_cheng
  for (const file of files) {
    if (
      updateTaskFiles.state.currentUpdateType === 0 &&
      file.name.endsWith('.ma') &&
      `Ch${bian_hao}.ma` === file.name
    )
      files_.push(file)
    else if (
      updateTaskFiles.state.currentUpdateType === 3 &&
      file.name.endsWith('.uproject') &&
      `${pin_yin_ming_cheng}_UE5.uproject` === file.name
    ) {
      const root_path = path.dirname(file.path)
      const sk_path = path.join(
        root_path,
        `Content/Character/${pin_yin_ming_cheng}/Meshs/SK_Ch${bian_hao}.uasset`
      )
      if (fs.existsSync(sk_path)) {
        const task = updateTaskFiles.doodleWorkCheckFiles.formatData(file)
        task.status = 'waiting'
        task.run_time = new Date().toISOString()
        task.submit_time = new Date().toISOString()
        task.updateType = updateTaskFiles.state.currentUpdateType
        updateTaskFiles.state.allFiles.set(task.id, task)
        notNeedInspections.set(task.id, task)
      } else {
        messages.push(`${file.name}:请检查Sk路径`)
      }
    } else if (
      updateTaskFiles.state.currentUpdateType === 1 ||
      updateTaskFiles.state.currentUpdateType === 2
    ) {
      if (!fs.lstatSync(file.path).isDirectory()) {
        const task = updateTaskFiles.doodleWorkCheckFiles.formatData(file)
        task.status = 'waiting'
        task.run_time = new Date().toISOString()
        task.submit_time = new Date().toISOString()
        task.updateType = updateTaskFiles.state.currentUpdateType
        updateTaskFiles.state.allFiles.set(task.id, task)
        notNeedInspections.set(task.id, task)
      } else {
        messages.push(`${file.name}:请拖入图片文件`)
      }
    } else {
      messages.push(`${file.name}:请检查文件名称`)
    }
  }
  messages.forEach(async message => {
    setTimeout(() => {
      ElNotification({
        title: '添加失败',
        message: message,
        type: 'error',
        duration: 5000,
        offset: 150
      })
    })
  })

  updateTaskFiles.doodleWorkCheckFiles.addFilesData(files_)
  updateTaskFiles.doodleWorkCheckFiles.uncommittedWorkList.forEach(
    (task, id) => {
      updateTaskFiles.state.allFiles.set(id, task)
    }
  )
}
const onSubmit = async () => {
  updateTaskFiles.actions.submitLocalDoodleWork()
  notNeedInspections.forEach(task => {
    if (task.updateType === updateTaskFiles.state.currentUpdateType) {
      task.status = 'updating'
      updateTaskFiles.state.updateTaskQueue.enqueue(task)
      notNeedInspections.delete(task.id)
    }
  })
  updateTaskFiles.doodleWorkCheckFiles.isReload = true
}
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': updateTaskFiles.state.isShowUpdateModal
    }"
  >
    <div
      class="modal-background"
      @click="updateTaskFiles.state.isShowUpdateModal = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle.folder_up') }}
        </h1>
        <el-radio-group
          class="update-type"
          v-model="updateTaskFiles.state.currentUpdateType"
          size="large"
        >
          <el-radio-button
            :label="type.label"
            :value="type.id"
            :key="type.id"
            v-for="type in updateTypes"
          />
        </el-radio-group>
        <table-list
          class="table-list"
          :name="`上传(${tests})`"
          :table-header-filed="
            updateTaskFiles.doodleWorkCheckFiles.tableHeaderFiled
          "
          :is-drop="true"
          :is-show-submit="true"
          :is-show-view-log="false"
          :is-show-progress="true"
          :body-list="displayAllFiles"
          running-label="checking"
          @submit="onSubmit"
          @add-data="onAddData"
          @handle-action="onActions"
        ></table-list>
      </div>
    </div>
  </div>
  <doodle-work-log-modal
    v-if="updateTaskFiles.doodleWork.state.isActiveLogModal"
  />
</template>

<style scoped lang="scss">
.modal-content {
  width: 60%;
}

.update-type {
  margin-bottom: 10px;
}

.table-list {
  max-height: 60vh;
}
</style>
