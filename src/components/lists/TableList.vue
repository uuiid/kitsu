<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import i18n from '@/lib/i18n.js'
import TimerCell from '@/components/cells/TimerCell.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import ColorPicker from '@/components/widgets/ColorPicker.vue'

const vuexStore = useStore()
const isShift = ref(false)
const shiftStartIndex = ref(null)
const props = defineProps({
  name: { type: String, default: '' },
  runningLabel: { type: String, default: '' },
  isDrop: { type: Boolean, default: false },
  isShowSubmit: { type: Boolean, default: false },
  tableHeaderFiled: {
    type: Object,
    default: () => {}
  },
  bodyList: { type: Map, default: () => Map() },
  isShowViewLog: { type: Boolean, default: false },
  isShowProgress: { type: Boolean, default: false },
  isSelectable: { type: Boolean, default: false },
  isShowDemonstrate: { type: Boolean, default: false },
  isShowRestart: { type: Boolean, default: false },
  isShowDelete: { type: Boolean, default: true },
  isShowCancel: { type: Boolean, default: true },
  isModify: { type: Boolean, default: false }
})
const colors = [
  { color: '#fa1b1b', percentage: 0 },
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#6f7ad3', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#5cb87a', percentage: 100 }
]
const isPaste = ref(true)
const emit = defineEmits([
  'submit',
  'add-data',
  'handle-action',
  'selected',
  'view-log'
])
onMounted(() => {
  window.addEventListener('paste', onClipboardFile, false)
  window.addEventListener('keydown', onKeydown, false)
  window.addEventListener('keyup', onKeyup, false)
})
onUnmounted(() => {
  window.removeEventListener('paste', onClipboardFile)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('keyup', onKeyup)
})
const isDragOver = ref(false)
const displayWorkList = computed(() => {
  return [...props.bodyList.values()]
})
const isShowPrompt = computed(() => {
  return displayWorkList.value <= 0
})

const isActiveSubmit = computed(() => {
  return displayWorkList.value.length > 0 && props.isShowSubmit
})

const formatDiffTime = diffTime => {
  const hours = Math.floor(diffTime / (1000 * 60 * 60))
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffTime % (1000 * 60)) / 1000)

  // 格式化为 HH:mm:ss
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':')
}

function onDemonstrate() {
  doodleWorkStore().state.isShowDemonstrateVideo = true
}

const formatTableBodyData = (workTask, key) => {
  if (key === 'submitter') {
    const person = vuexStore.getters.personMap.get(workTask[key])
    return person ? person.first_name : ''
  } else if (key === 'run_time') {
    if (workTask['status'] === 'running' || workTask['status'] === 'updating') {
      if (workTask.computed_time) {
        return workTask.computed_time
      }
      const currentTime = new Date({ timezone: 'UTC' })
      const date = new Date(workTask[key])
      if (currentTime > date) {
        return formatDiffTime(currentTime - date)
      }
      return '00:00:00'
    } else if (
      ['completed', 'failed', 'updated'].includes(workTask['status'])
    ) {
      const date = new Date(workTask[key])
      const end_time = new Date(workTask['end_time'])
      return formatDiffTime(end_time - date)
    }
  } else if (key === 'status') {
    if (i18n.global.tm('doodle_work.task_state'))
      if (workTask['status'] === 'running') {
        return props.runningLabel
          ? i18n.global.t(`doodle_work.task_state.${props.runningLabel}`)
          : i18n.global.t(`doodle_work.task_state.${workTask['status']}`)
      }
    return i18n.global.t(`doodle_work.task_state.${workTask['status']}`)
  } else if (['submit_time', 'end_time'].includes(key)) {
    if (workTask[key] === null || workTask[key] === '') return workTask[key]
    return new Date(workTask[key]).toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai'
    })
  }
  return workTask[key]
}

const handleDragOver = event => {
  event.preventDefault()
  if (!isDragOver.value) {
    isDragOver.value = true
    if (props.isDrop) {
      event.dataTransfer.dropEffect = 'copy'
    } else {
      event.dataTransfer.dropEffect = 'none'
    }
  }
}

const onDrop = event => {
  event.preventDefault()
  if (props.isDrop) {
    isDragOver.value = false
    const files = event.dataTransfer.files
    emit('add-data', files)
  }
}

function onKeydown(event) {
  if (event.key === 'Shift') {
    isShift.value = true
  }
}

function onKeyup(event) {
  if (event.key === 'Shift') {
    isShift.value = false
    shiftStartIndex.value = null
  }
}

function onMouseEnter() {
  isPaste.value = true
  //window.addEventListener('paste', onClipboardFile, false)
}
function onMouseLeave() {
  isPaste.value = false
  //window.removeEventListener('paste', onClipboardFile, false)
}
const onClickBody = (work, key) => {
  if (props.isSelectable) {
    emit('selected', work)
  }
  if (key === 'last_line_log') {
    //handleAction('view-log', work)
    emit('view-log', work)
  }
}

const onClipboardFile = event => {
  if (props.isDrop) {
    isDragOver.value = false
    const clipboardData = event.clipboardData || window.clipboardData
    const files = clipboardData.files
    if (files.length !== 0) {
      emit('add-data', files)
    }
  }
}
const handleAction = (action_name, task_id) => {
  if (props.isSelectable) {
    const tasks = displayWorkList.value.filter(w => w.selected)
    emit('handle-action', action_name, tasks.length > 0 ? tasks : [task_id])
  }
  emit('handle-action', action_name, task_id)
}

function onSelected(work, index) {
  if (isShift.value) {
    if (shiftStartIndex.value !== null) {
      if (shiftStartIndex.value < index) {
        displayWorkList.value
          .slice(shiftStartIndex.value, index + 1)
          .forEach(w => {
            w.selected = displayWorkList.value[shiftStartIndex.value].selected
          })
      } else
        displayWorkList.value
          .slice(index, shiftStartIndex.value + 1)
          .forEach(w => {
            w.selected = displayWorkList.value[shiftStartIndex.value].selected
          })
    } else {
      shiftStartIndex.value = index
      work.selected = !work.selected
    }
  } else {
    work.selected = !work.selected
    shiftStartIndex.value = index
  }
}
</script>

<template>
  <div
    class="datatable-main"
    :class="{ placeholder: isShowPrompt }"
    @drop="onDrop"
    @dragover="handleDragOver"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="doodle-work-placeholder" v-if="isShowPrompt && isDrop">
      <div style="padding: 0 10px">
        {{ $t('video_library.placeholder') }}
      </div>
      <div class="button" @click="onDemonstrate" v-if="isShowDemonstrate">
        功能演示(开发中)
      </div>
    </div>
    <div class="datatable-wrapper" v-if="!isShowPrompt">
      <table class="datatable">
        <thead class="datatable-head">
          <tr class="datatable-row datatable-row-head">
            <th
              scope="col"
              class="name datatable-row-header"
              v-if="isSelectable"
            ></th>
            <th
              class="normal"
              :key="key"
              v-for="(filed, key) in tableHeaderFiled"
            >
              {{ filed.name }}
            </th>
            <th class="action">{{ $t('doodle.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="datatable-row"
            :class="{
              selected: work.selected
            }"
            :key="work.id"
            v-for="(work, index) in displayWorkList"
          >
            <td class="datatable-row-header" v-if="isSelectable">
              <input
                class="input-checkbox"
                type="checkbox"
                v-model="work.selected"
                @click="onSelected(work, index)"
              />
            </td>
            <td
              :key="key"
              :class="{
                pointer: key === 'last_line_log'
              }"
              v-for="(value, key) in tableHeaderFiled"
              @click="onClickBody(work, key)"
            >
              <span
                :title="
                  key === 'last_line_log' ? formatTableBodyData(work, key) : ''
                "
                :class="{
                  error:
                    work[key] === 'failed' ||
                    (key === 'last_line_log' && work['status'] === 'failed'),
                  completed:
                    work[key] === 'completed' || work[key] === 'updated'
                }"
                v-if="value.type === 'string' || value.type === 'number'"
              >
                {{ formatTableBodyData(work, key) }}
              </span>

              <timer-cell
                :task="work"
                v-else-if="value.type === 'time'"
              ></timer-cell>
              <span v-else-if="value.type === 'boolean'">
                <input type="checkbox" v-model="work.task_data[key]" />
              </span>
              <el-progress
                type="dashboard"
                :percentage="Math.floor(work.progress * 100) || 0"
                :color="colors"
                :width="100"
                v-else-if="value.type === 'progress'"
              />
              <color-picker
                :color="work[key]"
                v-else-if="value.type === 'color'"
              />
              <div v-else-if="value.type === 'list'">
                <span :key="item" v-for="(item, index) in work[key]">{{
                  index !== work[key].length - 1 ? item + ',' : item
                }}</span>
              </div>
            </td>
            <td class="action">
              <a
                class="action_item"
                :class="{
                  button: true
                }"
                v-if="isShowViewLog"
                @click="handleAction('view-log', work)"
                >{{ $t('doodle_work.view_log') }}</a
              >
              <a
                class="action_item"
                :class="{
                  button: true
                }"
                v-if="isShowCancel"
                @click="handleAction('cancel-task', work)"
                >{{ $t('main.cancel') }}</a
              >
              <a
                class="action_item"
                :class="{
                  button: true
                }"
                v-if="isShowDelete"
                @click="handleAction('delete-task', work)"
                >{{ $t('video_library.delete') }}
              </a>

              <a
                :class="{
                  button: true
                }"
                @click="handleAction('restart', work)"
                v-if="isShowRestart"
                >{{ $t('doodle_work.restart') }}</a
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="has-text-right" v-if="isActiveSubmit">
      <a
        :class="{
          button: true
        }"
        @click="$emit('submit')"
      >
        {{ props.name }}
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.datatable-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 2em;
  border-radius: 5px;
  border: 1px solid #00b89c;
  max-height: 80%;
  width: 100%;
}

.datatable {
  border-radius: 5px;
  margin-bottom: 1px;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  width: 100%;
  color: #bdbdbd;
}

.doodle-work-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.datatable-row-head {
  &:first-child {
    th:first-child {
      border-top-left-radius: 10px;
    }

    th:last-child {
      border-top-right-radius: 10px;
    }
  }

  th {
    color: var(--text-alt);
    font-size: 1rem;
    background-color: var(--background-selected);
    border-bottom: 0;
  }
}
.color-picker {
  width: 10px;
  height: 10px;
}

.datatable-wrapper {
  border-radius: 5px;
  width: 100%;
}

tr {
  max-height: 50px; /* 限制行的最大高度 */
}

.datatable-row {
  overflow: hidden;
  max-height: 10px;
  min-height: 0;
  height: 10px;

  &:hover {
    background-color: var(--background-selectable) !important;
  }

  td {
    max-width: 350px;
    max-height: 50px;
    //white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .action {
    text-overflow: initial;
    //min-width: 220px;
  }
}

.action_item {
  margin-right: 0.5em;
}

.completed {
  color: $green;
}
</style>
