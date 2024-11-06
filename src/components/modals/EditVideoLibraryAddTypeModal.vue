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
        <h1 class="title" v-if="assetToEdit && assetToEdit.id">
          {{ $t('assets.edit_title') }} {{ assetToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('video_library.new_video_type') }}
        </h1>
        <form @submit.prevent>
          <text-field
            ref="typeField"
            :label="$t('video_library.current_parent_type')"
            :readonly="true"
            v-model="videoTypeToCreat.type"
          />
          <text-field
            ref="nameField"
            :label="$t('assets.fields.name')"
            v-model="videoTypeToCreat.label"
            v-focus
          />
        </form>
        <div class="has-text-right">
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isLoading
            }"
            @click="confirmClicked"
          >
            {{ $t('main.confirmation') }}
          </a>
          <button class="button is-link" @click="onCancel">
            {{ $t('main.close') }}
          </button>
          <p class="error has-text-right info-message" v-if="isError">
            {{ $t('assets.edit_fail') }}
          </p>
          <p class="success has-text-right info-message" v-if="isSuccess">
            {{ assetSuccessText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-video-library-add-type-modal',
  components: {
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingStay: {
      type: Boolean,
      default: false
    },
    isSuccess: {
      type: Boolean,
      default: false
    },
    assetToEdit: {
      type: Object,
      default: () => {}
    },
    videoType: {
      type: String,
      default: ''
    },
    videoTypeId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      form: {
        name: '',
        description: '',
        source_id: null,
        data: {
          resolution: ''
        },
        is_shared: 'false'
      },
      assetSuccessText: '',
      videoTypeToCreat: {
        id: '',
        label: '',
        type: this.videoType,
        parent_id: this.videoTypeId,
        isOpen: false,
        isSelect: false
      }
    }
  },

  mounted() {
    this.assetSuccessText = ''
  },

  computed: {
    resolution() {
      return this.assetToEdit.data?.resolution || ''
    }
  },

  methods: {
    getFiles(files) {},
    onCancel() {
      this.$emit('cancel')
    },

    confirmClicked() {
      if (this.videoTypeToCreat.label) {
        if (this.videoTypeId === 'all') {
          this.videoTypeToCreat.parent_id = ''
        } else {
          this.videoTypeToCreat.parent_id = this.videoTypeId
        }
        this.$emit('onConfirm', this.videoTypeToCreat)
        this.clearData()
      }
    },
    clearData() {
      this.videoTypeToCreat = {
        id: '',
        label: '',
        type: this.videoType,
        parent_id: this.videoTypeId,
        isOpen: false,
        isSelect: false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.is-danger {
  color: #ff3860;
  font-style: italic;
}

.info-message {
  margin-top: 1em;
}
</style>
