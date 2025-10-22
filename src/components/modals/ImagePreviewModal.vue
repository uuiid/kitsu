<template>
  <teleport to="body">
    <div class="image-preview-modal" @wheel.prevent="onImage">
      <div class="chevron chevron-left" @click="onSwitchImage(false)">
        <chevron-left-icon :size="30"></chevron-left-icon>
      </div>
      <div class="chevron chevron-right" @click="onSwitchImage(true)">
        <chevron-right-icon :size="30"></chevron-right-icon>
      </div>
      <div class="chevron chevron-right-top" @click="onCancel">
        <x :size="30"></x>
      </div>

      <div
        class="ai-image-preview"
        @mousedown="startDrag"
        @mousemove.stop="drag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
      >
        <div class="image-container">
          <video
            class="video-pre"
            ref="imagePreview"
            :src="src"
            controls
            autoplay
            loop
            v-if="isVideo"
          />
          <img
            class="image"
            :src="previewPath"
            ref="imagePreview"
            alt=""
            :style="{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${imageScale})`,
              transformOrigin: 'center center'
            }"
            draggable="false"
            @mousedown.prevent
            @dragstart.prevent
            @contextmenu.prevent
            @load="onLoadImage"
            v-show="isShowImage"
            v-focus
            v-else
          />
        </div>
        <div class="ai-info" v-if="isInfo">
          <div class="ai-info-content">
            <div class="ai-image-preview-action"></div>
            <div class="ai-info-prompt-title not-select">
              <span class="grey-text">创意描述</span>
              <div class="ai-image-preview-action">
                <div title="复制" class="lucide-icon" style="cursor: pointer">
                  <copy-icon :size="20" @click="copyPrompt" />
                </div>
                <div
                  class="lucide-icon"
                  :title="$t('doodle_work.share')"
                  @click="$emit('share')"
                  v-show="!aiInfo.id"
                >
                  <share2 size="20"></share2>
                </div>
                <div
                  class="lucide-icon"
                  :title="$t('playlists.actions.download_file')"
                  @click="$emit('download')"
                >
                  <download size="20"></download>
                </div>
              </div>
            </div>
            <div>{{ aiInfo.prompt }}</div>
            <div class="ai-info-size not-select grey-text" v-if="aiInfo.width">
              <span>宽:{{ aiInfo.width }}</span>
              <span>高:{{ aiInfo.height }}</span>
            </div>
            <div
              class="ai-info-size not-select grey-text"
              v-if="aiInfo.aspect_ratio"
            >
              <span>比例 {{ aiInfo.aspect_ratio }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  X,
  CopyIcon,
  Share2,
  Download
} from 'lucide-vue-next'

import { getDownloadAttachmentPath } from '@/lib/path'
import { ElMessage } from 'element-plus'
import { modalMixin } from '@/components/modals/base_modal'

export default {
  name: 'image-preview-modal',

  mixins: [modalMixin],

  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    X,
    CopyIcon,
    Share2,
    Download
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
    },
    isInfo: {
      type: Boolean,
      default: true
    },
    isVideo: {
      type: Boolean,
      default: false
    },
    aiInfo: {
      type: Object,
      default: () => {}
    },
    src: {
      type: String,
      default: ''
    }
  },
  emits: ['cancel', 'switch-image', 'download', 'share'],
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
      },
      isShowImage: true,
      currentIndex: 0
    }
  },
  mounted() {
    if (!this.isVideo) window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    if (!this.isVideo) window.removeEventListener('keydown', this.handleKeydown)
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
      return this.src
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
    },
    startDrag(event) {
      this.isDragging = true
      this.dragStart.x = event.clientX - this.translate.x
      this.dragStart.y = event.clientY - this.translate.y
    },
    drag(event) {
      if (!this.isInfo) {
        if (this.isDragging) {
          this.translate.x = event.clientX - this.dragStart.x
          this.translate.y = event.clientY - this.dragStart.y
        }
      }
    },
    onLoadImage() {
      setTimeout(() => {
        this.imageScale = 1
        this.isShowImage = true
      }, 20)
    },
    endDrag() {
      this.isDragging = false
    },
    onSwitchImage(isNext) {
      this.isShowImage = false
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
    async copyPrompt() {
      await navigator.clipboard.writeText(this.aiInfo.prompt)
      ElMessage.success('复制成功')
    },
    async handleKeydown(event) {
      if (event.ctrlKey && event.key === 'c') {
        try {
          const response = await fetch(this.previewDlPath)
          const blob = await response.blob()

          // 使用 Clipboard API 将图片写入剪切板
          const { clipboard, nativeImage } = require('electron')
          const arrayBuffer = await blob.arrayBuffer()
          const buffer = await Buffer.from(arrayBuffer)
          const image = await nativeImage.createFromBuffer(buffer)
          clipboard.writeImage(image)
          ElMessage({
            message: '已复制',
            type: 'success',
            plain: true,
            offset: 100
          })
        } catch (error) {
          ElMessage.error('复制失败(浏览器不支持)')
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
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw; /* 占满视口宽度 */
  height: 100vh; /* 占满视口高度 */
  z-index: 500; /* 确保在最上层 */
  background: rgb(0, 0, 0, 0.8);
}
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

.ai-image-preview {
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;
  overflow: hidden;
  gap: 20px;
}
.image-container {
  display: flex;
  flex-flow: column;
  justify-items: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.image-container:active {
  cursor: grabbing;
}

img,
video {
  transition: transform 0.2s ease;
  object-fit: contain;
  user-select: none;
  border-radius: 20px;
  max-width: 90%;
  max-height: 100vh;
}
.video-pre {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  padding-bottom: 1em;
  padding-top: 1em;
}
.grey-text {
  color: rgb(221, 221, 221, 0.5);
}
.chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  position: absolute;
  color: rgba(221, 221, 221, 0.91);
  background-color: rgba(57, 57, 57, 0.5);
  width: 40px;
  height: 40px;
  top: 50%;
  z-index: 999;

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
  top: 5%;
}

.lucide-icon {
  &:hover {
    color: var(--background-selectable);
    cursor: pointer;
  }
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
.ai-info {
  //background: #00b242;
  width: 40%;
  height: 100%;
  color: var(--text);
  z-index: 998;
  background: rgb(0, 0, 0, 0.8);
}
.ai-image-preview-action {
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  align-items: center;
  font-size: 1.2em;
  gap: 10px;
}

.ai-info-content {
  display: flex;
  flex-flow: column;
  gap: 10px;
  margin-top: 100px;
  margin-right: 100px;
  padding: 1em;
}
.ai-info-prompt-title {
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  font-size: 1.2em;
}
.not-select {
  user-select: none;
}
.ai-info-size {
  display: flex;
  gap: 10px;
}
</style>
