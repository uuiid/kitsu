<template>
  <div class="treeView">
    <span
      class="treeViewItem"
      :class="{ selectedItem: item.isSelected }"
      @click="selectItem(item)"
    >
      <span
        v-if="item.children && item.children.length"
        @click.stop="toggle(item)"
      >
        <chevron-down :size="18" v-if="item.isOpen" />
        <chevron-right :size="18" v-if="!item.isOpen" />
      </span>
      {{ item.label }}
      <span v-if="item.isSelected" @click="addType">
        <plus :size="18" />
      </span>
    </span>
    <ul v-if="item.isOpen && item.children && item.children.length">
      <tree-view
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :all="allOptions"
        @onSelectedChange="selectItem"
        @onAddType="addType"
      />
    </ul>
  </div>
</template>

<script>
import { ChevronDown, ChevronRight, Plus } from 'lucide-vue'
export default {
  name: 'tree-view',
  components: {
    ChevronDown,
    ChevronRight,
    Plus
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
      required: true
    }
  },
  data() {
    return {
      Options: this.options,
      allOptions: this.all.length ? this.all : this.options,
      isShowAdd: false,
      isSelected: false,
      isOpen: true
    }
  },
  methods: {
    toggle(item) {
      this.$set(item, 'isOpen', !item.isOpen)
      this.$emit('onToggle', item)
    },

    selectItem(selectedItem) {
      this.$emit('onSelectedChange', selectedItem)
      this.$set(selectedItem, 'isSelected', true)
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
