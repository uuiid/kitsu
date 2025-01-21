<script setup>
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { computed, onUnmounted, ref, watch, onMounted, nextTick } from 'vue'
import { SearchIcon } from 'lucide-vue-next'

const doodleWork = doodleWorkStore()

//const logType = /^(?:\[[^\]]*]\s*){2}\[([^\]]+)]/
const loading = ref(true)
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
const inputValueModle = ref('')
let count = 0
const dynamicsLog = ref([])
const workTask = computed(() => {
  return doodleWork.state.viewLogWorkTask
})
onMounted(() => {
  document.addEventListener('scroll', onScroll)
  nextTick(() => {
    load()
  })
})

const onClickLogType = logType => {
  inputValue.value = ''
  logType.isSelected = !logType.isSelected
}
const load = () => {
  const step = Math.min(200, logs.value.length - count)
  dynamicsLog.value.push(...logs.value.slice(count, count + step))
  count += step
  loading.value = logs.value.length - count > 0
}

const intervalId = setInterval(() => {
  if (workTask.value && workTask.value.status === 'running') {
    doodleWork.actions
      .getWorkTaskLog(doodleWork.state.viewLogWorkTask.id)
      .then(log => {
        doodleWork.state.workTaskLogData += log.replace(
          doodleWork.state.workTaskLogData,
          ''
        )
      })
  }
}, 1000)

const onScroll = event => {
  const target = event.target
  const start = target.scrollHeight
  if (
    start - target.scrollTop === target.clientHeight &&
    logs.value.length - count > 0
  ) {
    load()
    target.scrollTo(0, start)
  }
}

onUnmounted(() => {
  document.removeEventListener('scroll', onScroll)
  clearInterval(intervalId)
})
const regex = computed(() => {
  let temp = ``
  logTypes.value.forEach(item => {
    if (item.isSelected) {
      temp += `\\[.*?\\[${item.name}].*$|`
    }
  })
  temp = temp.substring(0, temp.length - 1)
  return temp
})

const logs = computed(() => {
  let res = doodleWork.state.workTaskLogData.match(
    new RegExp(regex.value, 'gm')
  )
  if (res) {
    res = res.filter(log => {
      return new RegExp(`.*?${inputValue.value}.*$`, 'gmi').test(log)
    })
    res.reverse()
  }
  return res || []
})
watch(logs, () => {
  dynamicsLog.value = []
  count = 0
  load()
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
                @click="onClickLogType(logType)"
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
                v-model.trim="inputValueModle"
                @keydown.enter="inputValue = inputValueModle"
              />
            </div>
          </div>
          <div class="log-content">
            <ul class="infinite-list" style="overflow: auto" @scroll="onScroll">
              <li
                :class="{
                  error: log.includes('[error]')
                }"
                :key="index"
                v-for="(log, index) in dynamicsLog"
              >
                {{ log }}
              </li>
            </ul>
            <!--div class="" :key="index" v-for="(log, index) in logs">
              <span
                :class="{
                  error: log.includes('[error]')
                }"
                >{{ log }}</span
              >
            </div-->
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
  overflow: hidden;
}

.box {
  display: flex;
  flex-direction: column;
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
  padding: 1em;
  height: 100%;
  border-radius: 5px;
  border: 1px solid var(--text);
  overflow: auto;
}

.infinite-list {
  height: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
}

.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: var(--el-color-primary-light-9);
  margin: 10px;
  color: var(--el-color-primary);
}

.infinite-list .infinite-list-item + .list-item {
  margin-top: 10px;
}

.modal-content {
  min-width: 60%;
}
</style>
