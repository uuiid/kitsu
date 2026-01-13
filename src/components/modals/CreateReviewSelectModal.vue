<script setup>
import { updateTaskFilesStore } from '@/store/modules/updatetaskfiles.js'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
const updateTaskFiles = updateTaskFilesStore()
defineProps({
  sequencesOptions: {
    type: Array,
    default: () => []
  },
  sequenceId: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  selectableDepartments: {
    type: Array,
    default: () => []
  },
  selectedDepartment: {
    type: String,
    default: ''
  }
})
const emit = defineEmits([
  'update-sequence-id',
  'submit-create-review',
  'update-department'
])

const onSequenceChange = value => {
  emit('update-sequence-id', value)
}
const onDepartmentChange = value => {
  emit('update-department', value)
}
async function submitCreateReview() {
  emit('submit-create-review')
}
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': updateTaskFiles.state.isShowCreateReviewSelectModal
    }"
  >
    <div
      class="modal-background"
      @click="updateTaskFiles.state.isShowCreateReviewSelectModal = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle.create_review') }}
        </h1>
        <div class="task-data-filed">
          <div class="interval">
            <combobox-styled
              class="combobox-styled flexrow-item"
              :options="sequencesOptions"
              :model-value="sequenceId"
              :max-height="'280px'"
              @change="onSequenceChange"
            />
            <combobox-department
              class="combobox-department flexrow-item"
              :selectable-departments="selectableDepartments"
              :display-all-and-my-departments="true"
              rounded
              :model-value="selectedDepartment"
              @change="onDepartmentChange"
            />
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
  min-height: 30px;
}
.modal {
  min-height: 900px;
}
.box {
  min-height: 600px;
}
.project-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
.interval {
  display: flex;
  flex-direction: row;
  gap: 1em;
  font-size: 15px;
  height: 100%;
}
.has-text-right {
  position: absolute;
  bottom: 30px;
  right: 30px;
}
</style>
