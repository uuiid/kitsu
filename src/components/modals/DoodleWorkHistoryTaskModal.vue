<script setup>
import TableList from '@/components/lists/TableList.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { ref, computed } from 'vue'
import { SearchIcon } from 'lucide-vue-next'

const doodleWork = doodleWorkStore()
doodleWork.actions.listWorkTasks()
const inputValue = ref('')
const inputValueModle = ref('')
const selectedNum = ref(0)

const filterTasks = computed(() => {
  if (inputValue.value) {
    const temp = new Map()
    const temp_list = []
    doodleWork.currentDoodleWorkState.historyWorkList.forEach((value, key) => {
      if (new RegExp(`.*?${inputValue.value}.*$`, 'gmi').test(value.name)) {
        temp_list.push(value)
      }
    })
    temp_list.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    temp_list.forEach(item => {
      temp.set(item.id, item)
    })
    return temp
  }
  return doodleWork.currentDoodleWorkState.historyWorkList
})

const onAddData = files => {
  doodleWork.currentDoodleWorkState.addFilesData(files)
}

const onAction = (action_name, task) => {
  if (action_name === 'remove-task') {
    doodleWork.actions.deleteDoodleWorkTask(task.id)
    doodleWork.currentDoodleWorkState.historyWorkList.delete(task.id)
  }
}

const onSubmit = () => {
  for (const task of [
    ...doodleWork.currentDoodleWorkState.historyWorkList.values()
  ]) {
    if (task.selected) {
      doodleWork.actions.resubmitLocalDoodleWork(task)
      task.status = 'submitted'
      doodleWork.currentDoodleWorkState.workList.set(task.id, task)
      doodleWork.currentDoodleWorkState.historyWorkList.delete(task.id)
    }
  }
}

const onSelected = task => {
  task.selected = !task.selected
  if (task.selected) selectedNum.value += 1
  else selectedNum.value -= 1
}
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': doodleWork.state.isActiveHistoryModal
    }"
  >
    <div
      class="modal-background"
      @click="doodleWork.state.isActiveHistoryModal = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle_work.add_doodle_work') }}
        </h1>
        <div class="has-right">
          <div class="search-field-main">
            <span class="search-icon">
              <search-icon :size="20" />
            </span>
            <input
              ref="search-field"
              class="input"
              :placeholder="$t('scan_project.name')"
              v-model.trim="inputValueModle"
              @keydown.enter="inputValue = inputValueModle"
              @input="
                inputValueModle ? undefined : (inputValue = inputValueModle)
              "
            />
          </div>
        </div>
        <table-list
          class="table-list"
          :name="`执行${selectedNum > 0 ? `(${selectedNum})` : ''}`"
          :table-header-filed="
            doodleWork.currentDoodleWorkState.tableHeaderFiled
          "
          :body-list="filterTasks"
          :is-drop="false"
          :is-show-submit="true"
          :is-selectable="true"
          @submit="onSubmit"
          @add-data="onAddData"
          @handle-action="onAction"
          @selected="onSelected"
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
