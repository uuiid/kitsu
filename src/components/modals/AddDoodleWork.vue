<script setup>
import TableList from '@/components/lists/TableList.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { computed } from 'vue'
import ReplaceList from '@/components/lists/ReplaceList.vue'
import { generateUUID } from 'three/src/math/MathUtils.js'
import { ElMessage } from 'element-plus'
import i18n from '@/lib/i18n.js'

const doodleWork = doodleWorkStore()

const disPlayTaskDataFiled = computed(() => {
  if (doodleWork.currentDoodleWorkState) {
    if (doodleWork.currentDoodleWorkState.task_data_filed) {
      return doodleWork.currentDoodleWorkState.task_data_filed
    }
  }
  return []
})

const onAddData = files => {
  const files_temp = []
  if (doodleWork.currentDoodleWorkState.uncommittedWorkList.size > 0) {
    for (const file of files) {
      let isAdd = true
      for (const work of doodleWork.currentDoodleWorkState.uncommittedWorkList)
        if (
          file?.path === work[1].task_data?.path ||
          file?.path === work[1].path
        ) {
          isAdd = false
          ElMessage.error(
            `${file.path} ${i18n.global.t('doodle.already_exists')}`
          )
        }
      if (isAdd) files_temp.push(file)
    }
  } else files_temp.push([...files])
  if (files[0].path !== '')
    doodleWork.currentDoodleWorkState.addFilesData(files_temp)
}

const onAction = (action_name, task) => {
  if (action_name === 'remove-task') {
    doodleWork.currentDoodleWorkState.uncommittedWorkList.delete(task.id)
  }
}

const onSubmit = () => {
  if (doodleWork.currentDoodleWorkState.name === 'extract_caption') {
    doodleWork.actions.submitExtractCaptionTask()
  } else {
    if (!doodleWork.currentDoodleWorkState.isSubmitting)
      doodleWork.actions.submitLocalDoodleWork()
    else ElMessage.error('正在提交请稍后')
  }
}
const onAddReplaceData = files => {
  files.forEach(file => {
    let isAdd = true
    doodleWork.currentDoodleWorkState.replaceFiles.forEach(file_list => {
      if (file_list[0] === file.path) {
        isAdd = false
      }
    })
    if (isAdd) {
      doodleWork.currentDoodleWorkState.replaceFiles.set(generateUUID(), [
        file.path,
        ''
      ])
    } else {
      ElMessage.error(`${file.path} ${i18n.global.t('doodle.already_exists')}`)
    }
  })
}
const onDeleteReplaceData = key => {
  doodleWork.currentDoodleWorkState.replaceFiles.delete(key)
}
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': doodleWork.state.isActiveModal
    }"
  >
    <div
      class="modal-background"
      @click="doodleWork.state.isActiveModal = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle_work.add_doodle_work') }}
        </h1>
        <div
          class="interval"
          v-if="doodleWork.currentDoodleWorkState.isShowFiled"
        >
          <div
            class="project-list"
            :key="key"
            v-for="(taskData, key) in disPlayTaskDataFiled"
          >
            <div class="project-list-item" v-if="taskData[1].type === Boolean">
              <input
                class="input-checkbox"
                type="checkbox"
                v-model="taskData[1].checked"
                @click="
                  console.log(doodleWork.currentDoodleWorkState.task_data_filed)
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
                  console.log(doodleWork.currentDoodleWorkState.task_data_filed)
                "
              />
              <span>{{ taskData[1].name }}</span>
            </div>
          </div>
        </div>
        <table-list
          class="table-list"
          :class="{
            'table-list-':
              doodleWork.currentDoodleWorkState.name === 'replace_maya_ref'
          }"
          name="执行"
          :table-header-filed="
            doodleWork.currentDoodleWorkState.tableHeaderFiled
          "
          :body-list="doodleWork.currentDoodleWorkState.uncommittedWorkList"
          :is-drop="true"
          :is-show-submit="
            doodleWork.currentDoodleWorkState.name !== 'replace_maya_ref'
          "
          @submit="onSubmit"
          @add-data="onAddData"
          @handle-action="onAction"
        ></table-list>
        <div
          class="buttons"
          v-if="doodleWork.currentDoodleWorkState.name === 'replace_maya_ref'"
        >
          替换文件
        </div>
        <replace-list
          class="buttons"
          :body-list="doodleWork.currentDoodleWorkState.replaceFiles"
          v-if="doodleWork.currentDoodleWorkState.name === 'replace_maya_ref'"
          @add-data="onAddReplaceData"
          @delete-data="onDeleteReplaceData"
          @submit="onSubmit"
        ></replace-list>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-list {
  max-height: 60vh;
}

.box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-list- {
  max-height: 30vh;
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
</style>
