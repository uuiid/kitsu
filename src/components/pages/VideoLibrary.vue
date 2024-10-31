<template>
  <div class="columns fixed-page">
    <div class="video-library">
      <header class="filler">
        <page-title
          class="mt1 filler"
          :text="$t('video_library.video_library')"
          :bold="true"
        />
      </header>
      <div class="video-flexrow">
        <search-field
          ref="search-field"
          class="flexrow-item"
          @change="onSearchChange"
          :can-save="true"
          v-focus
        />
        <button
          class="update-video-button"
          @click="showNewModal"
          v-if="isElectron"
        >
          {{ $t('video_library.update_video') }}
        </button>
        <span class="update-video-error" v-if="modals.isDisplayedUpdateError">
          请先选择类型</span
        >
      </div>
      <div class="main-content">
        <div
          class="main-content-left"
          :style="{ width: leftPanelWidth + 'px' }"
        >
          <div class="treeView">
            <tree-view
              v-for="item in videoTypeTreeData"
              :key="item.id"
              ref="TreeView"
              :item="item"
              @onSelectedChange="setSelected"
              @onAddType="showNewTypeModal"
              @onToggle="onToggle"
            ></tree-view>
          </div>
        </div>
        <div class="main-content-separator" @mousedown="onMouseDown"></div>
        <div
          class="main-content-center"
          :style="{ width: rightPanelWidth + 'px' }"
        >
          <div class="entities mb2">
            <table-info
              :is-loading="false"
              :is-error="false"
              v-if="loading.sharedAssets || errors.sharedAssets"
            />
            <div
              class="has-text-centered"
              v-else-if="!sortedSharedAssetsByType.length"
            >
              {{ $t('video_library.no_video') }}
            </div>
            <template v-else>
              <h1 class="type-text">
                {{ currentVideoType.label }} ({{
                  sortedSharedAssetsByType.length
                }})
              </h1>
              <ul class="items">
                <li
                  class="item flexcolumn"
                  :class="{
                    'selected-item': isSelected(entity)
                  }"
                  :key="entity.id"
                  v-for="entity in sortedSharedAssetsByType"
                  @click="toggleEntity(entity)"
                >
                  <div class="card" :title="entity.notes">
                    <video-preview
                      :empty-height="100"
                      :empty-width="150"
                      :height="100"
                      :width="150"
                      :entity="entity"
                      :preview-file-id="entity.id"
                      is-rounded-top-border
                      @onMenuAction="menuAction"
                    />
                    <div class="item-description flexrow">
                      <div class="entity-name ml1 flexrow">
                        {{ entity.label }}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </div>
    </div>
    <edit-video-library-modal
      ref="edit_video_library_modal"
      :active="modals.isNewDisplayed"
      :video-type-id="currentVideoType.id"
      @cancel="modals.isNewDisplayed = false"
      @onConfirm="confirmNewVideo"
    />
    <edit-video-library-add-type-modal
      ref="edit_video_library_add_type_modal"
      :active="modals.isNewTypeDisplayed"
      :video-type-id="currentVideoType.id"
      @cancel="modals.isNewTypeDisplayed = false"
      @onConfirm="confirmNewVideoType"
    />
    <image-preview-modal
      ref="image_preview_modal"
      :active="modals.isImagepreviewDisplayed"
      :preview-file-id="currentSelectVideo.id"
      @cancel="modals.isImagepreviewDisplayed = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TreeView from '@/components/widgets/TreeView.vue'
import VideoPreview from '@/components/widgets/VideoPreview.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import EditVideoLibraryModal from '@/components/modals/EditVideoLibraryModal.vue'
import EditVideoLibraryAddTypeModal from '@/components/modals/EditVideoLibraryAddTypeModal.vue'
import ImagePreviewModal from '@/components/modals/ImagePreviewModal.vue'
export default {
  name: 'video-library',
  components: {
    VideoPreview,
    PageTitle,
    SearchField,
    TableInfo,
    TreeView,
    EditVideoLibraryModal,
    EditVideoLibraryAddTypeModal,
    ImagePreviewModal
  },

  data() {
    return {
      leftPanelWidth: 200, // 初始左侧宽度
      rightPanelWidth: window.innerWidth - this.leftPanelWidth - 10,
      dragging: false, // 是否正在拖动
      dragStartX: 0, // 鼠标按下时的X位置
      startLeftWidth: 200,

      errors: {
        sharedAssets: false
      },
      filters: {
        productionId: null
      },
      keyWord: '',
      loading: {
        sharedAssets: false
      },
      sorting: {
        current: 'name',
        options: ['name', 'production', 'created_at', 'updated_at'].map(
          name => ({
            label: name,
            value: name
          })
        )
      },
      currentVideoType: {
        label: '所有',
        parent_id: '',
        id: 'all',
        children: []
      },
      videoTypeTreeData: [
        {
          label: '所有',
          parent_id: '',
          id: 'all',
          isOpen: true,
          isSelected: false,
          children: []
        }
      ],
      modals: {
        isAddMetadataDisplayed: false,
        isAddThumbnailsDisplayed: false,
        isBuildFilterDisplayed: false,
        isCreateTasksDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteAllTasksDisplayed: false,
        isDeleteMetadataDisplayed: false,
        isImportDisplayed: false,
        isImportRenderDisplayed: false,
        isNewDisplayed: false,
        isNewTypeDisplayed: false,
        isImagepreviewDisplayed: false,
        isDisplayedUpdateError: false
      },
      selectType: {},
      openType: [],
      currentSelectVideo: {}
    }
  },

  mounted() {
    this.checkElectron()
    this.loadVideosType()
    this.loadVideos()
    this.rightPanelWidth = window.innerWidth - this.leftPanelWidth - 10
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  computed: {
    ...mapGetters([
      'displayedSharedAssets',
      'displayedSharedAssetsByType',
      'openProductions',
      'productionMap',
      'selectedAssets',
      'videos',
      'originalVideoTypes',
      'isElectron'
    ]),
    ancestorLabels() {
      const ancestors = this.getAncestors(
        this.videoTypeTreeData,
        this.currentVideoType.id
      )
      return ancestors.map(node => node.label).join(' > ')
    },
    searchField() {
      return this.$refs['search-field']
    },

    sortedSharedAssetsByType() {
      return this.videos.filter(v => {
        return (
          (v.parent_id === this.currentVideoType.id ||
            this.currentVideoType.id === 'all') &&
          v.label.indexOf(this.keyWord) !== -1
        )
      })
    },
    hasSelectedAssets() {
      return this.selectedAssets.size > 0
    }
  },

  methods: {
    ...mapActions([
      'loadVideos',
      'setAssetSelection',
      'setSharedAssetSearch',
      'newVideosType',
      'newVideo',
      'deleteVideo',
      'loadVideosType',
      'modifyVideo',
      'setIsElectron'
    ]),
    handleResize() {
      this.rightPanelWidth = window.innerWidth - this.leftPanelWidth - 10
    },
    async refresh(silent = false) {
      this.loading.sharedAssets = !silent
      try {
        await this.loadVideos()
      } catch (error) {
        console.error(error)
        this.errors.sharedAssets = true
      }
      this.loading.sharedAssets = false
    },
    confirmNewVideo(video, image) {
      video.upimage = image
      this.newVideo(video)
    },
    confirmNewVideoType(videoType) {
      if (videoType.label) {
        this.newVideosType(videoType)
      }
    },
    checkElectron() {
      this.setIsElectron(
        typeof window !== 'undefined' &&
          typeof window.process === 'object' &&
          !!window.process.versions.electron
      )
    },
    listToTree(data) {
      if (data.length > 0) {
        const tree = []
        const lookup = {}
        data.forEach(item => {
          lookup[item.id] = { ...item, children: [] }
        })
        data.forEach(item => {
          if (item.parent_id) {
            if (lookup[item.parent_id]) {
              lookup[item.parent_id].children.push(lookup[item.id])
            }
          } else {
            tree.push(lookup[item.id])
          }
        })
        const datas = [
          {
            label: '所有',
            parent_id: '',
            id: 'all',
            isOpen: true,
            isSelected: false,
            children: tree
          }
        ]
        return datas
      } else {
        return [
          {
            label: '所有',
            parent_id: '',
            id: 'all',
            isOpen: true,
            isSelected: false,
            children: []
          }
        ]
      }
    },
    async menuAction(entity, action) {
      if (action === 'copyVideoPath') {
        try {
          await navigator.clipboard.writeText(entity.path)
        } catch (error) {
          console.log(error)
        }
      } else if (action === 'delete') {
        entity.active = false
        this.modifyVideo(entity)
        console.log(entity.id)
      } else if (action === 'openVideo') {
        if (this.isElectron) {
          const { shell } = require('electron')
          shell.openPath(entity.path)
        }
      } else if (action === 'showBigImage') {
        this.modals.isImagepreviewDisplayed = true
        this.currentSelectVideo = entity
      }
    },
    onButteonClick() {
      console.log(this.displayedSharedAssets)
    },
    toggleEntity(entity) {
      const selected = this.isSelected(entity)
      this.setAssetSelection({ asset: entity, selected: !selected })
    },
    onToggle(item) {
      this.originalVideoTypes.forEach(i => {
        if (i.id === item.id) i.isOpen = item.isOpen
      })
    },
    setSelected(item) {
      this.$set(this.currentVideoType, 'isSelected', false)
      this.currentVideoType = item
      this.rightPanelWidth = window.innerWidth - this.leftPanelWidth - 10
    },
    isSelected(entity) {
      return this.selectedAssets.has(entity.id)
    },

    onSearchChange() {
      this.keyWord = this.searchField.getValue() || ''
    },

    updateRoute({ production, search }) {
      const query = {
        ...this.$route.query,
        production: production || undefined,
        search: search || undefined
      }

      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.push({ query })
      }
    },
    onMouseDown(event) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
      this.dragStartX = event.clientX
      this.dragging = true
      this.startLeftWidth = this.leftPanelWidth
    },
    onMouseMove(event) {
      if (this.dragging) {
        const delta = event.clientX - this.dragStartX
        this.leftPanelWidth = this.startLeftWidth + delta
        this.rightPanelWidth = window.innerWidth - this.leftPanelWidth - 10 // 10 是分隔条的宽度
      }
    },
    onMouseUp() {
      this.dragging = false
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    },
    getAncestors(nodes, targetId) {
      const path = []
      const traverse = nodes => {
        for (const node of nodes) {
          path.push(node)

          if (node.id === targetId) {
            return true
          }
          if (node.children && traverse(node.children)) {
            return true
          }
          path.pop()
        }
        return false
      }
      traverse(nodes)
      path.push(this.currentVideoType)
      return path.slice(0, -1)
    },
    showNewModal() {
      if (this.currentVideoType.id !== 'all') {
        this.$refs.edit_video_library_modal.videoToCreat.parent_id =
          this.currentVideoType.id
        this.modals.isNewDisplayed = true
        this.modals.isDisplayedUpdateError = false
      } else {
        this.modals.isDisplayedUpdateError = true
      }
      this.$refs.edit_video_library_modal.videoToCreat.type =
        this.ancestorLabels
    },
    showNewTypeModal() {
      this.modals.isNewTypeDisplayed = true
      if (this.currentVideoType.id !== 'all') {
        this.$refs.edit_video_library_add_type_modal.videoTypeToCreat.parent_id =
          this.currentVideoType.id
      } else {
        this.$refs.edit_video_library_add_type_modal.videoTypeToCreat.parent_id =
          ''
      }
      this.$refs.edit_video_library_add_type_modal.videoTypeToCreat.type =
        this.ancestorLabels
    }
  },
  watch: {
    originalVideoTypes(value) {
      this.videoTypeTreeData = this.listToTree(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.video-library {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  padding: 4em 2em 1em 2em;
  color: var(--text);
  margin-left: auto;
  margin-right: auto;
}
.video-flexrow {
  display: flex;
  margin-bottom: 20px;
}
.main-content {
  display: flex;
  flex-direction: row;
  max-height: calc(100vh - 16em);
  //border-bottom:thick dotted #ff0000;
  height: 100vh;
  width: calc(100vw - 4em);
}

.main-content-left {
  height: 100%;
  //border-left:thick dotted #ff0000;
  overflow: auto; // 启用滚动条
}
.main-content-separator {
  width: 2px;
  cursor: ew-resize;
  background-color: #ccc;
  position: relative;
  z-index: 10;
}

.type-text {
  //width: 400%;
  font-size: 30px;
  border-bottom: 2px solid #dadada;
  margin-bottom: 0.2cm;
  margin-left: 0.5cm;
  user-select: none;
}
.update-video-button {
  border-radius: 1em;
  min-width: 3cm;
  min-height: 1.2cm;
  background-color: var(--background);
  border: 2px solid transparent;
  border-color: var(--background-selected);
  &:hover {
    border-color: $green;
  }
  &:checked {
    border-color: var(--background-selectable);
  }
}
.update-video-error {
  margin-top: 10px;
  margin-left: 5px;
  font-size: 12px;
  color: $red;
}
.entities {
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  user-select: none;

  .items {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .item {
    background-color: var(--background);
    border: 5px solid transparent;
    border-radius: 1em;
    transition: border-color 0.2s ease-in-out;
    cursor: pointer;

    &:hover {
      border-color: var(--background-selectable);
    }

    &.selected-item {
      border-color: var(--background-selected);
    }

    .card {
      border-radius: inherit;
      box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);

      .dark & {
        background-color: var(--background-alt);
      }
    }

    .item-description {
      color: var(--text-strong);
      font-size: 0.9em;
      font-weight: bold;
      max-width: 150px;
      min-width: 150px;
      padding: 0.5em;

      .entity-name {
        margin-left: auto;
        margin-right: auto;
      }
    }
  }

  .selectedItem {
    background-color: var(--background-selected);
  }
}
</style>
