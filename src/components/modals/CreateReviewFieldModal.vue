<script setup>
import { updateTaskFilesStore } from '@/store/modules/updatetaskfiles.js'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import sequencesStore from '@/store/modules/sequences.js'
import tasksStore from '@/store/modules/tasks.js'
const updateTaskFiles = updateTaskFilesStore()
const props = defineProps({
  sequencesOptions: {
    type: Array,
    default: () => []
  },
  sequenceId: {
    type: String,
    default: ''
  },
  selectableDepartments: {
    type: Array,
    default: () => []
  },
  playlists: {
    type: Object,
    default: () => {}
  }
})
const selectedSequenceId = ref('')
const selectedDepartment = ref('')
const isLoading = ref(false)
const formData = reactive({
  add_subtitle: false,
  add_dubbing: false,
  add_name: false,
  add_head_tail: false,
  add_watermark: false,
  add_time_code: false
})
const emit = defineEmits(['update-sequence-id', 'update-department'])

const onSequenceChange = value => {
  emit('update-sequence-id', value)
}
const onDepartmentChange = value => {
  emit('update-department', value)
}
async function submitCreateReview() {
  isLoading.value = true
  const sequence = sequencesStore.cache.sequenceMap.get(
    selectedSequenceId.value
  )

  const task = tasksStore.state.taskMap.get(
    sequence.tasks.find(
      task =>
        tasksStore.state.taskMap.get(task).task_type_id ===
        selectedDepartment.value
    )
  )
  if (task) {
    try {
      await updateTaskFiles.actions.createReview(
        props.playlists,
        task,
        formData
      )
      updateTaskFiles.state.isShowCreateReviewFieldModal = false
    } catch (e) {
      isLoading.value = false
    }
  } else ElMessage.error('任务不存在')
  isLoading.value = false
}
onMounted(() => {
  selectedSequenceId.value = props.sequenceId
})
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': updateTaskFiles.state.isShowCreateReviewFieldModal
    }"
  >
    <div
      class="modal-background"
      @click="updateTaskFiles.state.isShowCreateReviewFieldModal = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle.create_review') }}
        </h1>
        <div class="task-data-filed">
          <div class="interval-select">
            <combobox-styled
              class="combobox-styled flexrow-item"
              :options="sequencesOptions"
              :max-height="'280px'"
              v-model="selectedSequenceId"
              @change="onSequenceChange"
            />
            <combobox-department
              class="combobox-department flexrow-item"
              :selectable-departments="selectableDepartments"
              rounded
              :model-value="
                selectableDepartments.length > 0
                  ? selectableDepartments[0].id
                  : ''
              "
              v-model="selectedDepartment"
              @change="onDepartmentChange"
            />
          </div>
          <div class="interval">
            <div
              class="project-list"
              :key="key"
              v-for="(value, key) in formData"
            >
              <div class="project-list-item">
                <span style="width: 150px">{{ $t(`doodle.${key}`) }}</span>
                <input
                  class="input-checkbox"
                  :value="value"
                  type="checkbox"
                  v-model="formData[key]"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="has-text-right">
          <button-simple
            :is-loading="isLoading"
            text="创建"
            @click="submitCreateReview"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.task-data-filed {
  display: flex;
  flex-direction: column;
  min-height: 30px;
  gap: 1em;
}
.project-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
.interval {
  display: flex;
  flex-direction: column;
  gap: 1em;
  font-size: 15px;
}
.interval-select {
  display: flex;
  flex-direction: row;
  gap: 1em;
  font-size: 15px;
  height: 100%;
}
</style>
