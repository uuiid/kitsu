<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="chevron chevron-left">
      <chevron-left-icon
        :size="30"
        @click="onSwitchImage(false)"
      ></chevron-left-icon>
    </div>
    <div class="chevron chevron-right">
      <chevron-right-icon
        :size="30"
        @click="onSwitchImage(true)"
      ></chevron-right-icon>
    </div>
    <div class="modal-background" @click="onCancel()"></div>
    <div class="modal-content" @click="onCancel()">
      <img :src="previewPath" alt="" />
    </div>
    <div class="prompt" :class="{ 'prompt-animation': isPrompt }">
      <span>{{ prompt }}</span>
    </div>
  </div>
</template>

<script>
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

import { getDownloadAttachmentPath } from '@/lib/path'

import { modalMixin } from '@/components/modals/base_modal'

export default {
  name: 'image-preview-modal',

  mixins: [modalMixin],

  components: {
    ChevronLeftIcon,
    ChevronRightIcon
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    previewFileId: {
      type: String,
      default: ''
    },
    attachment: {
      type: Object,
      default: () => {}
    },
    previewFileType: {
      type: String,
      default: ''
    }
  },
  emits: ['cancel', 'switch-image'],
  data() {
    return {
      prompt: '',
      isPrompt: false
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  computed: {
    previewPath() {
      if (this.previewFileId) {
        const id = this.previewFileId
        return this.active && this.previewFileId
          ? '/api/doodle/pictures/' + id + this.previewFileExtension()
          : ''
      } else if (this.attachment) {
        return getDownloadAttachmentPath(this.attachment)
      }
      return ''
    },

    previewDlPath() {
      const previewId = this.previewFileId
      return `/api/doodle/pictures/${previewId}.png`
    }
  },
  methods: {
    onCancel() {
      this.isPrompt = false
      this.prompt = ''
      this.$emit('cancel')
    },
    onSwitchImage(isNext) {
      if (isNext) {
        this.$emit('switch-image', true)
      } else {
        this.$emit('switch-image', false)
      }
    },
    previewFileExtension() {
      if (this.previewFileType.split('/')[1] === 'gif') return '.gif'
      else return '.png'
    },
    async handleKeydown(event) {
      if (event.ctrlKey && event.key === 'c') {
        try {
          const response = await fetch(this.previewDlPath)
          const blob = await response.blob()

          // 使用 Clipboard API 将图片写入剪切板
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ])
          this.prompt = '已复制'
          this.isPrompt = true
        } catch (error) {
          this.prompt = '复制失败'
        }
      }
      // 在此可以处理相关的逻辑，例如自定义复制行为
    }
  }
}
</script>

<style lang="scss" scoped>
.error {
  margin-top: 1em;
}

.new-window {
  color: $grey;
  position: absolute;
  right: 1em;
  top: 1em;
  z-index: 2;
  max-width: 80%;
}

.modal-content {
  width: 95%;
  text-align: center;
  max-height: 100vh;
  overflow: auto;

  img {
    margin-top: 60px;
    max-height: 90vh;
    overflow: auto;
  }
}

.chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 25px;
  position: absolute;
  background-color: #1e1e1e;
  width: 50px;
  height: 50px;
  top: 50%;
  z-index: 2;

  &:hover {
    border-color: var(--background-selectable);
    cursor: pointer;
  }
}

.chevron-left {
  left: 2%;
}

.chevron-right {
  right: 2%;
}

@keyframes moveUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
}

.prompt {
  position: fixed;
  font-size: 20px;
  bottom: 20%;
}

.prompt-animation {
  animation: moveUp 3s forwards;
}
</style>
