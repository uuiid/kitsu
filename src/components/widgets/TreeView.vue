<template>
  <div class="treeView">
    <span
      class="treeViewItem"
      :class="{ selectedItem: isSelected(item), 'drop-item': item.isDragging }"
      @click="selectItem(item)"
      @drop="onDragEnd(item, isLabel)"
      @dragenter="onDragEnter(item)"
      @dragleave="onDragLeave(item)"
    >
      <span
        v-if="item.children && item.children.length"
        @click.stop="toggle(item)"
      >
        <chevron-down :size="18" v-if="isOpened(item)" />
        <chevron-right :size="18" v-if="!isOpened(item)" />
      </span>
      <dot :size="18" v-else />
      {{ item.label }}
      <span v-if="isSelected(item)">
        <arrow-up
          :size="18"
          @click="orderUp"
          v-if="isShowRoot && isShowArrowUp && isCurrentUserManager"
        />
        <arrow-down
          :size="18"
          @click="orderDown"
          v-if="isShowRoot && isShowArrowDown && isCurrentUserManager"
        />
        <plus :size="18" @click="addType" v-if="isCurrentUserManager" />
        <minus
          :size="18"
          v-if="isCurrentUserManager && isShowRoot"
          @click="deleteType(item)"
        />
      </span>
    </span>
    <ul v-if="isOpened(item) && item.children && item.children.length">
      <tree-view
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :all="allOptions"
        :parent="item"
        :is-label="isLabel"
        @on-add-type="addType"
        @on-drag-end="onDragEnd"
      />
    </ul>
    <message-box
      class="message-box"
      :active="isMessageBox"
      @cancel="isMessageBox = false"
    ></message-box>
  </div>
</template>

<script>
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Dot
} from 'lucide-vue-next'
import { mapActions, mapGetters } from 'vuex'
import MessageBox from '@/components/modals/MessageBox.vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'tree-view',
  components: {
    ChevronDown,
    ChevronRight,
    Plus,
    Minus,
    MessageBox,
    ArrowUp,
    ArrowDown,
    Dot
  },
  props: {
    options: {
      type: Array,
      default: () => []
    },
    all: {
      type: Array,
      default: () => []
    },
    item: {
      type: Object,
      default: () => {}
    },
    parent: {
      type: Object,
      default: () => {}
    },
    isLabel: {
      type: Boolean,
      default: false
    }
  },
  emits: ['on-selected-change', 'on-add-type', 'on-drag-end'],
  data() {
    return {
      Options: this.options,
      allOptions: this.all.length ? this.all : this.options,
      isShowAdd: false,
      isMessageBox: false
    }
  },
  computed: {
    ...mapGetters([
      'openedVideoTypes',
      'currentVideoType',
      'isCurrentUserManager',
      'originalVideoTypes',
      'currentVideoLabel'
    ]),
    isShowRoot() {
      return (
        this.isCurrentUserManager &&
        this.item.id !== 'all' &&
        this.item.id !== '0196eb9d-5dc0-727d-8a75-1b05dea8494d'
      )
    },
    isShowArrowDown() {
      return this.showArrowDown()
    },
    isShowArrowUp() {
      return this.showArrowUp()
    }
  },
  mounted() {
    if (this.item.isSelected) {
      if (this.isLabel) {
        this.$store.commit('SET_CURRENT_VIDEO_LABEL', this.item)
      } else this.$store.commit('SET_CURRENT_VIDEO_TYPE', this.item)
    }
  },
  methods: {
    ...mapActions([
      'setVideoTypeOpen',
      'deleteVideoType',
      'modifyVideoTypeOrder'
    ]),
    toggle(item) {
      this.setVideoTypeOpen(item)
    },
    isSelected(entity) {
      if (this.currentVideoType || this.currentVideoLabel) {
        return (
          this.currentVideoType.id === entity.id ||
          this.currentVideoLabel.id === entity.id
        )
      } else {
        return false
      }
    },
    showArrowDown() {
      if (
        this.item.id !== '0196eb9d-5dc0-727d-8a75-1b05dea8494d' &&
        this.isShowRoot &&
        this.$parent.item.children.length > 0
      ) {
        return (
          this.$parent.item.children[this.$parent.item.children.length - 1]
            .id !== this.item.id
        )
      }
      return false
    },
    showArrowUp() {
      if (
        this.item.id !== '0196eb9d-5dc0-727d-8a75-1b05dea8494d' &&
        this.isShowRoot &&
        this.$parent.item.children.length > 0
      ) {
        return this.$parent.item.children[0].id !== this.item.id
      } else {
        return false
      }
    },
    onDragEnter(item) {
      item.isDragging = true
    },
    onDragLeave(item) {
      item.isDragging = false
    },
    onDragEnd(event, isLabel) {
      event.isDragging = false
      this.$emit('on-drag-end', event, isLabel)
    },
    isOpened(item) {
      return this.openedVideoTypes.has(item.id)
    },
    selectItem(selectedItem) {
      if (this.isLabel) {
        this.$store.commit('SET_CURRENT_VIDEO_LABEL', this.item)
      } else this.$store.commit('SET_CURRENT_VIDEO_TYPE', this.item)
      this.$emit('on-selected-change', selectedItem)
    },
    async orderUp() {
      const other = this.originalVideoTypes.get(
        this.$parent.item.children[
          this.$parent.item.children.findIndex(
            item => item.id === this.item.id
          ) - 1
        ].id
      )
      let current_order = this.item.order
      let other_order = other.order
      if (other.order === this.item.order) {
        let num = 0
        const videos = []
        for (const i of this.parent.children) {
          if (i.order !== num) {
            i.order = num
          }
          videos.push(i)
          if (i.id === this.item.id) {
            current_order = i.order
          } else if (i.id === other.id) {
            other_order = i.order
          }
          num++
        }
        if (videos.length > 0) {
          await this.modifyVideoTypeOrder(videos)
        }
      }
      const data = []
      data.push({
        label: this.item.label,
        parent_id: this.item.parent_id,
        id: this.item.id,
        order: other_order
      })
      data.push({
        label: other.label,
        parent_id: other.parent_id,
        id: other.id,
        order: current_order
      })
      await this.modifyVideoTypeOrder(data)
    },
    async orderDown() {
      const other = this.originalVideoTypes.get(
        this.$parent.item.children[
          this.$parent.item.children.findIndex(
            item => item.id === this.item.id
          ) + 1
        ].id
      )
      let current_order = this.item.order
      let other_order = other.order
      if (other.order === this.item.order) {
        let num = 0
        const videos = []
        for (const i of this.parent.children) {
          if (i.order !== num) {
            i.order = num
          }
          videos.push(i)
          if (i.id === this.item.id) {
            current_order = i.order
          } else if (i.id === other.id) {
            other_order = i.order
          }
          num++
        }
        if (videos.length > 0) {
          await this.modifyVideoTypeOrder(videos)
        }
      }
      const data = []
      data.push({
        label: this.item.label,
        parent_id: this.item.parent_id,
        id: this.item.id,
        order: other_order
      })
      data.push({
        label: other.label,
        parent_id: other.parent_id,
        id: other.id,
        order: current_order
      })
      await this.modifyVideoTypeOrder(data)
    },
    // 递归清除所有项的选中状态
    clearAllSelections(items) {
      items.forEach(item => {
        this.$set(item, 'isSelected', false) // 取消当前项的选中状态
        if (item.children && item.children.length) {
          this.clearAllSelections(item.children) // 递归取消子项的选中状态
        }
      })
    },
    addType() {
      this.$emit('on-add-type')
    },
    deleteType(item) {
      this.deleteVideoType(item).then(res => {
        if (res.status === 400) {
          this.isMessageBox = true
        }
        ElMessage.success('删除成功')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.treeView ul {
  list-style: none;
}

.treeViewItem {
  font-size: 20px;
  width: auto;
  user-select: none;
  white-space: nowrap;
  border: 2px dashed transparent;
  border-radius: 5px;
  transition: border-color 0.2s ease-in-out;

  &:hover {
    background-color: var(--background-selectable);
    cursor: pointer;
  }

  &.drop-item {
    border-color: $green;
    color: $green;
  }
}

.selectedItem {
  background-color: var(--background-selected);
}
</style>
