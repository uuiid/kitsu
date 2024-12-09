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
          {{ $t('video_library.new_video') }}
        </h1>
        <label class="label">{{ $t('video_library.video_source_file') }}</label>
        <list-view
          ref="video"
          :any-file-type="true"
          :errored="form.video_errored"
          @set-error="value => (form.video_errored = value)"
          @custom-events="getFiles"
        >
        </list-view>
        <label class="label">{{ $t('video_library.thumbnail') }}</label>
        <list-view
          ref="image"
          :is-active-text="true"
          :is-active-image="true"
          :errored="form.image_errored"
          @set-error="value => (form.image_errored = value)"
        >
        </list-view>
        <form @submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('assets.fields.name')"
            :errored="form.name_errored"
            :error-text="form.name_error_text"
            @input="form.name_errored = false"
            v-model="videoToCreat.label"
            v-focus
          />
          <text-field
            ref="typeField"
            :label="$t('assets.fields.type')"
            :readonly="true"
            :model-value="videoType"
          />
          <textarea-field
            ref="descriptionField"
            :label="$t('assets.fields.description')"
            v-model="videoToCreat.notes"
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
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'
import ListView from '@/components/widgets/ListView.vue'

export default {
  name: 'edit-video-library-modal',

  mixins: [modalMixin],

  components: {
    TextField,
    ListView,
    TextareaField
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
  emits: ['on-confirm', 'cancel'],

  data() {
    return {
      form: {
        image_errored: false,
        video_errored: false,
        name: '',
        name_errored: false,
        name_error_text: '',
        description: '',
        source_id: null
      },
      assetSuccessText: '',
      //editVideos:[], /*{"label": "string","parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef","id": "497f6eca-6276-4993-bfeb-53cbbbba6f08","path": "string",notes": "string","active": true}*/
      videoToCreat: {
        id: '',
        label: '',
        path: '',
        type: this.videoType,
        notes: '',
        parent_id: this.videoTypeId,
        active: true
      }
    }
  },

  mounted() {
    this.assetSuccessText = ''
  },

  computed: {
    ...mapGetters(['editVideo'])
  },

  methods: {
    ...mapActions([]),

    getFiles(files) {},

    onCancel() {
      this.$emit('cancel')
    },

    checkData() {
      if (!this.videoToCreat.label) {
        this.form.name_errored = true
        this.form.name_error_text = '空'
      }
      if (this.$refs.video.videos.length === 0) {
        this.form.video_errored = true
        this.form.video_error_text = '空'
      }

      if (this.$refs.image.images.length === 0) {
        this.form.image_errored = true
        this.form.image_error_text = '空'
      }
    },

    confirmClicked() {
      this.checkData()
      if (
        !(
          this.form.name_errored &&
          this.form.image_errored &&
          this.form.image_errored
        )
      ) {
        this.videoToCreat.parent_id = this.videoTypeId
        this.videoToCreat.path = this.$refs.video.videos[0].path
        this.videoToCreat.has_thumbnail = true
        this.videoToCreat.extension = this.$refs.video.videos[0].type
        this.videoToCreat.upimage = this.$refs.image.images[0]
        this.$emit('on-confirm', this.videoToCreat)
        this.clearData()
      }
    },
    clearData() {
      this.videoToCreat = {
        id: '',
        label: '',
        path: '',
        type: this.videoType,
        notes: '',
        parent_id: this.videoTypeId,
        active: true
      }
      this.$refs.image.init()
      this.$refs.video.init()
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
