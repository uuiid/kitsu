<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  isDrop: { type: Boolean, default: false },
  isShowSubmit: { type: Boolean, default: false },
  tableHeaderFiled: {
    type: Object,
    default: () => {}
  },
  bodyList: { type: Array, default: () => [] },
  isShowViewLog: { type: Boolean, default: false }
})
const emit = defineEmits(['submit', 'add-data', 'remove-data', 'view-log'])
const isDragOver = ref(false)
const displayWorkList = computed(() => {
  return props.bodyList
})
const isShowPrompt = computed(() => {
  return displayWorkList.value <= 0
})

const isActiveSubmit = computed(() => {
  return displayWorkList.value.length > 0 && props.isShowSubmit
})
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
    const data = []
    files.forEach(file => {
      if (file.name.endsWith('.ma')) {
        data.push({
          name: file.name,
          status: '等待',
          source_computer: '本机',
          submitter: '本机',
          run_computer_id: '本机',
          task_data: {
            create_play_blast: true
          }
        })
      }
    })
    emit('add-data', data)
  }
}
const handleRemove = index => {
  emit('remove-data', index)
}
</script>

<template>
  <div
    class="datatable-main"
    :class="{ placeholder: isShowPrompt }"
    @drop="onDrop"
    @dragover="handleDragOver"
  >
    <div v-if="isShowPrompt">
      {{ $t('video_library.placeholder') }}
    </div>
    <div class="datatable-wrapper" v-if="!isShowPrompt">
      <table class="datatable">
        <thead class="datatable-head">
          <tr class="datatable-row datatable-row-head">
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
            :key="work.name"
            v-for="(work, index) in displayWorkList"
          >
            <td :key="key" v-for="(value, key) in tableHeaderFiled">
              <span v-if="value.type === 'string'">
                {{ work[key] }}
              </span>
              <span v-else-if="value.type === 'boolean'">
                <input type="checkbox" v-model="work.task_data[key]" />
              </span>
            </td>
            <td class="action">
              <a
                class="action_item"
                :class="{
                  button: true
                }"
                @click="handleRemove(index)"
                >{{ $t('video_library.delete') }}</a
              >
              <a
                :class="{
                  button: true
                }"
                @click="emit('view-log', index)"
                v-if="isShowViewLog"
                >{{ $t('doodle_work.view_log') }}</a
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
        @click="$emit('submit', displayWorkList)"
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

.datatable-row {
  overflow: hidden;

  &:hover {
    background-color: var(--background-selectable) !important;
  }

  td {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.action_item {
  margin-right: 0.5em;
}
</style>
