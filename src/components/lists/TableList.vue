<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import i18n from '@/lib/i18n.js'
import TimerCell from '@/components/cells/TimerCell.vue'

const vuexStore = useStore()
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
  isSelectable: { type: Boolean, default: false }
})
const colors = [
  { color: '#fa1b1b', percentage: 0 },
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#6f7ad3', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#5cb87a', percentage: 100 }
]
const emit = defineEmits(['submit', 'add-data', 'handle-action', 'selected'])
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
  console.log('test')
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
      const currentTime = new Date()
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

const onClickBody = (work, key) => {
  if (props.isSelectable) {
    emit('selected', work)
  }
  if (key === 'last_line_log') {
    handleAction('view-log', work)
  }
}

const onClipboard = event => {
  event.preventDefault()
  if (props.isDrop) {
    isDragOver.value = false
    const clipboardData = event.clipboardData || window.clipboardData
    const files = clipboardData.files
    emit('add-data', files)
  }
}
const handleAction = (action_name, task_id) => {
  emit('handle-action', action_name, task_id)
}
</script>

<template>
  <div
    class="datatable-main"
    :class="{ placeholder: isShowPrompt }"
    @drop="onDrop"
    @dragover="handleDragOver"
    @paste="onClipboard"
  >
    <div class="doodle-work-placeholder" v-if="isShowPrompt && isDrop">
      <div style="padding: 0 10px">
        {{ $t('video_library.placeholder') }}
      </div>
      <div class="button" @click="onDemonstrate">功能演示(开发中)</div>
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
            v-for="work in displayWorkList"
          >
            <td class="datatable-row-header" v-if="isSelectable">
              <input
                class="input-checkbox"
                type="checkbox"
                v-model="work.selected"
                @click="work.selected = !work.selected"
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
                v-if="value.type === 'string'"
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
            </td>
            <td class="action">
              <a
                class="action_item"
                :class="{
                  button: true
                }"
                v-if="isShowViewLog"
                @click="handleAction('cancel-task', work)"
                >{{ $t('main.cancel') }}</a
              >
              <el-popconfirm
                :confirm-button-text="$t('main.confirmation')"
                :cancel-button-text="$t('main.cancel')"
                :title="$t('doodle_work.is_sure_delete')"
                @confirm="handleAction('remove-task', work)"
              >
                <template #reference>
                  <a
                    class="action_item"
                    :class="{
                      button: true
                    }"
                    >{{ $t('video_library.delete') }}</a
                  >
                </template>
              </el-popconfirm>
              <a
                :class="{
                  button: true
                }"
                @click="handleAction('restart', work)"
                v-if="isShowViewLog"
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

.datatable-wrapper {
  border-radius: 5px;
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
