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
  { id: 3, label: 'ue文件', name: 'ue' }
]
const tests = computed(() => {
  return updateTypes.filter(
    type => type.id === updateTaskFiles.state.currentUpdateType
  )[0].label
})
const disPlayTaskDataFiled = computed(() => {
  if (updateTaskFiles.doodleWorkCheckFiles) {
    return updateTaskFiles.doodleWorkCheckFiles.task_data_filed
  }
  return []
})
const displayAllFiles = computed(() => {
  return [...updateTaskFiles.state.allFiles.values()].filter(
    task => task.updateType === updateTaskFiles.state.currentUpdateType
  )
})
onMounted(() => {
  if (
    updateTaskFiles.state.selectedTask.task.task_type_id ===
    '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
  ) {
    updateTaskFiles.doodleWorkCheckFiles.isShowFiled = true
  } else {
    updateTaskFiles.doodleWorkCheckFiles.isShowFiled = false
  }
  if (doodleWorkStore().state.doodleSocket) {
    doodleWorkStore().state.doodleSocket.on(
      'doodle:task_info:update',
      async data => {
        if (data.type === 'check_maya') {
          const task = updateTaskFiles.state.allFiles.get(data.id)
          await doodleWorkStore().actions.formatTask(task, data)
          if (data.status === 'completed') {
            task.progress = 1
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
    const fs = require('fs')
    const localLogPath = await doodleWorkStore().actions.getLocalLogPath()
    const logPath = `${localLogPath}/${task.id}.log`
    if (fs.existsSync(logPath)) {
      window.api.openPath(logPath)
    } else ElMessage.error('文件不存在，请稍后尝试')
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

// function getTargetPath(task, software_type = 'ue') {
//   if (software_type === 'maya') {
//     return doodlework.getMayaFilePath(task.id)
//   } else if (software_type === 'ue') {
//     return doodlework.getUeFilePath(task.id)
//   } else if (software_type === 'image')
//     return doodlework.getImageFilePath(task.id)
// }

async function pathRule() {
  const pin_yin_ming_cheng =
    updateTaskFiles.state.selectedTask.entity.pin_yin_ming_cheng
  const bian_hao = updateTaskFiles.state.selectedTask.entity.bian_hao
  let final_file_name = pin_yin_ming_cheng
  if (
    updateTaskFiles.state.selectedTask.entity.ban_ben !== undefined &&
    updateTaskFiles.state.selectedTask.entity.ban_ben !== ''
  )
    final_file_name = `${final_file_name}_${updateTaskFiles.state.selectedTask.entity.ban_beSiGeChuWuDain}`
  const file_path = {
    pin_yin_ming_cheng: pin_yin_ming_cheng,
    root_path: '',
    maya_file_name: '',
    ue_file_name: '',
    ue_work_path: '',
    target_path: undefined
  }
  // let work_files = null
  // if (
  //   updateTaskFiles.state.currentUpdateType === 0 ||
  //   updateTaskFiles.state.currentUpdateType === 1
  // ) {
  //   work_files = await getTargetPath(
  //     updateTaskFiles.state.selectedTask.task,
  //     'maya'
  //   )
  // } else if (updateTaskFiles.state.currentUpdateType === 2) {
  //   work_files = await getTargetPath(
  //     updateTaskFiles.state.selectedTask.task,
  //     'image'
  //   )
  // } else
  //   work_files = await getTargetPath(
  //     updateTaskFiles.state.selectedTask.task,
  //     'ue'
  //   )
  // if (work_files) {
  //   file_path.target_path = work_files.file_path
  // } else {
  //   file_path.target_path = undefined
  // }
  if (
    updateTaskFiles.state.selectedTask.task.task_type_id ===
    '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
  ) {
    file_path.root_path = `Content/Character/${pin_yin_ming_cheng}/Meshs/SK_Ch${bian_hao}.uasset`
    file_path.maya_file_name = `Ch${bian_hao}.ma`
    file_path.ue_file_name = `${pin_yin_ming_cheng}_UE5.uproject`
  } else if (
    (updateTaskFiles.state.selectedTask.entity.asset_type_id ===
      '8c02b76a-6be6-4959-af58-5c31a85fe072' ||
      updateTaskFiles.state.selectedTask.entity.asset_type_id ===
        '6d9d69f0-4269-46fc-9c26-a7f7bf2f30e3') &&
    updateTaskFiles.state.selectedTask.task.task_type_id !==
      '32504e3e-381c-4f36-bdeb-f73328f96f9c'
  ) {
    file_path.root_path = `Content/Prop/${pin_yin_ming_cheng}/Mesh/${final_file_name}.uasset`
    file_path.maya_file_name = `${final_file_name}.ma`
    file_path.ue_file_name = null //`${pin_yin_ming_cheng}.uproject`
  } else if (
    updateTaskFiles.state.selectedTask.task.task_type_id ===
      '13ddf60c-ed8e-4e65-85bb-57dc4207aeca' &&
    (updateTaskFiles.state.selectedTask.entity.asset_type_id ===
      '21b3f5aa-cdd6-4fca-ace4-65077494df4b' ||
      updateTaskFiles.state.selectedTask.entity.asset_type_id ===
        '0e40cd9b-7f50-418b-8322-39c451f49dde')
  ) {
    file_path.root_path = `Content/${pin_yin_ming_cheng}/Map/${final_file_name}.umap`
    file_path.maya_file_name = `${final_file_name}_Low.ma`
    file_path.ue_file_name = `${pin_yin_ming_cheng}.uproject`
  } else if (
    updateTaskFiles.state.selectedTask.task.task_type_id ===
    '32504e3e-381c-4f36-bdeb-f73328f96f9c'
  ) {
    if (
      updateTaskFiles.state.selectedTask.entity.asset_type_id ===
      'f9a8be37-2d05-4e20-8fae-751a61960ce4'
    ) {
      file_path.root_path = `Content/Character/${pin_yin_ming_cheng}/Meshs/SK_Ch${bian_hao}.uasset`
      file_path.maya_file_name = `Ch${bian_hao}_rig_`
      file_path.ue_file_name = `${pin_yin_ming_cheng}_UE5.uproject`
    } else if (
      updateTaskFiles.state.selectedTask.entity.asset_type_id ===
        '8c02b76a-6be6-4959-af58-5c31a85fe072' ||
      updateTaskFiles.state.selectedTask.entity.asset_type_id ===
        '6d9d69f0-4269-46fc-9c26-a7f7bf2f30e3'
    ) {
      file_path.root_path = `Content/Character/${pin_yin_ming_cheng}/Meshs/SK_Ch${bian_hao}.uasset`
      file_path.maya_file_name = `${final_file_name}.ma`
      file_path.ue_file_name = `${pin_yin_ming_cheng}_UE5.uproject`
    }
    // const tasks = updateTaskFiles.state.selectedTask.entity.tasks.filter(
    //   task => task !== updateTaskFiles.state.selectedTask.task.id
    // )
    // for (const task of tasks) {
    //   const taskData = tasksStore.state.taskMap.get(task)
    //   if (taskData) {
    //     const ue_work_path = await getTargetPath(taskData)
    //     if (ue_work_path) {
    //       file_path.ue_work_path = ue_work_path.path
    //       break
    //     }
    //   }
    // }
  } else if (
    updateTaskFiles.state.selectedTask.task.task_type_id ===
    'da050d42-4f45-40c4-9638-cc637753d3b5'
  ) {
    file_path.maya_file_name = `${pin_yin_ming_cheng}_cloth.ma`
  }
  return file_path
}

const onAddData = async files => {
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
  const fs = require('fs')
  const files_ = []
  const file_path = await pathRule()
  // if (file_path.target_path === undefined || file_path.target_path === '') {
  //   ElNotification({
  //     title: '添加失败',
  //     message: '请先扫描资产',
  //     type: 'error',
  //     duration: 5000,
  //     offset: 150
  //   })
  //   return
  // }
  for (const file of files) {
    const file_data = {
      name: file.name,
      path: file.path,
      target_path: file_path.target_path
    }
    console.log(file_path)
    if (updateTaskFiles.state.currentUpdateType === 0)
      file_data['task_id'] = updateTaskFiles.state.selectedTask.task.id
    if (
      updateTaskFiles.state.currentUpdateType === 0 &&
      updateTaskFiles.state.selectedTask.task.task_type_id ===
        '32504e3e-381c-4f36-bdeb-f73328f96f9c'
    ) {
      // if (file_path.ue_work_path === '') {
      //   messages.push(`${file.name}:UE文件路径未知`)
      // } else {
      if (
        file.name.endsWith('.ma') &&
        file.name.startsWith(file_path.maya_file_name)
      ) {
        file_data['task_data'] = {
          create_rig_sk: true,
          maya_file: file.path,
          ue_path: file_path.ue_work_path,
          target_path: file_path.target_path,
          asset_type_id:
            updateTaskFiles.state.selectedTask.entity.asset_type_id,
          bian_hao: updateTaskFiles.state.selectedTask.entity.bian_hao,
          pin_yin_ming_cheng:
            updateTaskFiles.state.selectedTask.entity.pin_yin_ming_cheng,
          ban_ben: updateTaskFiles.state.selectedTask.entity.ban_ben
        }
        files_.push(file_data)
      } else {
        messages.push(`${file.name}:Maya文件名不正确`)
        continue
      }
      //}
    } else if (
      updateTaskFiles.state.currentUpdateType === 0 &&
      file.name.endsWith('.ma') &&
      file_path.maya_file_name === file.name
    ) {
      file_data['task_data'] = {
        path: file.path,
        category: 'model_maya',
        target_path: file_path.target_path
      }
      files_.push(file_data)
    } else if (
      updateTaskFiles.state.currentUpdateType === 3 &&
      file.name.endsWith('.uproject')
    ) {
      if (
        file_path.ue_file_name ? file_path.ue_file_name === file.name : true
      ) {
        //const root_path = path.dirname(file.path)
        //const sk_path = path.join(root_path, file_path.root_path)
        // messages.push(`${file.name}:请检查文件路径`)
        // const task = updateTaskFiles.doodleWorkCheckFiles.formatData(file)
        // task.status = 'waiting'
        // task.run_time = new Date().toISOString()
        // task.submit_time = new Date().toISOString()
        // task.updateType = updateTaskFiles.state.currentUpdateType
        // updateTaskFiles.state.allFiles.set(task.id, task)
        // notNeedInspections.set(task.id, task)
      } else {
        messages.push(`${file.name}:请检查文件路径`)
        continue
      }
    } else if (
      updateTaskFiles.state.currentUpdateType === 1 ||
      updateTaskFiles.state.currentUpdateType === 2
    ) {
      if (fs.lstatSync(file.path).isDirectory()) {
        messages.push(`${file.name}:请拖入图片文件`)
        continue
      }
    } else {
      messages.push(`${file.name}:请检查文件名称`)
      continue
    }
    const task = updateTaskFiles.doodleWorkCheckFiles.formatData(file)
    task.status = 'waiting'
    task.run_time = new Date().toISOString()
    task.submit_time = new Date().toISOString()
    task.updateType = updateTaskFiles.state.currentUpdateType
    updateTaskFiles.state.allFiles.set(task.id, task)
    notNeedInspections.set(task.id, task)
  }
  messages.forEach(message => {
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
  // updateTaskFiles.doodleWorkCheckFiles.uncommittedWorkList.forEach(
  //   (task, id) => {
  //     updateTaskFiles.state.allFiles.set(id, task)
  //   }
  // )
}
const onSubmit = async () => {
  notNeedInspections.forEach(task => {
    if (task.updateType === updateTaskFiles.state.currentUpdateType) {
      task.status = 'updating'
      task.run_time = new Date().toISOString()
      updateTaskFiles.state.updateTaskQueue.enqueue(task)
      notNeedInspections.delete(task.id)
    }
  })
  //await updateTaskFiles.actions.submitLocalDoodleWork()
  //updateTaskFiles.doodleWorkCheckFiles.isReload = true
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
        <div class="task-data-filed">
          <div
            class="interval"
            v-if="
              updateTaskFiles.doodleWorkCheckFiles.isShowFiled &&
              updateTaskFiles.state.currentUpdateType === 0
            "
          >
            <div
              class="project-list"
              :key="key"
              v-for="(taskData, key) in disPlayTaskDataFiled"
            >
              <div
                class="project-list-item"
                v-if="taskData[1].type === Boolean"
              >
                <input
                  class="input-checkbox"
                  type="checkbox"
                  v-model="taskData[1].checked"
                  @click="
                    console.log(
                      doodleWork.currentDoodleWorkState.task_data_filed
                    )
                  "
                />
                <span>{{ taskData[1].name }}</span>
              </div>
              <div
                class="project-list-item"
                v-else-if="taskData[1].type === Number"
                v-show="
                  doodleWork.currentDoodleWorkState.task_data_filed.get(
                    taskData[1].parent_id
                  )?.checked
                "
              >
                <input
                  class="input"
                  type="number"
                  v-model="taskData[1].number"
                  @click="
                    console.log(
                      doodleWork.currentDoodleWorkState.task_data_filed
                    )
                  "
                />
                <span>{{ taskData[1].name }}</span>
              </div>
            </div>
          </div>
        </div>
        <table-list
          class="table-list"
          :name="`上传(${tests})`"
          :table-header-filed="
            updateTaskFiles.doodleWorkCheckFiles.tableHeaderFiled
          "
          :is-drop="true"
          :is-show-submit="true"
          :is-show-view-log="true"
          :is-show-progress="false"
          :body-list="displayAllFiles"
          running-label="checking"
          @submit="onSubmit"
          @add-data="onAddData"
          @view-log="onViewLog"
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
  width: 70%;
}

.update-type {
  margin-bottom: 10px;
}

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

.project-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.task-data-filed {
  min-height: 30px;
}
</style>
