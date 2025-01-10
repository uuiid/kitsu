<script setup>
import TableList from '@/components/lists/TableList.vue'
import { updateTaskFilesStore } from '@/store/modules/updatetaskfiles'
import { generateUUID } from 'three/src/math/MathUtils'

const updateTaskFiles = updateTaskFilesStore()
const tableHeaderFiled = {
  name: { name: '文件名', type: 'string' }
}

const onAddFile = files => {
  for (const file of files) {
    const data = { id: generateUUID(), file: file, name: file.name }
    updateTaskFiles.state.allFiles.set(data.id, data)
  }
}
const onActions = (action_name, task) => {
  updateTaskFiles.state.allFiles.delete(task.id)
}
const onSubmit = async () => {}
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
          :table-header-filed="tableHeaderFiled"
          :is-drop="true"
          :is-show-submit="true"
          :body-list="updateTaskFiles.state.allFiles"
          @submit="onSubmit"
          @add-data="onAddFile"
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
