<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
    @wheel.prevent="onImage"
  >
    <div class="chevron chevron-left" @click="onSwitchImage(false)">
      <chevron-left-icon :size="30"></chevron-left-icon>
    </div>
    <div class="chevron chevron-right" @click="onSwitchImage(true)">
      <chevron-right-icon :size="30"></chevron-right-icon>
    </div>
    <div class="chevron chevron-right-top" @click="onCancel">
      <x :size="30"></x>
    </div>
    <div class="modal-background"></div>
    <div
      class="image-container"
      @mousedown="startDrag"
      @mousemove.stop="drag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      :style="{
        transform: `translate(${translate.x}px, ${translate.y}px)`
      }"
    >
      <img
        class="image"
        :src="previewPath"
        ref="imagePreview"
        alt=""
        :style="{
          transform: `scale(${imageScale})`,
          transformOrigin: 'center center',
          height: `85vh`
        }"
        draggable="false"
        @mousedown.prevent
        @dragstart.prevent
        @contextmenu.prevent
        v-focus
      />
    </div>
  </div>
</template>

<script>
import { ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-vue-next'

import { getDownloadAttachmentPath } from '@/lib/path'
import { ElMessage } from 'element-plus'
import { modalMixin } from '@/components/modals/base_modal'

export default {
  name: 'image-preview-modal',

  mixins: [modalMixin],

  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    X
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
      imageScale: 1,
      isDragging: false,
      dragStart: {
        x: 0,
        y: 0
      },
      translate: {
        x: 0,
        y: 0
      }
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
      this.initImagePreview()
      this.$emit('cancel')
    },
    initImagePreview() {
      this.imageScale = 1
      this.translate.y = 0
      this.translate.x = 0
      this.dragStart.x = 0
      this.dragStart.y = 0
    },
    onImage(event) {
      this.imageScale = Math.max(
        0.001,
        Math.min(50, this.imageScale - event.deltaY / 1000)
      )
      console.log(this.imageScale)
    },
    startDrag(event) {
      this.isDragging = true
      this.dragStart.x = event.clientX - this.translate.x
      this.dragStart.y = event.clientY - this.translate.y
      console.log(this.dragStart.x, this.dragStart.y)
    },
    drag(event) {
      if (this.isDragging) {
        this.translate.x = event.clientX - this.dragStart.x

        this.translate.y = event.clientY - this.dragStart.y
      }
    },

    endDrag() {
      this.isDragging = false
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
          ElMessage({
            message: '已复制',
            type: 'success',
            plain: true,
            offset: 100
          })
        } catch (error) {
          ElMessage.error('复制失败')
        }
      } else if (event.key === 'Escape') {
        this.initImagePreview()
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

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  cursor: grab;
}

.image-container:active {
  cursor: grabbing;
}

img {
  transition: transform 0.2s ease;
  max-width: none;
  object-fit: contain;
  user-select: none;
}

.chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  position: absolute;
  color: rgba(221, 221, 221, 0.91);
  background-color: rgb(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  top: 50%;
  z-index: 2;

  &:hover {
    border-color: var(--background-selectable);
    color: $red;
    cursor: pointer;
  }
}

.chevron-left {
  left: 2%;
}

.chevron-right {
  right: 2%;
}

.chevron-right-top {
  right: 2%;
  top: 10%;
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
</style>
