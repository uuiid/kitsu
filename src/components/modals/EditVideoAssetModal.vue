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
          {{ $t('assets.edit_title') }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('video_library.new_video') }}
        </h1>
        <form @submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('assets.fields.name')"
            v-model="asset_to_import.label"
          />
        </form>
        <label class="label">{{ $t('video_library.thumbnail') }}</label>
        <list-view
          ref="image"
          :is-active-image="true"
          :errored="form.image_errored"
          :asset-to-edit="asset_to_import"
          @setError="value => (form.image_errored = value)"
          @customEvents="getFiles"
        ></list-view>
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
import { modalMixin } from '@/components/modals/base_modal'
import TextField from '@/components/widgets/TextField.vue'
import ListView from '@/components/widgets/ListView.vue'

export default {
  name: 'edit-video-asset-modal',

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
    }
  },

  data() {
    return {
      form: {
        image_errored: false,
        name_error_text: '',
        source_id: null
      },
      asset_to_import: {},
      assetSuccessText: ''
      //editVideos:[], /*{"label": "string","parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef","id": "497f6eca-6276-4993-bfeb-53cbbbba6f08","path": "string",notes": "string","active": true}*/
    }
  },
  mounted() {
    this.assetSuccessText = ''
  },

  computed: {},

  methods: {
    getFiles(files) {},

    onCancel() {
      this.$emit('cancel')
      this.$refs.image.isShow = true
    },

    checkData(datas) {
      if (datas.length !== 0) {
        this.form.image_errored = true
      }
    },
    confirmClicked() {
      this.checkData(this.$refs.image.images)
      this.asset_to_import.upimage = this.$refs.image.images[0]
      this.asset_to_import.has_thumbnail = this.assetToEdit.has_thumbnail
      if (this.form.image_errored) {
        this.asset_to_import.has_thumbnail = true
      }
      this.$emit('onConfirm', this.asset_to_import)
    }
  },
  watch: {
    assetToEdit(value) {
      this.asset_to_import = Object.assign({}, value)
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

.list-view {
  min-height: 150px;
}

.info-message {
  margin-top: 1em;
}
</style>
