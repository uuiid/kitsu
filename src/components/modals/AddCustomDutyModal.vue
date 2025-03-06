<script setup>
import productions from '@/store/modules/productions.js'
import { ref, reactive, onMounted, watch } from 'vue'
import { zhCn } from 'element-plus/es/locale/index'
import { CircleX } from 'lucide-vue-next'

defineProps({
  active: { type: Boolean, default: false }
})
const isInitInputs = ref(false)
const inputs = reactive({
  type: {
    value: '',
    type: 'list',
    options: [{ id: 'overtime' }, { id: 'leave' }],
    required: true
  },
  start_time: { value: '', type: 'date', required: true },
  end_time: { value: '', type: 'date', required: true },
  remark: { value: '', type: '', required: true }
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
    output['create_date'] = output.start_time.slice(0, 10)
    emit('on-confirm', output)
  }
}

onMounted(() => {
  console.log(productions.state.openProductions)
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
          {{ $t('doodle.add_custom_duty') }}
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
          >
            <el-select
              v-model="input.value"
              :placeholder="$t('doodle.select_type')"
              style="width: 350px"
              clearable
              v-if="input.type === 'list'"
              @change="input.error = false"
            >
              <el-option
                v-for="item in input.options"
                :key="item.id"
                :label="$t(`doodle.${item.id}`)"
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
            <circle-x
              class="circle-x"
              size="15"
              v-show="input.error"
            ></circle-x>
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
</style>
