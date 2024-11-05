<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background-box"></div>
    <div class="modal-content">
      <div class="box">
        <div class="title">
          {{ $t('video_library.warning') }}
        </div>
        <div class="text-box">还有关联素材或子集未删除</div>
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

export default {
  name: 'message-box',

  mixins: [modalMixin],

  components: {},

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
    ...mapGetters(['editVideo'])
  },

  methods: {
    ...mapActions([]),

    onCancel() {
      this.$emit('cancel')
    },
    confirmClicked() {
      this.$emit('onConfirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
}

.modal-background-box {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  background-color: rgba(10, 10, 10, 0.2);
}

.box {
  padding: 1em;
}

.title {
  font-size: 20px;
  color: $red;
}

.text-box {
  text-align: center;
  font-size: 30px;
  margin-bottom: 30px;
}

.is-danger {
  color: #ff3860;
  font-style: italic;
}

.info-message {
  margin-top: 1em;
}
</style>
