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
    <span class="placeholder" v-if="isShowPlaceholder && !assetToEdit">{{
      placeholder
    }}</span>
    <ul v-if="isActiveText">
      <li v-for="(item, index) in options" :key="index">
        <span
          class="list-view-item"
          :class="{ selectedItem: item.isSelected }"
          @click.stop="selectItem(item)"
        >
        </span>
      </li>
    </ul>
    <ul v-if="isActiveFile">
      <li v-for="(item, index) in files" :key="index">
        <div
          class="list-view-item"
          :class="{ selectedItem: item.isSelected }"
          @click.stop="selectItem(item)"
        >
          {{ item.name }}
        </div>
      </li>
    </ul>
    <div class="parent_preview" v-if="videos.length > 0">
      <div v-for="video in videos" :key="video.id">
        <!--video
          class="video-preview"
          :src="getURL(video)"
          v-if="isActiveVideo"
        ></video-->
        <div class="preview">{{ video.name }}</div>
      </div>
    </div>
    <div class="parent_preview" v-if="isActiveImage">
      <div v-for="(image, index) in images" :key="index" v-if="!isShow">
        <img class="img-preview" :src="getURL(image)" alt="" />
      </div>
      <img
        class="img-preview"
        :src="thumbnailPath"
        v-if="isActiveImage && isShow"
        alt=""
      />
    </div>
    <div class="error" v-if="errored">
      {{ errorText }}
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

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
    isActiveFile: {
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
    },
    anyFileType: {
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
      forms: [],
      isActive: false,
      images: [],
      videos: [],
      files: [],
      anyFile: [],
      placeholder: '拖入文件或Ctrl+V',
      isShowPlaceholder: true,
      currentItem: this.initData,
      isShow: true
    }
  },
  mounted() {
    document.addEventListener('paste', this.onPastes, false)
  },
  beforeDestroy() {
    window.removeEventListener('paste', this.onPastes)
  },
  computed: {
    ...mapGetters(['videoExtensions', 'imageExtensions']),
    thumbnailPath() {
      if (this.assetToEdit) {
        const previewFileId = this.assetToEdit.id
        return (
          '/api/doodle/pictures/thumbnails/' +
          previewFileId +
          '.png?t' +
          new Date().getTime()
        )
      } else {
        return ''
      }
    }
  },
  methods: {
    toggle(item) {
      //this.selectItem(item)
      this.$set(item, 'isOpen', !item.isOpen)
    },
    init() {
      this.isShowPlaceholder = true
      this.isShow = true
      this.images = []
      this.videos = []
      this.files = []
    },
    handleData(files) {
      this.isShowPlaceholder = false
      this.isShow = false
      if (this.anyFileType) {
        this.videos = files
      } else if (this.isActiveImage && this.isImage(files[0])) {
        this.images = files
      } else if (this.isActiveVideo && this.isVideo(files[0])) {
        this.videos = files
      } else if (this.isActiveFile) {
        const fs = require('fs')
        //const { contextBridge, webUtils } = require('electron')
        //const filesArray = Array.isArray(files) ? files : Array.from(files)
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          //console.log(webUtils.getPathForFile(file))
          if (fs.statSync(file.path).isDirectory()) {
            this.files = [...this.files, ...this.getAllFiles(file.path)]
          } else {
            const data = this.formatImageFile(file.path)
            this.files.push(data)
          }
        }
        this.currentItem = this.files[0]
      }
    },
    formatImageFile(filePath) {
      const path = require('path')
      const data = {
        name: path.basename(filePath, path.extname(filePath)),
        isSelected: false,
        path: filePath
      }
      if (
        this.imageExtensions.includes(
          path.extname(filePath).slice(1).toLowerCase()
        )
      ) {
        data.has_thumbnail = true
        return data
      } else if (
        this.videoExtensions.includes(
          path.extname(filePath).slice(1).toLowerCase()
        )
      ) {
        data.has_thumbnail = false
        return data
      }
    },
    getAllFiles(dirPath, arrayOfFiles = []) {
      const fs = require('fs')
      const files = fs.readdirSync(dirPath)
      const path = require('path')
      files.forEach(file => {
        console.log(file)
        const fullPath = path.join(dirPath, file)
        if (fs.statSync(fullPath).isDirectory()) {
          // 如果是目录，则递归调用
          this.getAllFiles(fullPath, arrayOfFiles)
        } else {
          const data = this.formatImageFile(fullPath)
          if (data) arrayOfFiles.push(data)
        }
      })
      return arrayOfFiles
    },
    selectItem(selectedItem) {
      // 取消所有项的选中状态
      this.$set(this.currentItem, 'isSelected', false)
      this.currentItem = selectedItem
      // 设置当前项为选中
      this.$set(selectedItem, 'isSelected', true)
    },
    handleDragEnter(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      this.$emit('setError', false)
    },
    handleDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
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
        //this.$emit('customEvents', files)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.list-view {
  display: flex;
  //align-items: center;
  //justify-content: center;
  border: 2px dotted #bdbdbd;
  min-height: 120px;
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: auto;
  max-height: 300px;

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
  display: flex;
  font-size: 20px;
  width: auto;
  user-select: none;
  white-space: nowrap;

  &:hover {
    //background: linear-gradient(90deg, #66bb6a, #a5d6a7);
    //background: linear-gradient(
    //  90deg,
    //  #4caf50 100%,
    //  #ff8a80 100%,
    //  #f44336 100%
    //);
    background-color: var(--background-selectable);
    width: 100%;
    cursor: pointer;
  }
}

.list-view ul {
  list-style-type: none;
}

.progress-bar {
  top: 0;
  left: 0;
  height: auto;
  background-color: var(--background-selectable); /* 进度颜色 */
  z-index: 0; /* 将进度条置于文本后面 */
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  width: 100%;
  color: #bdbdbd;
}

.parent_preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.img-preview {
  display: flex;
  max-width: 200px;
  align-items: center;
  justify-content: center;
}

.video-preview {
  display: flex;
  max-height: 200px;
  max-width: 200px;
  align-items: center;
  justify-content: center;
}

.selectedItem {
  background-color: var(--background-selected);
}
</style>
