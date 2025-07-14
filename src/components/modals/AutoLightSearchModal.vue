<script setup>
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { ref, computed } from 'vue'
import { SearchIcon } from 'lucide-vue-next'
import AutoLightSearch from '@/components/widgets/AutoLightSearch.vue'

const doodleWork = doodleWorkStore()
const inputValue = ref('')
const inputValueModle = ref('')
const isOnlyShowErrorTask = ref(false)

const displayWorkList = computed(() => {
  return doodleWork.state.autoLightSearchTasks.filter(task =>
    isOnlyShowErrorTask.value ? true : task.is_error
  )
})

function onAddTask(tasks) {
  doodleWork.state.autoLightSearchTasks = tasks
}
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': doodleWork.state.isShowAutoLightSearch
    }"
  >
    <div
      class="modal-background"
      @click="doodleWork.state.isShowAutoLightSearch = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle_work.add_doodle_work') }}
        </h1>
        <div class="has-right" v-show="false">
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
        <auto-light-search
          class="table-list"
          :body-list="displayWorkList"
          @add-data="onAddTask"
        >
        </auto-light-search>
        <div class="has-text-right" style="margin-top: 10px">
          <a
            :class="{
              button: true
            }"
            @click="isOnlyShowErrorTask = !isOnlyShowErrorTask"
          >
            {{ isOnlyShowErrorTask ? '显示所有任务' : '只显示错误任务' }}
          </a>
        </div>
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
