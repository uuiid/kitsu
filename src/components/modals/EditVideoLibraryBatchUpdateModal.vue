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
        <form @submit.prevent>
          <text-field
            ref="typeField"
            :label="$t('assets.fields.type')"
            :readonly="true"
            :value="videoType"
          />
        </form>
        <label class="label">{{ $t('video_library.video_source_file') }}</label>
        <list-view
          ref="video"
          :is-active-file="true"
          :errored="form.video_errored"
          @set-error="value => (form.video_errored = value)"
          @custom-events="getFiles"
        ></list-view>
        <div class="has-text-right">
          <a
            :class="{
              button: true,
              'is-primary': false,
              'is-loading': isLoading
            }"
            @click="clearData"
          >
            {{ $t('video_library.clear_list') }}
          </a>
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isUpdatingVideo
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
import ListView from '@/components/widgets/ListView.vue'

export default {
  name: 'edit-video-library-batch-update-modal',

  mixins: [modalMixin],

  components: {
    TextField,
    ListView
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
        video_errored: false,
        name_error_text: '',
        source_id: null
      },
      assetSuccessText: ''
      //editVideos:[], /*{"label": "string","parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef","id": "497f6eca-6276-4993-bfeb-53cbbbba6f08","path": "string",notes": "string","active": true}*/
    }
  },

  mounted() {
    this.assetSuccessText = ''
  },

  computed: {
    ...mapGetters(['editVideo', 'isUpdatingVideo'])
  },

  methods: {
    ...mapActions([]),

    getFiles(files) {},

    onCancel() {
      this.$emit('cancel')
    },

    checkData(datas) {
      if (datas.length === 0) {
        this.form.video_errored = true
        this.form.video_error_text = '空'
      }
    },
    formatFiles(files) {
      files.forEach(file => {
        file.label = file.name
        file.parent_id = this.videoTypeId
        file.active = true
        file.notes = ''
      })
    },
    async confirmClicked() {
      this.checkData(this.$refs.video.files)
      if (!this.form.video_errored) {
        this.formatFiles(this.$refs.video.files)
        this.$emit('on-confirm', this.$refs.video.files)
      }
    },
    clearData() {
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
