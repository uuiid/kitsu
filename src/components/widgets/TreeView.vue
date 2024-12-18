<template>
  <div class="treeView">
    <span
      class="treeViewItem"
      :class="{ selectedItem: isSelected(item) }"
      @click="selectItem(item)"
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
          @click="deleteType"
        />
      </span>
    </span>
    <ul v-if="isOpened(item) && item.children && item.children.length">
      <tree-view
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :all="allOptions"
        @on-add-type="addType"
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
    }
  },
  emits: ['on-selected-change', 'on-add-type'],
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
      'originalVideoTypes'
    ]),
    isShowRoot() {
      return this.isCurrentUserManager && this.item.id !== 'all'
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
      this.$store.commit('SET_CURRENT_VIDEO_TYPE', this.item)
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
      if (this.currentVideoType) {
        return this.currentVideoType.id === entity.id
      } else {
        return false
      }
    },
    showArrowDown() {
      if (this.isShowRoot && this.$parent.item.children.length > 0) {
        return (
          this.$parent.item.children[this.$parent.item.children.length - 1]
            .id !== this.item.id
        )
      } else {
        return false
      }
    },
    showArrowUp() {
      if (this.isShowRoot && this.$parent.item.children.length > 0) {
        return this.$parent.item.children[0].id !== this.item.id
      } else {
        return false
      }
    },
    isOpened(item) {
      return this.openedVideoTypes.has(item.id)
    },
    selectItem(selectedItem) {
      this.$store.commit('SET_CURRENT_VIDEO_TYPE', selectedItem)
      this.$emit('on-selected-change', selectedItem)
    },
    orderUp() {
      this.modifyVideoTypeOrder({
        type: this.item,
        other: this.originalVideoTypes.get(
          this.$parent.item.children[
            this.$parent.item.children.findIndex(
              item => item.id === this.item.id
            ) - 1
          ].id
        )
      })
    },
    orderDown() {
      this.modifyVideoTypeOrder({
        type: this.item,
        other: this.originalVideoTypes.get(
          this.$parent.item.children[
            this.$parent.item.children.findIndex(
              item => item.id === this.item.id
            ) + 1
          ].id
        )
      })
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
    deleteType() {
      this.deleteVideoType().then(res => {
        if (res.status === 400) {
          this.isMessageBox = true
        }
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

  &:hover {
    background-color: var(--background-selectable);
    cursor: pointer;
  }
}

.selectedItem {
  background-color: var(--background-selected);
}
</style>
