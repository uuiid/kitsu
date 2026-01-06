<script setup>
import { updateTaskFilesStore } from '@/store/modules/updatetaskfiles.js'
import { reactive, ref } from 'vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
const updateTaskFiles = updateTaskFilesStore()
const isLoading = ref(false)
const formData = reactive({
  add_subtitle: false,
  add_dubbing: false,
  add_name: false,
  add_head_tail: false,
  add_watermark: false,
  add_time_code: false
})
async function submitCreateReview() {
  isLoading.value = true
  if (updateTaskFiles.state.selectedTask) {
    try {
      await updateTaskFiles.actions.createReview(
        updateTaskFiles.state.selectedTask.task,
        formData
      )
      updateTaskFiles.state.isShowCheckReviewModal = false
    } catch (e) {
      isLoading.value = false
    }
  }
  isLoading.value = false
}
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
  min-height: 30px;
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
</style>
