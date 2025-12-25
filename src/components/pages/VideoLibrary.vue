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
            v-if="isElectron && isCurrentUserSupervisorAbove"
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
            v-if="isElectron && isCurrentUserSupervisorAbove"
          >
            {{ $t('video_library.batch_update_video') }}
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
            <div class="tree-view" @click="setSelected">
              <tree-view
                v-for="item in typeTreeData"
                :key="item.id"
                ref="TreeView"
                :item="item"
                :parent="typeTreeData"
                @on-selected-change="setSelected"
                @on-add-type="
                  showNewTypeModal(typeTreeData, currentVideoType.id)
                "
                @dragover="onDragOver"
                @on-drag-end="onDragEnd"
              ></tree-view>
            </div>
            <div class="tree-view-separator" style="cursor: default"></div>
            <div class="tree-view" @click="setSelected">
              <tree-view
                v-for="item in labelTreeData"
                :key="item.id"
                ref="LabelTreeView"
                :item="item"
                :parent="labelTreeData"
                :is-label="true"
                @on-selected-change="setSelected"
                @on-add-type="
                  showNewTypeModal(labelTreeData, currentVideoLabel.id, true)
                "
                @dragover="onDragOver"
                @on-drag-end="onDragEnd"
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
                    {{ currentVideoType.label }} ({{
                      displayAllAssets.length > 1000
                        ? displayAllAssets.length * 8
                        : displayAllAssets.length
                    }})
                  </h1>
                  <div class="video-action">
                    <el-slider
                      v-model="imageSliderValue"
                      v-if="isShowBigImage"
                      style="width: 200px"
                    />
                    <el-switch v-model="isShowBigImage" />
                    <button-simple
                      :text="
                        isEditVideoSelection
                          ? $t('main.cancel') + $t('main.edit')
                          : $t('main.edit')
                      "
                      @click="editVideoSelection"
                      v-if="isCurrentUserSupervisorAbove"
                    />
                  </div>
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
                      <div
                        class="card"
                        :draggable="true"
                        @dragstart="onDragStart(entity)"
                      >
                        <video-preview
                          :ref="entity.id"
                          :empty-height="videoPreviewSize.width"
                          :empty-width="videoPreviewSize.height"
                          :height="200"
                          :width="250"
                          :entity="entity"
                          :preview-file-id="entity.id"
                          is-rounded-top-border
                          @on-menu-action="menuAction"
                          @on-clicked-img="
                            isEditVideoSelection
                              ? toggleEntity(entity)
                              : openFileWith(entity)
                          "
                        />
                        <div class="item-description flexrow">
                          <div class="entity-name">
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
        :video-label-id="currentVideoLabel.id"
        :video-types="typeTreeData"
        :video-labels="labelTreeData"
        @cancel="modals.isNewDisplayed = false"
        @on-confirm="confirmNewVideo"
      />
      <edit-video-library-batch-update-modal
        ref="edit_video_library_batch_update_modal"
        :active="modals.isBatchNewDisplayed"
        :video-type-id="currentVideoType.id"
        :video-label-id="currentVideoLabel.id"
        :video-types="typeTreeData"
        :video-labels="labelTreeData"
        @cancel="modals.isBatchNewDisplayed = false"
        @on-confirm="confirmBatchNewVideo"
      />
      <edit-video-library-add-type-modal
        ref="edit_video_library_add_type_modal"
        :active="modals.isNewTypeDisplayed"
        :parent-video-type="isAddLabel ? currentVideoLabel : currentVideoType"
        :video-types="isAddLabel ? labelTreeData : typeTreeData"
        :video-type-id="isAddLabel ? currentVideoLabel.id : currentVideoType.id"
        @cancel="modals.isNewTypeDisplayed = false"
        @on-confirm="confirmNewVideoType"
      />
      <edit-video-asset-modal
        ref="edit_video_asset_modal"
        :active="modals.isEditVideoAssetDisplayed"
        :asset-to-edit="currentSelectVideo"
        :video-types="typeTreeData"
        :video-labels="labelTreeData"
        :types-and-labels="{
          types: getAllChildrenIds(typeTreeData[0]),
          labels: getAllChildrenIds(labelTreeData[0])
        }"
        @cancel="modals.isEditVideoAssetDisplayed = false"
        @on-confirm="confirmEditVideo"
      />
      <image-preview-modal
        style="position: fixed"
        ref="image_preview_modal"
        :active="modals.isImagePreviewDisplayed"
        :preview-file-id="currentSelectVideo.id"
        :preview-file-type="currentSelectVideo.extension"
        @cancel="modals.isImagePreviewDisplayed = false"
        @switch-image="switchImage"
        :is-info="false"
        v-if="modals.isImagePreviewDisplayed"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
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
import { ModelLibraryStore } from '@/store/modules/modellibrary.js'
import { ElMessage } from 'element-plus'

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
          label: '类型',
          parent_id: '',
          id: 'all',
          isOpen: true,
          isSelected: false,
          children: []
        }
      ],
      dropEntry: null,
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
      pageStartIndex: 0,
      selectedTags: new Map(),
      allTypeName: new Map(),
      assetLabels: [],
      allVideoTypes: [],
      allVideoLabels: [],
      currentLabelAllId: [],
      typeTreeData: [],
      labelTreeData: [],
      isAddLabel: false,
      isShowBigImage: false,
      imageSliderValue: 50
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
  beforeUnmount() {
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
      'refreshTimer',
      'currentVideoLabel',
      'isCurrentUserSupervisorAbove'
    ]),
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
    videoPreviewSize() {
      const size = {
        width: 100,
        height: 150
      }
      if (this.isShowBigImage) {
        size.width = size.width + this.imageSliderValue * 3
        size.height = size.height + this.imageSliderValue * 3
      }
      return size
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
      this.setCurrentTypeAllId(this.currentVideoType)
      this.setCurrentLabelAllId(this.currentVideoLabel)
      return this.videos
        .filter(v => {
          return this.filterAssetsByTypeAndLabel(v)
        })
        .sort(this.naturalCompare)
    },
    searchAssetsData() {
      return this.sortedAssetsByType.filter(v => {
        return v.label.indexOf(this.keyWord) !== -1 || this.searchType(v)
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
      'setVideoTypeOpen',
      'resetSelectedVideos',
      'modifyVideoActive',
      'setIsUpdatingVideos',
      'setCurrentVideoLabel'
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
    handleTags(video) {},
    handleKeydown(event) {
      if (event.key === 'Shift') {
        this.isShiftSelected = true
      }
    },
    ancestorLabels(treeData, id) {
      const ancestors = this.getAncestors(treeData, id)
      return ancestors.map(node => node.label).join(' > ')
    },
    checkIncludeType(list = [], list2 = []) {
      if (list && list2) {
        for (const i of list) {
          if (list2.includes(i)) return true
        }
      }
      return false
    },
    onDragStart(entry) {
      this.dropEntry = entry
    },
    onDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    },
    async onDragEnd(item, isLabel) {
      if (isLabel) {
        const labelIndex = this.dropEntry.parents.indexOf(
          this.currentVideoLabel.id
        )
        if (labelIndex !== -1) {
          await ModelLibraryStore().actions.deleteTagLinkAsset(
            this.currentVideoLabel.id,
            this.dropEntry.id
          )
          this.dropEntry.parents.splice(labelIndex, 1)
        }
      } else {
        if (item.id !== this.currentVideoType.id) {
          const index = this.dropEntry.parents.indexOf(this.currentVideoType.id)
          if (index !== -1) {
            await ModelLibraryStore().actions.deleteTagLinkAsset(
              this.currentVideoType.id,
              this.dropEntry.id
            )
            this.dropEntry.parents.splice(index, 1)
          }
        }
      }

      if (item.id !== 'all') {
        await ModelLibraryStore().actions.tagLinkAsset(
          [item.id],
          this.dropEntry.id
        )
        this.dropEntry.parents.push(item.id)
      }
      //this.confirmEditVideo(this.dropEntry)
    },
    onClickTag() {
      this.selectedTags = ModelLibraryStore().state.selectedTags
    },
    searchType(asset) {
      for (const parent of asset.parents) {
        if (this.allTypeName.get(parent)?.path.indexOf(this.keyWord) !== -1) {
          return true
        }
      }
      return false
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
    naturalCompare(a, b) {
      const ax = [] // 存储 a 的字符和数字部分
      const bx = [] // 存储 b 的字符和数字部分
      // 将字符串拆分为字符和数字部分
      a.label.replace(/(\d+)|(\D+)/g, (_, $1, $2) =>
        ax.push($1 ? Number($1) : $2)
      )
      b.label.replace(/(\d+)|(\D+)/g, (_, $1, $2) =>
        bx.push($1 ? Number($1) : $2)
      )

      // 逐个比较字符和数字部分
      while (ax.length && bx.length) {
        const aa = ax.shift()
        const bb = bx.shift()

        if (typeof aa === 'number' && typeof bb === 'number') {
          if (aa !== bb) return aa - bb
        } else if (aa < bb) {
          return -1
        } else if (aa > bb) {
          return 1
        }
      }

      // 如果前面的部分都相同，比较长度
      return ax.length - bx.length
    },
    countMaxPage() {
      return Math.min(
        this.displayAllAssets.length,
        (this.currentPage + 1) * this.maxNum
      )
    },
    entityNameTitle(entity) {
      return (
        this.originalVideoTypes.get(entity.parent_id)?.label +
        '/' +
        entity.label
      )
    },
    filterAssetsByTypeAndLabel(asset) {
      if (
        this.currentVideoType.id === 'all' &&
        this.currentVideoLabel.id === '0196eb9d-5dc0-727d-8a75-1b05dea8494d'
      )
        return true
      else if (
        this.currentVideoType.id === 'all' &&
        this.checkIncludeType(asset.parents, this.currentLabelAllId)
      )
        return true
      else if (
        this.currentVideoLabel.id === '0196eb9d-5dc0-727d-8a75-1b05dea8494d' &&
        this.checkIncludeType(asset.parents, this.currentTypeAllId)
      )
        return true
      else
        return (
          this.checkIncludeType(asset.parents, this.currentTypeAllId) &&
          this.checkIncludeType(asset.parents, this.currentLabelAllId)
        )
    },
    async confirmNewVideo(video) {
      await this.newVideo(video)
    },
    async confirmBatchNewVideo(videos) {
      const res = await this.newVideos(videos)
      // for (const re of res) {
      //   await ModelLibraryStore().actions.tagLinkAsset(tags, re.id)
      //   re.labels = tags
      // }
      this.$refs.edit_video_library_batch_update_modal.clearData()
      return res
    },
    async confirmNewVideoType(videoType) {
      if (videoType.label) {
        if (await this.newVideosType(videoType)) ElMessage.success('创建成功')
      }
    },
    async confirmEditVideo(video, tags) {
      try {
        await ModelLibraryStore().actions.tagLinkAsset(tags, video.id)
        for (const tag of video.parents) {
          if (!tags.includes(tag)) {
            await ModelLibraryStore().actions.deleteTagLinkAsset(tag, video.id)
          }
        }
        await this.modifyVideo(video)
        this.currentSelectVideo = video
        await this.refresh()
        if (this.$refs[video.id][0]) this.$refs[video.id][0].refreshKey += 1
      } catch (error) {
        ElMessage.error(error.message)
      }
      this.setIsUpdatingVideos()
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
          label: '类型',
          parents: [],
          id: 'all',
          isOpen: true,
          isSelected: true,
          children: tree
        }
      ]
      this.allTypeName = this.getAllTypePaths(out_data[0])
      this.allTypeName.delete('all')
      return out_data
    },
    async menuAction(entity, action) {
      if (action === 'copyVideoPath') {
        try {
          await navigator.clipboard.writeText(entity.path)
        } catch (error) {
          console.log(error)
        }
      } else if (action === 'delete') {
        await this.deleteVideo(entity)
      } else if (action === 'openVideo') {
        const fs = require('fs')
        if (fs.existsSync(entity.path))
          await window.api.showItemInFolder(entity.path)
        else ElMessage.error('文件不存在')
      } else if (action === 'showBigImage') {
        this.modals.isImagePreviewDisplayed = true
        this.currentSelectVideo = entity
      } else if (action === 'deleteSelected') {
        const videos = Array.from(this.selectedVideos.values())
        for (const video of videos) {
          await this.deleteVideo(video)
        }
      } else if (action === 'clearSelected') {
        this.clearSelectedVideos()
      } else if (action === 'modifyThumbnail') {
        this.currentSelectVideo = entity
        this.modals.isEditVideoAssetDisplayed = true
      } else if (action === 'openVideoType') {
        this.setAncestorOpened(entity.parent_id)
      }
    },
    switchImage(isNext) {
      if (isNext) {
        const start = this.displayAllAssets.indexOf(this.currentSelectVideo)
        this.currentSelectVideo = this.displayAllAssets.slice(
          start + 1,
          start + 2
        )[0]
      } else {
        const start = this.displayAllAssets.indexOf(this.currentSelectVideo)
        this.currentSelectVideo = this.displayAllAssets.slice(
          start - 1,
          start
        )[0]
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
        const fs = require('fs')
        fs.existsSync(entity.path)
        if (this.isElectron)
          if (fs.existsSync(entity.path)) window.api.openPath(entity.path)
          else
            ElMessage.error({
              message: '文件不存在' + entity.path,
              dangerouslyUseHTMLString: true // 必须开启此项
            })
        else ElMessage.error('请使用客服端')
      }
    },

    // onToggle(item) {
    //   this.originalVideoTypes.forEach(i => {
    //     //if (i.id === item.id) i.isOpen = item.isOpen
    //   })
    // },
    setSelected() {
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
    async setCurrentTypeAllId(type) {
      this.currentTypeAllId = this.getAllChildrenIds(type)
    },
    setCurrentLabelAllId(type) {
      this.currentLabelAllId = this.getAllChildrenIds(type)
    },
    getAllChildrenIds(type, result = []) {
      if (type) {
        result.push(type.id)
        if (type.children && type.children.length > 0) {
          type.children.forEach(i => {
            if (i.children && i.children.length > 0) {
              this.getAllChildrenIds(i, result)
            } else {
              result.push(i.id)
            }
          })
        }
      }
      return result
    },
    getAllTypePaths(node, currentPath = '', result = new Map()) {
      const path = currentPath ? `${currentPath}>${node.label}` : node.label
      result.set(node.id, {
        id: node.id,
        path: path,
        label: node.label
      })

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          this.getAllTypePaths(child, path, result)
        }
      }
      return result
    },
    editVideoSelection() {
      this.$store.commit('SET_IS_EDIT_VIDEO_SELECTION')
      if (this.isEditVideoSelection) {
        this.resetSelectedVideos(this.displayAllAssets)
      }
    },
    showNewModal() {
      // if (
      //   this.currentVideoType.id === 'all' ||
      //   this.currentVideoType.id === undefined
      // ) {
      //   this.modals.isDisplayedUpdateError = true
      // } else {
      this.modals.isNewDisplayed = true
      this.modals.isDisplayedUpdateError = false
      // }
      //this.$refs.edit_video_library_modal.videoToCreat.type =
      //this.ancestorLabels
    },
    showBatchNewModal() {
      this.modals.isBatchNewDisplayed = true
      this.modals.isDisplayedUpdateError = false
    },
    showNewTypeModal(treeData, id, isLabel = false) {
      //console.log(this.currentVideoType)
      this.isAddLabel = isLabel
      this.$refs.edit_video_library_add_type_modal.videoTypeToCreat.type =
        this.ancestorLabels(treeData, id)
      this.modals.isNewTypeDisplayed = true
    }
  },
  watch: {
    originalVideoTypes(value) {
      this.videoTypeTreeData = this.listToTree(value)
      this.typeTreeData = [
        {
          label: '类型',
          parent_id: '',
          id: 'all',
          isOpen: true,
          isSelected: true,
          disabled: true,
          children: this.videoTypeTreeData[0].children.filter(
            t => t.id !== '0196eb9d-5dc0-727d-8a75-1b05dea8494d'
          )
        }
      ]
      this.labelTreeData = this.videoTypeTreeData[0].children.filter(
        t => t.id === '0196eb9d-5dc0-727d-8a75-1b05dea8494d'
      )
      this.labelTreeData[0].isSelected = true
      if (this.currentVideoType.id === undefined) {
        this.setCurrentVideoType(this.typeTreeData)
      }
      if (this.currentVideoLabel.id === undefined) {
        this.setCurrentVideoLabel(this.typeTreeData)
      }
      if (!this.openedVideoTypes.has(this.videoTypeTreeData[0].id)) {
        this.setVideoTypeOpen(this.videoTypeTreeData[0])
      }
    },
    currentVideoType() {
      this.currentTypeAllId = []

      //this.getAllChildrenIds(this.currentVideoType)
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
  head() {
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
  max-height: 50px;
}

.model-library-tag {
  overflow: auto;
  max-height: 60px;
  min-height: 60px;
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
  overflow: hidden; // 启用滚动条
}

.main-content-separator {
  width: 2px;
  cursor: ew-resize;
  background-color: rgba(100, 100, 100, 0.5);
  position: relative;
  z-index: 10;
}

.list-head {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 2px solid rgba(100, 100, 100, 0.5);
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
  //max-height: 142px;

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
    //max-width: 140px;
    //min-width: 140px;
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

.tree-view {
  max-height: 48%;
  overflow: auto;
}

.tree-view-separator {
  height: 2px;
  margin: 2px;
  cursor: ew-resize;
  background-color: rgba(100, 100, 100, 0.5);
  position: relative;
  z-index: 10;
}
.video-action {
  display: flex;
  flex-flow: row;
  gap: 20px;
}
</style>
