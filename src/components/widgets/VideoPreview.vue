<template>
  <div class="preview-wrapper preview-video" v-if="isMovie && showMovie">
    <video-viewer
      ref="video-viewer"
      :is-repeating="true"
      :default-height="height"
      :preview="{
        id: entity.preview_file_id,
        extension: entity.preview_file_extension
      }"
      :is-rounded-top-border="isRoundedTopBorder"
      @click="onVideoClicked()"
    />
    <button-simple
      class="button-play"
      icon="play"
      ref="button-play"
      :title="$t('playlists.actions.play')"
      @click="onVideoClicked()"
    />
  </div>

  <a
    class="preview-wrapper preview-picture"
    :class="{ cover }"
    target="_blank"
    :style="{
      width: emptyWidth ? `${emptyWidth}px` : undefined,
      'min-width': emptyWidth ? `${emptyWidth}px` : undefined,
      height: emptyHeight ? `${emptyHeight}px` : undefined,
      'border-top-left-radius': isRoundedTopBorder ? '10px' : undefined,
      'border-top-right-radius': isRoundedTopBorder ? '10px' : undefined,
      'background-image': cover ? `url(${thumbnailPath})` : undefined
    }"
    v-else
  >
    <template v-if="!cover">
      <div
        class="thumbnail-picture-parent"
        @click.left="$emit('on-clicked-img')"
        @click.right="event => onPictureClicked(event)"
      >
        <img
          class="thumbnail-picture"
          loading="lazy"
          :key="thumbnailKey"
          :src="entity.has_thumbnail ? thumbnailPath : ''"
          :style="{
            width: 'auto',
            'max-height': `${emptyHeight}px`
          }"
          :width="width || ''"
          alt=""
        />
      </div>
      <span
        class="view-icon"
        ref="menuButton"
        @click.right="event => onPictureClicked(event)"
      >
        <!--align-justify :size="18" /-->
      </span>
      <div
        class="menu"
        ref="infoMenu"
        tabindex="0"
        v-if="isShowMenu"
        @blur="closeMenu"
        :style="{ left: `${menuLeft}px`, top: `${menuTop}px` }"
        v-focus
      >
        <ul>
          <li v-if="!isElectron" @click="menuAction('copyVideoPath')">
            {{ $t('video_library.copy_video_path') }}
          </li>
          <li v-if="isElectron" @click="menuAction('openVideo')">
            {{ $t('video_library.open_video') }}
          </li>
          <li v-if="isElectron" @click="menuAction('modifyThumbnail')">
            {{ $t('video_library.modify_thumbnail') }}
          </li>
          <li @click="menuAction('showBigImage')">
            {{ $t('video_library.show_big_image') }}
          </li>
          <li @click="menuAction('openVideoType')">
            {{ $t('video_library.open_asset_type') }}
          </li>
          <li @click="menuAction('delete')" v-if="isCurrentUserManager">
            {{ $t('video_library.delete') }}
          </li>
          <li @click="menuAction('deleteSelected')" v-if="isCurrentUserManager">
            {{ $t('video_library.delete_selected') }}
          </li>
          <li @click="menuAction('clearSelected')">
            {{ $t('video_library.clear_selected_video') }}
          </li>
        </ul>
      </div>
    </template>
  </a>
</template>

<script>
import { mapGetters } from 'vuex'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import VideoViewer from '@/components/previews/VideoViewer.vue'

export default {
  name: 'video-preview',
  props: {
    entity: {
      default: () => {},
      type: Object
    },
    cover: {
      default: false,
      type: Boolean
    },
    width: {
      default: null,
      type: Number
    },
    height: {
      default: null,
      type: Number
    },
    emptyHeight: {
      default: null,
      type: Number
    },
    emptyWidth: {
      default: null,
      type: Number
    },
    previewFileId: {
      default: null,
      type: String
    },
    isRoundedTopBorder: {
      default: false,
      type: Boolean
    },
    showMovie: {
      default: true,
      type: Boolean
    }
  },
  components: {
    ButtonSimple,
    VideoViewer
  },
  emits: ['on-clicked-img', 'on-show-menu', 'on-menu-action'],

  data() {
    return {
      isPlaying: false,
      isShowMenu: false,
      menuLeft: 0,
      menuTop: 0,
      timerId: null,
      refreshKey: 0
    }
  },

  mounted() {},
  computed: {
    ...mapGetters(['isElectron', 'isCurrentUserManager']),
    isMovie() {
      return this.entity.preview_file_extension === 'mp4'
    },

    thumbnailPath() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return (
        '/api/doodle/pictures/thumbnails/' +
        previewFileId +
        '.png?t' +
        new Date().getTime() +
        this.refreshKey
      )
    },

    thumbnailKey() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return `preview-${previewFileId + this.refreshKey.toString()}`
    }
  },
  beforeUnmount() {
    // 移除点击事件监听器
    window.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    onPictureClicked(event) {
      this.isShowMenu = true
      this.$nextTick(() => {
        const infoMenuRect = this.$refs.infoMenu.getBoundingClientRect()
        this.menuLeft = Math.min(
          window.innerWidth - infoMenuRect.width - 20,
          event.pageX
        )
        this.menuTop = Math.min(
          window.innerHeight - infoMenuRect.height - 10,
          event.pageY
        )
      })
      this.$emit('on-show-menu')
    },
    onVideoClicked() {
      if (this.isPlaying) {
        this.$refs['video-viewer'].pause()
        this.$refs['button-play'].$el.style.display = 'initial'
      } else {
        this.$refs['video-viewer'].play()
        this.$refs['button-play'].$el.style.display = 'none'
      }
      this.isPlaying = !this.isPlaying
    },
    menuAction(action) {
      this.$emit('on-menu-action', this.entity, action)
      this.closeMenu()
    },
    closeMenu() {
      this.isShowMenu = false
    },
    handleClickOutside() {
      this.closeMenu()
      // 如果点击区域不在菜单或按钮上，关闭菜单
    }
  }
}
</script>

<style lang="scss" scoped>
.preview-video {
  position: relative;
  width: 300px;
  min-height: 200px;
  cursor: pointer;
}

.thumbnail-picture-parent {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.button-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 40px;
  width: 40px;
  padding-left: 13px;
  line-height: initial;
  opacity: 0.75;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

a {
  background: $black;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

img {
  display: block;
  border: 0;
  border-radius: 0;
}

span.thumbnail-empty {
  background: $white-grey;
  display: block;
  margin: 0;
}

span.view-icon {
  background: rgba(0, 0, 0, 0);
  border-radius: 5px;
  color: $light-grey-light;
  display: none;
  padding: 0.4rem;
  height: 30px;
  position: absolute;
  right: 10px;
  top: 10px;
  width: 30px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(0, 0, 0, 0);
    color: $white;
  }
}

.preview-wrapper {
  position: relative;

  &:hover {
    span.view-icon {
      display: block;
    }
  }
}

.cover {
  background-size: cover;
}

.menu {
  position: fixed; /* 菜单固定在页面的顶层 */
  background-color: var(--background);
  max-height: 300px;
  padding: 10px;
  z-index: 1000; /* 确保菜单在最顶层显示 */
  width: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow-y: auto;
}

.menu ul {
  list-style: none;
  padding-left: 0;
  margin-left: 0;
}

.menu li {
  padding: 8px 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
}

.menu li:hover {
  background-color: var(--background-selectable);
}
</style>
