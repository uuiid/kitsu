<template>
  <td class="description-cell" @keyup.esc="onClick" @click="onClick">
    <template v-if="full">
      <div
        class="description-shorten-text"
        v-html="renderMarkdown(entry.description)"
      ></div>
    </template>
    <template v-else>
      <div class="c-mask" v-if="isOpen"></div>
      <span
        class="description-shorten-text selectable"
        v-html="
          renderMarkdown(shortenText(entry.description, 20), {
            allowedLinkTag: false
          })
        "
      >
      </span>
      <teleport to="body">
        <div
          class="tooltip"
          :class="{ dark: isDarkTheme }"
          @dblclick="onDoubleClick"
          @keyup.esc="onClick"
          v-if="isOpen"
          :style="tooltipStyle"
        >
          <div
            class="tooltip-text"
            @keyup.esc="onClick"
            v-html="renderMarkdown(entry.description)"
            v-if="!isEditing"
          ></div>
          <textarea
            class="tooltip-editor"
            ref="text"
            :value="stripHtml"
            @keyup.esc="onClick"
            @keyup.ctrl.enter="onDoubleClick"
            @mouseup="onMouseup"
            @mousedown="showPopover = false"
            v-else
          >
          </textarea>
          <div
            class="popover"
            :style="`top:${popoverPosition.top}px;left:${popoverPosition.left}px`"
            v-show="showPopover && isEditing"
            @blur="showPopover = false"
          >
            <span>添加选择为标记</span>
            <div class="popover-action">
              <button class="button" @click="addMark">添加</button>
            </div>
          </div>
        </div>
      </teleport>
    </template>
  </td>
</template>

<script>
import { mapGetters } from 'vuex'

import { renderMarkdown } from '@/lib/render'
import stringHelpers from '@/lib/string'

export default {
  name: 'description-cell',

  data() {
    return {
      isEditing: false,
      isOpen: false,
      tooltipPosition: { top: 0, left: 0 },
      showPopover: false,
      popoverPosition: { top: 0, left: 0 },
      selectedText: ''
    }
  },

  props: {
    editable: {
      type: Boolean,
      default: false
    },
    entry: {
      type: Object,
      default: () => {}
    },
    full: {
      type: Boolean,
      default: false
    }
  },

  emits: ['description-changed'],

  computed: {
    ...mapGetters(['isDarkTheme']),
    stripHtml() {
      const div = document.createElement('div')
      div.innerHTML = this.entry.description
      return div.textContent || div.innerText || ''
    },
    tooltipStyle() {
      return {
        top: this.tooltipPosition.top + 'px',
        left: this.tooltipPosition.left + 'px'
      }
    }
  },

  methods: {
    renderMarkdown,

    shortenText: stringHelpers.shortenText,

    onClick(event) {
      if (
        (event.currentTarget.classList.contains('description-cell') &&
          !event.target.closest('.description-cell .tooltip')) ||
        event.keyCode === 27
      ) {
        this.isOpen = !this.isOpen
        if (this.isOpen) {
          const td = event.currentTarget
          const rect = td.getBoundingClientRect()
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop
          const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft
          this.tooltipPosition = {
            top: rect.top + scrollTop - 105,
            left: rect.left + scrollLeft + rect.width / 2 - 160
          }
        } else if (this.isEditing) {
          this.isEditing = false
          const val = this.$refs.text.value
          if (val !== this.stripHtml) this.$emit('description-changed', val)
        }
      }
    },
    onDoubleClick() {
      if (this.editable) {
        if (this.isEditing) {
          const val = this.$refs.text.value
          this.$emit('description-changed', val)
        }
        this.isEditing = !this.isEditing
        if (this.isEditing) {
          this.$nextTick(() => {
            this.$refs.text.focus()
          })
        }
      }
    },
    onMouseup(event) {
      this.popoverPosition.top = event.layerY - 40
      this.popoverPosition.left = event.layerX + 10
      this.$nextTick(() => {
        const start = this.$refs.text.selectionStart
        const end = this.$refs.text.selectionEnd
        if (start !== end) {
          this.selectedText = this.$refs.text.value.substring(start, end)
          if (this.selectedText) this.showPopover = true
        }
      })
    },
    addMark() {
      const newDescription =
        this.$refs.text.value.substring(0, this.$refs.text.selectionStart) +
        `<span>` +
        this.$refs.text.value.substring(
          this.$refs.text.selectionStart,
          this.$refs.text.selectionEnd
        ) +
        `</span>` +
        this.$refs.text.value.substring(
          this.$refs.text.selectionEnd,
          this.$refs.text.textLength
        )
      this.showPopover = false
      this.isEditing = false
      this.$emit('description-changed', newDescription)
    }
  }
}
</script>

<style lang="scss" scoped>
.dark.tooltip {
  background: $dark-grey-light;
  box-shadow: 0 0 3px 0 $dark-grey-strong;

  &::after {
    border-top-color: $dark-grey-light;
  }
}

.description-cell {
  cursor: pointer;
  position: relative;
}

.description-shorten-text {
  min-height: 30px;
  min-width: 100px;
}

.tooltip {
  background-color: $white;
  border-radius: 0.5rem;
  display: block;
  font-size: 0.9em;
  min-height: 100px;
  max-height: 200px;
  padding: 0.6rem;
  position: absolute;
  width: 320px;
  box-shadow: 0 0 3px 0 $grey;
  z-index: 1000;

  p {
    margin: 1em;
  }

  .tooltip-text {
    padding: 0.5em;
    overflow-y: auto;
    height: 80px;

    :deep(span) {
      color: red;
    }
  }

  .tooltip-editor {
    box-shadow: inset 0 0 3px 0 $grey;
    padding: 0.5em;
    color: inherit;
    font-size: 0.95em;
    height: 100%;
    line-height: 1.7em;
    min-height: 80px;
    width: 100%;

    &:focus {
      outline: none;
    }
  }

  &::after {
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    height: 0;
    width: 0;
    border: 0.5rem solid transparent;
    border-top-color: $white;
    content: '';
  }
}

.c-mask {
  width: 100%;
  height: 100%;
}

.popover {
  z-index: 1000;
  position: absolute;
  background: var(--background);
  border-radius: 5px;
  padding: 5px;
  box-shadow: 0 0 3px 0 $grey;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.popover-action {
  display: flex;
  flex-direction: row;
  gap: 5px;
}
</style>
