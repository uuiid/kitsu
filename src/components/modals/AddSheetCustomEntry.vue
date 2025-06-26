<script setup>
import productions from '@/store/modules/productions.js'
import { ref, reactive, onMounted, watch } from 'vue'
import { zhCn } from 'element-plus/es/locale/index'
import { CircleX, ArrowUpDown } from 'lucide-vue-next'

defineProps({
  active: { type: Boolean, default: false }
})
const isInitInputs = ref(false)
const isShowProjectIcon = ref(false)
const inputs = reactive({
  project_id: {
    value: '',
    type: 'list',
    option: productions.state.openProductions,
    required: true
  },
  season: { value: null, type: 'number', placeholder: '', required: true },
  episode: { value: null, type: 'number', placeholder: '', required: true },
  name: { value: '', type: '', placeholder: '', required: true },
  grade: { value: '', type: '', placeholder: '选填', required: false },
  user_remark: { value: '', type: '', required: false, placeholder: '选填' },
  start_time: { value: '', type: 'date', required: true },
  end_time: { value: '', type: 'date', required: true }
})
const emit = defineEmits(['cancel', 'on-confirm'])
const formatDate = date => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从 0 开始，需要加 1
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const inspectInputs = () => {
  const outputs = {}
  let isOutput = true
  for (const input in inputs) {
    if (inputs[input].value || !inputs[input].required) {
      if (inputs[input].type === 'date') {
        outputs[input] = formatDate(inputs[input].value)
      } else if (inputs[input].type === 'number') {
        outputs[input] = Number(inputs[input].value)
      } else if (input === 'project_id' && inputs[input].type === '') {
        outputs['project_name'] = inputs[input].value
      } else outputs[input] = inputs[input].value
    } else {
      inputs[input].error = true
      isOutput = false
    }
  }
  if (isOutput) {
    isInitInputs.value = true
    for (const input in inputs) {
      inputs[input].value = ''
    }
  }
  return isOutput ? outputs : isOutput
}

const confirmInputs = () => {
  const output = inspectInputs()
  if (output) {
    emit('on-confirm', output)
  }
}

onMounted(() => {
  //console.log(productions.state.openProductions)
})

watch(
  () => inputs.start_time.value, // 监视整个 start_time 对象
  () => {
    if (!isInitInputs.value) {
      if (inputs.end_time.value) {
        inputs.start_time.error =
          inputs.end_time.value < inputs.start_time.value
        inputs.end_time.error = inputs.end_time.value < inputs.start_time.value
      }
      inputs.start_time.error = !inputs.start_time.value
    }
    // 在这里执行你的逻辑
  },
  { deep: true } // 启用深层监视
)
watch(
  () => inputs.end_time.value, // 监视整个 start_time 对象
  () => {
    if (!isInitInputs.value) {
      if (inputs.end_time.value) {
        inputs.start_time.error =
          inputs.end_time.value < inputs.start_time.value
        inputs.end_time.error = inputs.end_time.value < inputs.start_time.value
      } else {
        inputs.end_time.error = true
      }
    } else {
      isInitInputs.value = false
    }
    // 在这里执行你的逻辑
  },
  { deep: true } // 启用深层监视
)
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle.add_custom_entry') }}
        </h1>
        <el-config-provider :locale="zhCn">
          <el-form-item
            class="form-item"
            :class="{ error: input.error }"
            :key="key"
            :label="$t(`doodle.${key}`)"
            :required="input.required"
            :label-width="120"
            v-for="(input, key) in inputs"
            @mouseenter="
              key === 'project_id' ? (isShowProjectIcon = true) : false
            "
            @mouseleave="
              key === 'project_id' ? (isShowProjectIcon = false) : false
            "
          >
            <el-select
              v-model="input.value"
              :placeholder="$t('library.select_production')"
              style="width: 350px"
              clearable
              v-if="input.type === 'list'"
              @change="input.error = false"
            >
              <el-option
                v-for="item in productions.state.openProductions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-input
              type="number"
              style="width: 350px"
              v-model="input.value"
              v-else-if="input.type === 'number'"
              @input="input.error = !input.value"
            />
            <el-date-picker
              :class="{ error: input.error }"
              v-model="input.value"
              type="datetime"
              style="width: 350px"
              v-else-if="input.type === 'date'"
            />
            <el-input
              style="width: 350px"
              v-model="input.value"
              :placeholder="input.placeholder"
              v-else
              @input="input.error = input.required ? !input.value : false"
            />
            <div style="min-width: 15px" v-show="!input.error" />
            <circle-x
              class="circle-x"
              style="min-width: 15px"
              size="15"
              v-show="input.error"
            ></circle-x>
            <div
              :title="input.type === '' ? '切换项目列表' : '自定义项目名称'"
              @click="
                input.type === '' ? (input.type = 'list') : (input.type = '')
              "
              v-if="key === 'project_id'"
              v-show="isShowProjectIcon"
            >
              <arrow-up-down class="arrow-up-down" size="15" />
            </div>
          </el-form-item>
        </el-config-provider>
        <div class="has-text-right">
          <a
            :class="{
              button: true,
              'is-primary': true
            }"
            @click="confirmInputs"
          >
            {{ $t('main.confirmation') }}
          </a>
          <button class="button is-link" @click="$emit('cancel')">
            {{ $t('main.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-content {
  min-width: 650px;
  max-width: 650px;
}

.form-item {
  display: flex;
  font-size: 15px;
  gap: 5px;
}

.error {
  ::v-deep(input) {
    color: red;
  }
}

.circle-x {
  margin-left: 5px;
}

.arrow-up-down {
  cursor: pointer;
  &:hover {
    color: #6bacea;
  }
}
</style>
