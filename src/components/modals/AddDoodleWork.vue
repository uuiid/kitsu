<script setup>
import TableList from '@/components/lists/TableList.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'

const doodleWork = doodleWorkStore()

const onSubmit = workList => {
  doodleWork.state.uncommittedWorkList = workList
  doodleWork.actions.submitLocalDoodleWork(workList)
  console.log(doodleWork.state.fbxTaskDataFiled)
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
        <div class="interval">
          <div
            class="project-list"
            :key="taskData.id"
            v-for="taskData in doodleWork.state.fbxTaskDataFiled"
          >
            <div class="project-list-item">
              <input type="checkbox" v-model="taskData.checked" />
              <span>{{ taskData.name }}</span>
            </div>
          </div>
        </div>
        <table-list
          class="table-list"
          name="执行"
          :table-header-filed="doodleWork.state.tableHeaderFiled"
          :body-list="doodleWork.state.uncommittedWorkList"
          :is-drop="true"
          :is-show-submit="true"
          @submit="onSubmit"
          @add-data="data => doodleWork.state.uncommittedWorkList.push(...data)"
          @remove-data="
            dataIndex =>
              doodleWork.state.uncommittedWorkList.splice(dataIndex, 1)
          "
          @view-log="data => console.log(data)"
        ></table-list>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-list {
  max-height: 60vh;
}

.modal-content {
  min-width: 60%;
}
</style>
