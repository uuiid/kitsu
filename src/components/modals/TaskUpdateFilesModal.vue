<script setup>
import TableList from '@/components/lists/TableList.vue'
import { updateTaskFilesStore } from '@/store/modules/updatetaskfiles'
import { onUnmounted, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

const updateTaskFiles = updateTaskFilesStore()

updateTaskFiles.doodleWork.state.currentDoodleWorkType = 'check_maya'
const intervalId = setInterval(() => {
  updateTaskFiles.actions.isReloadDoodleWork()
  if (updateTaskFiles.doodleWorkCheckFiles.isReload) {
    updateTaskFiles.state.allFiles.forEach(task => {
      if (!['failed', 'updating', 'updated', 'waiting'].includes(task.status)) {
        updateTaskFiles.actions.loadLocalDoodleWork(task)
      } else if (task.status === 'updating') {
        const currentTime = new Date()
        const date = new Date(task.run_time)
        task.computed_time =
          currentTime > date
            ? updateTaskFiles.actions.formatDiffTime(currentTime - date)
            : '00:00:00'
      }
    })
  }
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
  updateTaskFiles.state.allFiles.delete(task.id)
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
    if (file.name.endsWith('.ma') && `Ch${bian_hao}.ma` === file.name)
      files_.push(file)
    else if (
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
        task.status = 'updating'
        task.run_time = new Date().toISOString()
        task.submit_time = new Date().toISOString()
        updateTaskFiles.state.allFiles.set(task.id, task)
        updateTaskFiles.state.updateTaskQueue.enqueue(task)
      } else {
        messages.push(`${file.name}:请检查Sk路径`)
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
        <table-list
          class="table-list"
          name="上传"
          :table-header-filed="
            updateTaskFiles.doodleWorkCheckFiles.tableHeaderFiled
          "
          :is-drop="true"
          :is-show-submit="true"
          :body-list="updateTaskFiles.state.allFiles"
          @submit="onSubmit"
          @add-data="onAddData"
          @handle-action="onActions"
        ></table-list>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-content {
  width: 60%;
}

.table-list {
  max-height: 60vh;
}
</style>
