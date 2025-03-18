<script setup>
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'
import TextField from '@/components/widgets/TextField.vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

defineProps(['active', 'isError', 'isLoading'])
const emit = defineEmits(['cancel', 'confirm'])
const startEpisodesError = ref(false)
const endEpisodesError = ref(false)
const form = ref({
  name: 'EP',
  description: null,
  start_episodes: null,
  end_episodes: null,
  data: {
    resolution: ''
  }
})
const onConfirm = () => {
  if (form.value.start_episodes < form.value.end_episodes) {
    emit('confirm', form.value)
  } else {
    ElMessage.error('请检查集数是否符合规则')
  }
}
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
          {{ $t('sequences.new_sequence') }}
        </h1>

        <form @submit.prevent>
          <text-field
            :errored="startEpisodesError"
            type="number"
            ref="nameField"
            :label="$t('sequences.fields.start_episodes')"
            v-model="form.start_episodes"
            @input="
              () => {
                startEpisodesError =
                  form.end_episodes === null
                    ? false
                    : form.start_episodes >= form.end_episodes
                if (form.start_episodes < form.end_episodes)
                  endEpisodesError = false
              }
            "
            v-focus
          />
          <text-field
            :errored="endEpisodesError"
            type="number"
            ref="nameField"
            :label="$t('sequences.fields.end_episodes')"
            v-model="form.end_episodes"
            @input="
              () => {
                endEpisodesError = !(form.start_episodes < form.end_episodes)
                if (form.start_episodes < form.end_episodes)
                  startEpisodesError = false
              }
            "
            v-focus
          />
          <text-field
            :class="{ error: true }"
            ref="resolutionField"
            :label="$t('shots.fields.resolution')"
            v-model="form.data.resolution"
          />
          <textarea-field
            ref="descriptionField"
            :label="$t('sequences.fields.description')"
            v-model="form.description"
          />
        </form>

        <modal-footer
          :error-text="$t('sequences.edit_error')"
          :is-loading="isLoading"
          @confirm="onConfirm"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-content .box p.text {
  margin-bottom: 1em;
}

.is-danger {
  color: #ff3860;
  font-style: italic;
}

.number-error {
  input.input.flexrow-item {
    color: red;
  }
}

.info-message {
  margin-top: 1em;
}
</style>
