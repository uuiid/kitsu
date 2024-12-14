<script setup>
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { computed, onUnmounted, ref } from 'vue'
import { SearchIcon } from 'lucide-vue-next'

const doodleWork = doodleWorkStore()

//const logType = /^(?:\[[^\]]*]\s*){2}\[([^\]]+)]/

const logTypes = ref([
  {
    name: 'warning',
    color: '#eeff00',
    isSelected: true
  },
  {
    name: 'error',
    color: '#ff0000',
    isSelected: true
  },
  {
    name: 'info',
    color: '#00ff66',
    isSelected: true
  }
])

const inputValue = ref('')

const workTask = computed(() => {
  return doodleWork.state.viewLogWorkTask
})

const intervalId = setInterval(() => {
  if (workTask.value && workTask.value.status === 'running')
    doodleWork.actions.getWorkTaskLog(doodleWork.state.viewLogWorkTask.id)
}, 1000)

onUnmounted(() => {
  clearInterval(intervalId)
})

const logs = computed(() => {
  return doodleWork.state.workTaskLogData
    .split(/\r?\n/)
    .filter(
      log =>
        log &&
        logTypes.value
          .filter(item => item.isSelected)
          .filter(item => log.includes(`[${item.name}]`)).length > 0 &&
        log.includes(inputValue.value)
    )
})
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': doodleWork.state.isActiveLogModal
    }"
  >
    <div
      class="modal-background"
      @click="doodleWork.state.isActiveLogModal = false"
    ></div>
    <div>
      <div class="modal-content">
        <div class="box">
          <h1 class="title">
            {{ $t('doodle_work.log') + doodleWork.state.viewLogWorkTask.name }}
          </h1>
          <div class="log-action">
            <div class="log-type">
              <div
                class="log-type-item"
                :key="index"
                v-for="(logType, index) in logTypes"
                @click="logType.isSelected = !logType.isSelected"
              >
                <div
                  class="log-type-item-color"
                  :style="
                    logType.isSelected
                      ? `background-color: ${logType.color}`
                      : ''
                  "
                ></div>
                <div class="log-type-item-text">{{ logType.name }}</div>
              </div>
            </div>
            <div class="search-field">
              <span class="search-icon">
                <search-icon :size="20" />
              </span>
              <input
                ref="search-field"
                class="input"
                :placeholder="$t('scan_project.name')"
                v-model.trim="inputValue"
              />
            </div>
          </div>
          <div class="log-content">
            <div class="" :key="log" v-for="log in logs">
              <span
                :class="{
                  error: log.includes('[error]')
                }"
                >{{ log }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-content {
  height: 85vh;
  width: 60vw;
}

.box {
  height: 100%;
}

.log-action {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.log-type {
  display: flex;
  flex-direction: row;
  gap: 1em;
}

.log-type-item {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  border-radius: 5px;
  gap: 0.2em;
  border: 1px solid var(--text);
  cursor: pointer;
}

.log-type-item-color {
  border-bottom-left-radius: 3px;
  border-top-left-radius: 3px;
  background-color: var(--text);
  min-width: 8px;
  max-width: 8px;
}

.log-type-item-text {
  user-select: none;
  padding: 0.1em;
}

.search-field {
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

.log-content {
  display: flex;
  flex-direction: column;
  max-height: 62vh;
  padding: 1em;
  border-radius: 5px;
  border: 1px solid var(--text);
  overflow: auto;
}

.modal-content {
  min-width: 60%;
}
</style>
