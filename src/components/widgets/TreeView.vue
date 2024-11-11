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
      {{ item.label }}
      <span v-if="isSelected(item)">
        <plus :size="18" @click="addType" />
        <minus :size="18" v-if="isCurrentUserManager" @click="deleteType" />
      </span>
    </span>
    <ul v-if="isOpened(item) && item.children && item.children.length">
      <tree-view
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :all="allOptions"
        @onAddType="addType"
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
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-vue'
import { mapActions, mapGetters } from 'vuex'
import MessageBox from '@/components/modals/MessageBox.vue'

export default {
  name: 'tree-view',
  components: {
    ChevronDown,
    ChevronRight,
    Plus,
    Minus,
    MessageBox
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
      'isCurrentUserManager'
    ]),
    isShowMinus() {
      return this.isCurrentUserManager && this.item.id !== 'all'
    }
  },
  mounted() {
    if (this.item.isSelected) {
      this.$store.commit('SET_CURRENT_VIDEO_TYPE', this.item)
    }
  },
  methods: {
    ...mapActions(['setVideoTypeOpen', 'deleteVideoType']),
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
    isOpened(item) {
      return this.openedVideoTypes.has(item.id)
    },
    selectItem(selectedItem) {
      this.$store.commit('SET_CURRENT_VIDEO_TYPE', selectedItem)
      this.$emit('onSelectedChange', selectedItem)
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
      this.$emit('onAddType')
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
