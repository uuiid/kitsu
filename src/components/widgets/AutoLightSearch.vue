<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'

const tableHeadFiled = [
  {
    id: 'base_path',
    name: '基本路径',
    type: 'path'
  },
  {
    id: 'ue_file',
    name: 'ue路径',
    type: 'path'
  },
  {
    id: 'maya_file',
    name: 'maya rig路径',
    type: 'path'
  },
  {
    id: 'solve_file_',
    name: '解算路径',
    type: 'path'
  }
]

const props = defineProps({
  name: { type: String, default: '' },
  runningLabel: { type: String, default: '' },
  isShowSubmit: { type: Boolean, default: false },
  tableHeaderFiled: {
    type: Object,
    default: () => {}
  },
  bodyList: { type: Array, default: () => [] },
  isShowViewLog: { type: Boolean, default: false },
  isSelectable: { type: Boolean, default: false },
  isShowDemonstrate: { type: Boolean, default: false },
  isShowRestart: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'add-data'])
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

function formatTbodyData(asset, key) {
  if (['ue_file', 'maya_file', 'solve_file_'].includes(key))
    return asset[key]?.length > 1 ? asset[key] : `未找到路径`
  else if (key === 'assets_type')
    return (
      this.openProductions.filter(product => {
        return product.id === asset.project_id
      })[0].name +
      '/' +
      this.assetTypes.filter(type => {
        return type.id === asset.assets_type
      })[0].name
    )
  else return asset[key]
}

const onClipboard = async event => {
  event.preventDefault()
  isDragOver.value = false
  const clipboardData = event.clipboardData || window.clipboardData
  const text = clipboardData.getData('text')
  const texts = text.split('\n')
  const fs = require('fs')

  const data = []
  for (const item of texts) {
    const dirs = fs.readdirSync(item)
    let doodle_flag = ''
    for (const dir of dirs) {
      if (dir.endsWith('.doodle_flag')) {
        const filePath = `${item}\\${dir}`
        const task_id = fs.readFileSync(filePath).toString()
        try {
          doodle_flag = await doodleWorkStore().actions.getDoodleFlags(task_id)
        } catch (error) {
          doodle_flag = ''
        }
      }
    }
    let maya_file = ''
    let solve_file = ''
    let ue_file = ''
    if (doodle_flag !== '') {
      maya_file = doodle_flag.maya_file
      solve_file = doodle_flag.solve_file_
      ue_file = doodle_flag.ue_file
    }
    let is_error = false
    if (maya_file === '' || solve_file === '' || ue_file === '') is_error = true
    data.push({
      is_error: is_error,
      base_path: item,
      maya_file: maya_file,
      name: '',
      solve_file_: solve_file,
      ue_file: ue_file
    })
  }

  emit('add-data', data)
}
onMounted(() => {
  document.addEventListener('paste', onClipboard)
})
onUnmounted(() => {
  document.removeEventListener('paste', onClipboard)
})
</script>

<template>
  <div
    class="datatable-main"
    :class="{ placeholder: isShowPrompt }"
    @paste="onClipboard"
    v-focus
  >
    <div class="doodle-work-placeholder" v-if="isShowPrompt">
      <div style="padding: 0 10px">
        {{ $t('video_library.placeholder') }}
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
              v-for="(filed, key) in tableHeadFiled"
            >
              {{ filed.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="datatable-row"
            :key="asset.id"
            v-for="asset in displayWorkList"
          >
            <td
              class=""
              :class="{
                name: filed.type === 'string',
                number_f: filed.type === 'number',
                path: filed.type === 'path',
                'error-text': asset[filed.id]?.length < 1
              }"
              :key="asset.id + filed.id"
              v-for="filed in tableHeadFiled"
            >
              {{ formatTbodyData(asset, filed.id) }}
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

.error-text {
  color: $red;
}
</style>
