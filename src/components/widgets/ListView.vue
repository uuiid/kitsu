<template>
  <div
    :class="errored ? 'list-view error' : 'list-view'"
    tabindex="0"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <span class="placeholder" v-if="isShowPlaceholder">{{ placeholder }}</span>
    <ul v-if="isActiveText">
      <li v-for="(item, index) in options" :key="index">
        <span
          class="list-view-item"
          :class="{ selectedItem: item.isSelected }"
          @click.stop="selectItem(item)"
        >
          {{ item.name }}
        </span>
      </li>
    </ul>
    <div v-if="videos.length > 0">
      <div class="img-preview" v-for="video in videos" :key="video.id">
        <video
          alt="uploaded file"
          :src="getURL(video)"
          v-if="isActiveVideo"
        ></video>
        <span>
          {{ video.name }}
        </span>
      </div>
    </div>
    <div v-if="images.length > 0">
      <div v-for="(image, index) in images" :key="index">
        <img
          class="img-preview"
          alt="uploaded file"
          :src="getURL(image)"
          v-if="isActiveImage"
        />
      </div>
    </div>
    <div class="error" v-if="errored">
      {{ errorText }}
    </div>
  </div>
</template>
<script>
export default {
  name: 'list-view',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    initData: {
      type: Object,
      default: () => {}
    },
    isDrop: {
      type: Boolean,
      default: true
    },
    isSingleRow: {
      type: Boolean,
      default: true
    },
    isActiveText: {
      type: Boolean,
      default: false
    },
    isActiveImage: {
      type: Boolean,
      default: false
    },
    isActiveVideo: {
      type: Boolean,
      default: false
    },
    errored: {
      type: Boolean,
      default: false
    },
    errorText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      forms: [],
      isActive: false,
      images: [],
      videos: [],
      placeholder: '拖入文件或Ctrl+V',
      isShowPlaceholder: true,
      currentItem: this.initData
    }
  },
  mounted() {
    document.addEventListener('paste', this.onPastes, false)
  },
  beforeDestroy() {
    window.removeEventListener('paste', this.onPastes)
  },
  methods: {
    toggle(item) {
      //this.selectItem(item)
      this.$set(item, 'isOpen', !item.isOpen)
    },
    init() {
      this.isShowPlaceholder = true
      this.images = []
      this.videos = []
    },
    handleData(files) {
      this.isShowPlaceholder = false
      if (this.isImage(files[0])) {
        console.log(files[0])
        this.images = files
      } else if (this.isVideo(files[0])) {
        this.videos = files
        //this.$emit("onVideos",this.videos);
      }
    },
    selectItem(selectedItem) {
      // 取消所有项的选中状态
      this.$set(this.currentItem, 'isSelected', false)
      this.currentItem = selectedItem
      // 设置当前项为选中
      this.$set(selectedItem, 'isSelected', true)
    },
    handleDragEnter(event) {
      this.$emit('setError', false)
    },
    handleDragOver(event) {
      event.preventDefault()
      if (this.isDrop) {
        event.dataTransfer.dropEffect = 'copy'
      }
    },
    handleDrop(event) {
      event.preventDefault()
      if (this.isDrop) {
        const files = event.dataTransfer.files
        this.handleData(files)
        this.$emit('on-add-files', files)
      }
    },
    handleFocus() {
      // 在这里编写处理focus事件的代码
      this.isActive = true
    },
    handleBlur() {
      this.isActive = false
    },
    isImage(form) {
      return form.type.startsWith('image')
    },
    isVideo(form) {
      return form.type.startsWith('video')
    },
    getURL(form) {
      return window.URL.createObjectURL(form)
    },
    onPastes(event) {
      if (this.isActive && event.clipboardData.files) {
        const files = event.clipboardData.files
        this.handleData(files)
        this.$emit('customEvents', files)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.list-view {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dotted #bdbdbd;
  min-height: 120px;
  margin-bottom: 30px;
  border-radius: 10px;
  &:hover {
    border: 2px dotted $green;
  }
}
.list-view.error {
  border: 2px dotted $red;
  &:hover {
    border: 2px dotted $red;
  }
}
.list-view-item {
  font-size: 20px;
  width: auto;
  user-select: none;
  white-space: nowrap;
  list-style: none;
  &:hover {
    background-color: var(--background-selectable);
    cursor: pointer;
  }
}
.placeholder {
  display: flex;
  user-select: none;
  color: #bdbdbd;
}
.img-preview {
  max-width: 120px;
  max-height: 120px;
}
.uploaded file
/* 定义选中项的红色背景 */
.selectedItem {
  background-color: var(--background-selected);
}
</style>
