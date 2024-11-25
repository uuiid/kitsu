<template>
  <div class="video_library">
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
            @enter="onSearchEnter"
            :can-save="true"
            v-focus
          />
          <button
            :class="{
              button: true,
              'is-primary': false,
              'update-video-button': true
            }"
            @click="showNewModal"
            v-if="isElectron && isCurrentUserManager"
          >
            {{ $t('video_library.update_video') }}
          </button>
          <button
            :class="{
              button: true,
              'is-primary': false,
              'update-video-button': true
            }"
            @click="showBatchNewModal"
            v-if="isElectron && isCurrentUserManager"
          >
            {{ $t('video_library.batch_update_video') }}
          </button>
          <!--button
            :class="{
              button: true,
              'is-primary': false,
              'update-video-button': true
            }"
            @click="refresh"
          >
            <refresh-cw></refresh-cw>
            {{ $t('video_library.refresh') }}
          </button-->
          <span class="update-video-error" v-if="modals.isDisplayedUpdateError">
            请先选择类型</span
          >
        </div>
        <div class="main-content">
          <div
            class="main-content-left"
            :style="{ width: leftPanelWidth + 'px' }"
          >
            <div class="treeView" @click="setSelected">
              <tree-view
                v-for="item in videoTypeTreeData"
                :key="item.id"
                ref="TreeView"
                :item="item"
                @onSelectedChange="setSelected"
                @onAddType="showNewTypeModal"
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
                v-else-if="!displayAllAssets.length"
              >
                {{ $t('video_library.no_video') }}
              </div>
              <template v-else>
                <div class="list-head">
                  <h1 class="type-text">
                    {{ currentVideoType.label }} ({{ displayAllAssets.length }})
                  </h1>
                  <button-simple
                    :text="
                      isEditVideoSelection
                        ? $t('main.cancel') + $t('main.edit')
                        : $t('main.edit')
                    "
                    @click="editVideoSelection"
                    v-if="isCurrentUserManager"
                  />
                </div>
                <div class="list-body">
                  <ul class="items">
                    <li
                      class="item flexcolumn"
                      :class="{
                        'selected-item': isSelected(entity)
                      }"
                      :key="entity.id"
                      v-for="entity in pagedAssets"
                    >
                      <div class="card">
                        <video-preview
                          :ref="entity.id"
                          :empty-height="100"
                          :empty-width="150"
                          :height="100"
                          :width="150"
                          :entity="entity"
                          :preview-file-id="entity.id"
                          is-rounded-top-border
                          @onMenuAction="menuAction"
                          @onClickedImg="
                            isEditVideoSelection
                              ? toggleEntity(entity)
                              : openFileWith(entity)
                          "
                        />
                        <div class="item-description flexrow">
                          <div
                            class="entity-name"
                            :title="entityNameTitle(entity)"
                          >
                            {{ entity.label }}
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="pagination">
                  <div class="">
                    <button
                      :class="{ button: true }"
                      @click="
                        pageStartIndex > 0 ? (pageStartIndex -= 1) : () => {}
                      "
                    >
                      <chevron-left />
                    </button>

                    <button
                      :key="page"
                      :value="page"
                      :class="{
                        button: true,
                        'is-primary': currentPage === page - 1
                      }"
                      @click="onClickPageNumber(page)"
                      v-for="page in displayablePageNumber"
                    >
                      {{ page }}
                    </button>

                    <button
                      :class="{ button: true }"
                      @click="
                        pageStartIndex < pageNumbers.length - 3
                          ? (pageStartIndex += Math.min(
                              pageNumbers.length - 3 - pageStartIndex,
                              3
                            ))
                          : () => {}
                      "
                    >
                      <chevron-right />
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <edit-video-library-modal
        ref="edit_video_library_modal"
        :active="modals.isNewDisplayed"
        :video-type-id="currentVideoType.id"
        :video-type="ancestorLabels"
        @cancel="modals.isNewDisplayed = false"
        @onConfirm="confirmNewVideo"
      />
      <edit-video-library-batch-update-modal
        ref="edit_video_library_batch_update_modal"
        :active="modals.isBatchNewDisplayed"
        :video-type-id="currentVideoType.id"
        :video-type="ancestorLabels"
        @cancel="modals.isBatchNewDisplayed = false"
        @onConfirm="confirmBatchNewVideo"
      />
      <edit-video-library-add-type-modal
        ref="edit_video_library_add_type_modal"
        :active="modals.isNewTypeDisplayed"
        :parent-video-type="currentVideoType"
        :video-type="ancestorLabels"
        @cancel="modals.isNewTypeDisplayed = false"
        @onConfirm="confirmNewVideoType"
      />
      <edit-video-asset-modal
        ref="edit_video_asset_modal"
        :active="modals.isEditVideoAssetDisplayed"
        :asset-to-edit="currentSelectVideo"
        @cancel="modals.isEditVideoAssetDisplayed = false"
        @onConfirm="confirmEditVideo"
      />
      <image-preview-modal
        ref="image_preview_modal"
        :active="modals.isImagePreviewDisplayed"
        :preview-file-id="currentSelectVideo.id"
        :preview-file-type="currentSelectVideo.extension"
        @cancel="modals.isImagePreviewDisplayed = false"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ChevronLeft, ChevronRight } from 'lucide-vue'
import TreeView from '@/components/widgets/TreeView.vue'
import VideoPreview from '@/components/widgets/VideoPreview.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import EditVideoLibraryModal from '@/components/modals/EditVideoLibraryModal.vue'
import EditVideoLibraryBatchUpdateModal from '@/components/modals/EditVideoLibraryBatchUpdateModal.vue'
import EditVideoLibraryAddTypeModal from '@/components/modals/EditVideoLibraryAddTypeModal.vue'
import ImagePreviewModal from '@/components/modals/ImagePreviewModal.vue'
import EditVideoAssetModal from '@/components/modals/EditVideoAssetModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

export default {
  name: 'video-library',
  components: {
    ButtonSimple,
    VideoPreview,
    PageTitle,
    SearchField,
    TableInfo,
    TreeView,
    EditVideoLibraryModal,
    EditVideoLibraryBatchUpdateModal,
    EditVideoLibraryAddTypeModal,
    ImagePreviewModal,
    EditVideoAssetModal,
    ChevronLeft,
    ChevronRight
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
        isBatchNewDisplayed: false,
        isNewTypeDisplayed: false,
        isImagePreviewDisplayed: false,
        isEditVideoAssetDisplayed: false,
        isDisplayedUpdateError: false
      },
      selectType: {},
      openType: [],
      currentSelectVideo: {},
      currentTypeAllId: [],
      isShiftSelected: false,
      shiftEndSelection: null,
      currentPage: 0,
      maxNum: 504,
      pageStartIndex: 0
    }
  },

  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('keyup', this.handleKeyup)
    this.checkElectron()
    this.loadVideosType()
    this.loadVideos()
    this.rightPanelWidth = window.innerWidth - this.leftPanelWidth - 10
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('keyup', this.handleKeyup)
  },
  computed: {
    ...mapGetters([
      'selectedAssets',
      'videos',
      'originalVideoTypes',
      'isElectron',
      'openedVideoTypes',
      'currentVideoType',
      'selectedVideos',
      'isCurrentUserManager',
      'isEditVideoSelection',
      'imageExtensions',
      'refreshTimer'
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
    displayablePageNumber() {
      return this.pageNumbers.slice(
        this.pageStartIndex,
        this.pageStartIndex + 3
      )
    },
    pageNumbers() {
      return Array.from(
        {
          length: Math.floor(this.displayAllAssets.length / this.maxNum) + 1
        },
        (_, index) => index + 1
      )
    },
    pagedAssets() {
      return this.displayAllAssets.slice(
        this.countMinPage(),
        this.countMaxPage()
      )
    },
    displayAllAssets() {
      return this.keyWord.length === 0
        ? this.sortedAssetsByType
        : this.searchAssetsData
    },
    sortedAssetsByType() {
      this.getAllChildrenId(this.currentVideoType)
      return this.videos
        .filter(v => {
          return (
            this.currentTypeAllId.includes(v.parent_id) ||
            this.currentVideoType.id === 'all'
          )
        })
        .sort((a, b) => a.label.localeCompare(b.label))
    },
    searchAssetsData() {
      return this.sortedAssetsByType.filter(v => {
        return (
          v.label.indexOf(this.keyWord) !== -1 ||
          (
            (this.originalVideoTypes.get(
              this.originalVideoTypes.get(v.parent_id).parent_id
            )
              ? this.originalVideoTypes.get(
                  this.originalVideoTypes.get(v.parent_id).parent_id
                ).label
              : '') + this.originalVideoTypes.get(v.parent_id).label
          ).indexOf(this.keyWord) !== -1
        )
      })
    }
  },

  methods: {
    ...mapActions([
      'loadVideos',
      'setVideoSelection',
      'setSharedAssetSearch',
      'newVideosType',
      'newVideo',
      'newVideos',
      'deleteVideo',
      'loadVideosType',
      'modifyVideo',
      'setIsElectron',
      'setCurrentVideoType',
      'setCurrentVideoTypeStatus',
      'clearSelectedVideos',
      'modifyVideos',
      'setVideoTypeOpen',
      'resetSelectedVideos',
      'modifyVideoActive'
    ]),
    handleResize() {
      this.rightPanelWidth = window.innerWidth - this.leftPanelWidth - 10
    },
    handleKeyup(event) {
      if (event.key === 'Shift') {
        this.isShiftSelected = false
        if (this.shiftEndSelection)
          this.currentSelectVideo = this.shiftEndSelection //[...this.selectedVideos.entries()].at(-1)[1]
      }
    },
    handleKeydown(event) {
      if (event.key === 'Shift') {
        this.isShiftSelected = true
      }
    },
    onClickPageNumber(pageNumber) {
      this.currentPage = pageNumber - 1
      if (
        this.currentPage - this.pageStartIndex === 2 &&
        this.currentPage < this.pageNumbers.length - 1
      ) {
        this.pageStartIndex += 1
      } else if (
        this.currentPage - this.pageStartIndex === 0 &&
        this.currentPage > 0
      ) {
        this.pageStartIndex -= 1
      }
    },
    setAncestorOpened(targetId) {
      const ancestors = this.getAncestors(this.videoTypeTreeData, targetId)
      this.setCurrentVideoType(ancestors[ancestors.length - 1])
      ancestors.forEach(v => {
        if (!this.openedVideoTypes.has(v.id)) {
          this.setVideoTypeOpen(v)
        }
      })
    },
    async refresh() {
      try {
        await this.loadVideosType()
        await this.loadVideos()
        return true
      } catch (error) {
        return error
      }
    },
    countMinPage() {
      return Math.min(
        this.displayAllAssets.length,
        this.currentPage * this.maxNum
      )
    },
    countMaxPage() {
      return Math.min(
        this.displayAllAssets.length,
        (this.currentPage + 1) * this.maxNum
      )
    },
    entityNameTitle(entity) {
      return (
        this.originalVideoTypes.get(entity.parent_id).label + '/' + entity.label
      )
    },
    confirmNewVideo(video) {
      this.newVideo(video)
    },
    confirmBatchNewVideo(videos) {
      this.newVideos(videos).then(res => {
        this.$refs.edit_video_library_batch_update_modal.clearData()
        return res
      })
    },
    confirmNewVideoType(videoType) {
      if (videoType.label) {
        this.newVideosType(videoType)
      }
    },
    async confirmEditVideo(video) {
      await this.modifyVideo(video)
      await this.refresh()
      this.$refs[video.id][0].refreshKey += 1
    },
    checkElectron() {
      this.setIsElectron(navigator.userAgent.includes('Electron'))
    },
    listToTree(data) {
      let out_data = []
      const tree = []
      const root = []
      if (data.size > 0) {
        const lookup = {}
        data.forEach((item, key) => {
          lookup[key] = { ...item, children: [] }
        })
        data.forEach((item, key) => {
          if (item.parent_id) {
            if (lookup[item.parent_id]) {
              lookup[item.parent_id].children.push(lookup[key])
            }
          } else {
            root.push(key)
          }
        })
        Object.values(lookup).forEach(node => {
          node.children.sort((a, b) => (a.order || 0) - (b.order || 0))
        })
        root.forEach(item => {
          tree.push(lookup[item])
        })
      }
      tree.sort((a, b) => (a.order || 0) - (b.order || 0))
      out_data = [
        {
          label: '所有',
          parent_id: '',
          id: 'all',
          isOpen: true,
          isSelected: true,
          children: tree
        }
      ]
      if (this.currentVideoType.id === undefined) {
        this.setCurrentVideoType(out_data[0])
      }
      if (!this.openedVideoTypes.has(out_data[0].id)) {
        this.setVideoTypeOpen(out_data[0])
      }
      return out_data
    },
    async menuAction(entity, action) {
      if (action === 'copyVideoPath') {
        try {
          navigator.clipboard.writeText(entity.path)
        } catch (error) {
          console.log(error)
        }
      } else if (action === 'delete') {
        this.modifyVideoActive(entity)
      } else if (action === 'openVideo') {
        window.api.showItemInFolder(entity.path)
      } else if (action === 'showBigImage') {
        this.modals.isImagePreviewDisplayed = true
        this.currentSelectVideo = entity
      } else if (action === 'deleteSelected') {
        this.modifyVideos()
        //console.log('deleteSelected')
      } else if (action === 'clearSelected') {
        this.clearSelectedVideos()
      } else if (action === 'modifyThumbnail') {
        this.currentSelectVideo = entity
        this.modals.isEditVideoAssetDisplayed = true
      } else if (action === 'openVideoType') {
        this.setAncestorOpened(entity.parent_id)
        console.log('openVideoType')
      }
    },
    toggleEntity(entity) {
      if (this.isShiftSelected) {
        if (!this.currentSelectVideo) {
          this.currentSelectVideo = entity
        } else {
          this.shiftEndSelection = entity
          const start = this.displayAllAssets.indexOf(this.currentSelectVideo)
          const end = this.displayAllAssets.indexOf(entity)
          let tempSelected = []
          if (start < end) {
            tempSelected = this.displayAllAssets.slice(start, end + 1)
          } else {
            tempSelected = this.displayAllAssets.slice(end, start + 1)
          }
          this.resetSelectedVideos(tempSelected)
        }
      } else {
        this.currentSelectVideo = entity
        this.setVideoSelection(entity)
      }
    },
    openFileWith(entity) {
      if (
        this.imageExtensions.includes(
          entity.path.split('.').pop().toLowerCase()
        )
      ) {
        this.modals.isImagePreviewDisplayed = true
        this.currentSelectVideo = entity
      } else {
        if (this.isElectron) window.api.openPath(entity.path)
      }
    },

    // onToggle(item) {
    //   this.originalVideoTypes.forEach(i => {
    //     //if (i.id === item.id) i.isOpen = item.isOpen
    //   })
    // },
    setSelected(item) {
      this.keyWord = ''
    },
    isSelected(entity) {
      return this.selectedVideos.has(entity.id)
    },
    onSearchEnter() {
      this.keyWord = this.searchField.getValue() || ''
    },
    onSearchChange() {
      if (!this.searchField.getValue()) this.keyWord = ''
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
    getAllChildrenId(type) {
      this.currentTypeAllId.push(type.id)
      if (type.children && type.children.length > 0) {
        type.children.forEach(i => {
          if (i.children && i.children.length > 0) {
            this.getAllChildrenId(i)
          } else {
            this.currentTypeAllId.push(i.id)
          }
        })
      }
    },
    editVideoSelection() {
      this.$store.commit('SET_IS_EDIT_VIDEO_SELECTION')
      if (this.isEditVideoSelection) {
        this.resetSelectedVideos(this.displayAllAssets)
      }
    },
    showNewModal() {
      if (
        this.currentVideoType.id === 'all' ||
        this.currentVideoType.id === undefined
      ) {
        this.modals.isDisplayedUpdateError = true
      } else {
        this.modals.isNewDisplayed = true
        this.modals.isDisplayedUpdateError = false
      }
      //this.$refs.edit_video_library_modal.videoToCreat.type =
      //this.ancestorLabels
    },
    showBatchNewModal() {
      if (
        this.currentVideoType.id === 'all' ||
        this.currentVideoType.id === undefined
      ) {
        this.modals.isDisplayedUpdateError = true
      } else {
        this.modals.isBatchNewDisplayed = true
        this.modals.isDisplayedUpdateError = false
      }
    },
    showNewTypeModal() {
      //console.log(this.currentVideoType)
      this.modals.isNewTypeDisplayed = true
      this.$refs.edit_video_library_add_type_modal.videoTypeToCreat.type =
        this.ancestorLabels
    }
  },
  watch: {
    originalVideoTypes(value) {
      this.videoTypeTreeData = this.listToTree(value)
    },
    currentVideoType() {
      this.currentTypeAllId = []

      //this.getAllChildrenId(this.currentVideoType)
    },
    displayAllAssets() {
      this.pageStartIndex = 0
      this.currentPage = 0
      if (new Date() - this.refreshTimer > 60000) {
        this.refresh().then(() => {
          this.$store.commit('SET_REFRESH_TIMER')
        })
      }
    }
  },
  metaInfo() {
    return {
      title: `${this.$t('video_library.video_library')} - Kitsu`
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

.list-head {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 2px solid #dadada;
  margin-bottom: 0.2cm;
  margin-left: 0.1cm;
}

.list-body {
  height: 90%;
  overflow: auto;
  //border: thick dotted #ff0000;
}

.items {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  //height: 100%;
  //overflow: auto;
}

.pagination {
  display: flex;
  justify-content: right;
  width: 100%;
  margin-top: 10px;
  //border: thick dotted #ff0000;
}

.pagination button {
  margin-left: 0.2cm;
  //cursor: not-allowed;
  &:hover {
    cursor: pointer;
  }
}

.type-text {
  font-size: 30px;
  margin-left: 0.4cm;
  user-select: none;
}

.update-video-button {
  border-radius: 1em;
  min-width: 3cm;
  min-height: 1.2cm;
  margin-right: 1em;
}

.update-video-error {
  margin-top: 10px;
  margin-left: 5px;
  font-size: 12px;
  color: $red;
}

.entities {
  display: flex;
  flex-direction: column;
  height: 100%;
  user-select: none;
}

.button.is-primary {
  border-radius: 30%;
  background: #00b242;
}

.item {
  background-color: var(--background);
  border: 5px solid transparent;
  border-radius: 1em;
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;
  max-height: 142px;

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
    white-space: nowrap;
    max-width: 140px;
    min-width: 140px;
    padding: 0.5em;

    .entity-name {
      margin-left: auto;
      margin-right: auto;
      white-space: nowrap;
      width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .shake {
    display: inline-block;
    animation: shake 0.5s ease-in-out infinite; /* 设置动画持续时间和无限循环 */
  }

  @keyframes shake {
    0% {
      transform: translateX(0) rotate(0deg);
    }
    25% {
      transform: translateX(-1px) rotate(-1deg);
    }
    50% {
      transform: translateX(1px) rotate(1deg);
    }
    75% {
      transform: translateX(-1px) rotate(-1deg);
    }
    100% {
      transform: translateX(0) rotate(0deg);
    }
  }

  .selectedItem {
    background-color: var(--background-selected);
  }
}
</style>
