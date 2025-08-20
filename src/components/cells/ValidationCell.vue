<template>
  <td
    :class="{
      canceled,
      disabled,
      selected: selectable & selected,
      validation: selectable
    }"
    :style="cellStyle"
  >
    <el-config-provider :locale="zhCn">
      <div class="wrapper full-wrapper" :style="wrapperStyle" v-if="!minimized">
        <div class="filler" v-if="contactSheet"></div>
        <div
          class="wrapper status-wrapper"
          :class="{ 'custom-status': selectable }"
          :style="statusWrapperStyle"
          v-if="!minimized"
          @click="onClick"
        >
          <template v-if="task">
            <span
              class="tag"
              :title="taskStatus.name"
              :style="tagStyle"
              v-if="!contactSheet"
            >
              {{ taskStatus.short_name }}
            </span>
            <span class="filler" v-if="contactSheet"></span>
            <span
              :class="{
                priority: true,
                high: task.priority === 1,
                veryhigh: task.priority === 2,
                emergency: task.priority === 3
              }"
              :title="formatPriority(task.priority)"
              v-if="!isCurrentUserClient && !disabled && task.priority > 0"
            >
              {{ priority }}
            </span>
            <span
              class="casting-status"
              :class="{ 'casting-status-not-ready': !isCastingReady }"
              :title="castingTitle"
              v-if="!isCurrentUserClient && castingTitle"
            >
              <img
                src="@/assets/icons/casting-ready.png"
                v-if="isCastingReady"
                alt=""
              />
              <img src="@/assets/icons/casting-not-ready.png" v-else alt="" />
            </span>
          </template>
          <template v-if="isAssignees && !isCurrentUserClient && !disabled">
            <span
              class="avatar has-text-centered"
              :title="person.full_name"
              :style="{
                backgroundColor: person.color,
                color: isDarkTheme ? '#333' : '#FFF',
                'font-weight': isDarkTheme ? 'bold' : 'normal'
              }"
              :key="`avatar-${person.id}`"
              v-for="person in assignees"
            >
              <img
                loading="lazy"
                alt=""
                :src="person.avatarPath"
                v-if="person.has_avatar"
              />
              <template v-else>{{ person.initials }}</template>
            </span>
            <span class="dot-content" v-if="task?.working_files.length > 0">
              <span
                class="dot"
                :style="`right: ${(index + 1) * 5 + index * 5}px;`"
                v-for="(work, index) in task.working_files"
                :key="work.id"
                v-show="work.path"
              ></span>
            </span>
          </template>
          <span class="subscribed" v-if="task?.is_subscribed">
            <eye-icon :size="12" />
          </span>
        </div>
        <div class="date-input" v-if="isShowDate && task">
          <div
            class="custom-input"
            v-if="!isShouEditeDate"
            @click.stop="onClickDate"
          >
            {{
              task.start_date === null && task.due_date === null
                ? ''
                : `${formatDate(task.start_date)}-${formatDate(task.due_date)}`
            }}
          </div>
          <el-date-picker
            ref="datePicker"
            class="custom-input"
            v-model="task.dateRange"
            type="daterange"
            :range-separator="
              task.start_date === null && task.due_date === null ? '' : '-'
            "
            unlink-panels
            placeholder="Select date and time"
            @change="onEntryChange"
            @blur="isShouEditeDate = false"
            v-if="isShouEditeDate"
            v-focus
          />
        </div>
      </div>
      <div class="wrapper" v-else>
        <span class="tag" :style="tagStyle"> &nbsp; </span>
      </div>
    </el-config-provider>
  </td>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { EyeIcon } from 'lucide-vue-next'

import colors from '@/lib/colors'
import { sortPeople } from '@/lib/sorting'
import { formatListMixin } from '@/components/mixins/format'
import moment from 'moment-timezone'
import { zhCn } from 'element-plus/es/locale/index'

export default {
  name: 'validation-cell',

  mixins: [formatListMixin],

  data() {
    return {
      task: null,
      value: '',
      isShouEditeDate: false
    }
  },

  components: {
    EyeIcon
  },

  props: {
    column: {
      default: null,
      type: Object
    },
    entity: {
      default: null,
      type: Object
    },
    taskTest: {
      default: null,
      type: Object
    },
    isCastingReady: {
      default: false,
      type: Boolean
    },
    castingTitle: {
      default: '',
      type: String
    },
    isBorder: {
      default: true,
      type: Boolean
    },
    // FIXME: property no longer used in component
    isStatic: {
      default: false,
      type: Boolean
    },
    isAssignees: {
      default: true,
      type: Boolean
    },
    minimized: {
      default: false,
      type: Boolean
    },
    selectable: {
      default: true,
      type: Boolean
    },
    clickable: {
      default: true,
      type: Boolean
    },
    selected: {
      default: false,
      type: Boolean
    },
    disabled: {
      default: false,
      type: Boolean
    },
    rowX: {
      default: 0,
      type: Number
    },
    columnY: {
      default: 0,
      type: Number
    },
    left: {
      type: String,
      default: '0px'
    },
    sticked: {
      default: false,
      type: Boolean
    },
    canceled: {
      default: false,
      type: Boolean
    },
    contactSheet: {
      default: false,
      type: Boolean
    },
    isShowDate: {
      default: false,
      type: Boolean
    }
  },

  mounted() {
    if (this.taskTest) {
      this.task = this.taskTest
    } else if (this.column && this.entity?.validations) {
      this.task = this.taskMap.get(this.entity.validations.get(this.column.id))
    }
    if (this.task)
      if (this.task.start_date === null && this.task.due_date === null)
        this.task.dateRange = []
      else
        this.task.dateRange = [
          this.task.start_date || '0000-00-00',
          this.task.due_date || '9999-12-31'
        ]
  },

  computed: {
    zhCn() {
      return zhCn
    },
    ...mapGetters([
      'isCurrentUserClient',
      'isDarkTheme',
      'personMap',
      'taskMap',
      'taskStatusMap'
    ]),

    assignees() {
      return sortPeople(
        this.task?.assignees.map(personId => this.personMap.get(personId)) || []
      )
    },

    priority() {
      return this.formatPrioritySymbol(this.task.priority)
    },

    cellStyle() {
      let backgroundColor
      if (this.isBorder && !this.sticked) {
        const opacity = this.isDarkTheme ? 0.15 : 0.08
        backgroundColor = colors.hexToRGBa(this.column.color, opacity)
      }

      return {
        borderLeft: this.isBorder ? `1px solid ${this.column.color}` : 'none',
        backgroundColor: backgroundColor,
        left: this.left
      }
    },

    tagStyle() {
      const isTodo = this.taskStatus.name === 'Todo'
      let backgroundColor
      if (isTodo) {
        backgroundColor = this.isDarkTheme ? '#5F626A' : '#ECECEC'
      } else if (this.taskStatus.color) {
        backgroundColor = this.isDarkTheme
          ? colors.darkenColor(this.taskStatus.color)
          : this.taskStatus.color
      } else {
        backgroundColor = 'transparent'
      }
      const color = !isTodo || this.isDarkTheme ? 'white' : '#333'
      return {
        backgroundColor,
        color
      }
    },

    wrapperStyle() {
      if (!this.task || !this.contactSheet) return {}
      const path =
        '/api/pictures/thumbnails/preview-files/' +
        this.task.last_preview_file_id +
        '.png'
      return {
        'background-image': 'url(' + path + ')',
        'background-color': this.taskStatus.color + '44',
        height: '100px',
        width: '150px',
        display: 'flex',
        'flex-direction': this.contactSheet ? 'column' : 'row'
      }
    },

    statusWrapperStyle() {
      if (!this.task || !this.contactSheet)
        return {
          padding: '6px'
        }
      return {
        width: '150px',
        padding: '6px',
        'text-align:': 'right'
      }
    },

    taskStatus() {
      const taskStatusId = this.task?.task_status_id
      return this.taskStatusMap?.get(taskStatusId) || {}
    }
  },

  methods: {
    ...mapActions(['updateTask']),
    onClick(event) {
      if (this.clickable) {
        this.select(event)
      }
      console.log(this.task)
    },
    getDate(date) {
      return date ? moment(date, 'YYYY-MM-DD').toDate() : null
    },
    formatDate(date) {
      if (date) return moment(date).format('YYYY-MM-DD')
      return '\n'
    },
    onClickDate() {
      this.isShouEditeDate = true
      this.$nextTick(() => {
        this.$refs.datePicker.focus()
        console.log(this.$refs.datePicker)
      })
    },
    onEntryChange() {
      if (this.task) {
        const taskId = this.task.id
        const data = {
          start_date: this.formatDate(this.task.dateRange[0]),
          due_date: this.formatDate(this.task.dateRange[1])
        }
        if (
          this.task.start_date === data.start_date &&
          this.task.due_date === data.due_date
        ) {
          return
        } else {
          this.updateTask({ taskId, data })
            .then(() => {
              this.task.start_date = data.start_date
              this.task.due_date = data.due_date
            })
            .catch(console.error)
        }
      }
    },
    select(event) {
      if (!this.selectable) {
        return
      }
      this.$emit(!this.selected ? 'select' : 'unselect', {
        entity: this.entity,
        column: this.column,
        task: this.task,
        x: this.rowX,
        y: this.columnY,
        isCtrlKey: event.ctrlKey || event.metaKey,
        isShiftKey: event.shiftKey,
        isUserClick: event.isUserClick !== false
      })
    }
  },

  watch: {
    taskTest() {
      if (this.taskTest) {
        this.task = this.taskTest
      } else if (this.entity?.validations) {
        this.task = this.taskMap.get(
          this.entity.validations.get(this.column.id)
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.validation {
  cursor: pointer;
  margin-bottom: 3px;
  padding: 0;

  &.selected {
    background-color: #bfc1ff !important;

    .dark & {
      background-color: #5e60ba !important;
    }
  }
}

.custom-status {
  &:hover {
    background-color: #5e60ba !important;
  }
}

.wrapper {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  width: 100%;
}

.full-wrapper {
  flex: 1;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  width: 21px;
  height: 21px;
  font-size: 10px;

  img {
    width: 21px;
    height: 21px;
  }
}

.tag {
  font-weight: 500;
  letter-spacing: 1px;
  margin-right: 0.1em;
  margin-bottom: 0.3em;
  text-transform: uppercase;
}

.disabled {
  background-color: rgba(0, 0, 0, 0.15) !important;

  .tag {
    opacity: 0;
  }
}

.casting-status {
  position: absolute;
  right: 4px;
  top: -2px;

  &.casting-status-not-ready {
    opacity: 0.5;
  }

  img {
    width: 12px;
  }
}

.subscribed {
  position: absolute;
  bottom: -4px;
  right: 4px;
  color: $grey;
}

.priority {
  border-radius: 5px;
  color: white;
  display: inline-block;
  font-weight: bold;
  height: 21px;
  margin-left: 5px;
  margin-right: 3px;
  min-width: 23px;
  text-align: center;

  &.high {
    background-color: $yellow;
  }

  &.veryhigh {
    background-color: $orange;
  }

  &.emergency {
    background-color: $red;
  }
}

.asset-date-block {
  height: 15px;
}

.dot {
  position: absolute;
  border: 4px solid;
  color: red;
  border-radius: 4px;
  max-height: 4px;
}

.custom-input {
  min-height: 21px;
  min-width: 157px;
}

:deep(.el-range-editor.el-input__wrapper) {
  box-shadow: none !important;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  width: 100%;
  max-height: 21px !important;
}

:deep(.el-date-editor .el-range-separator) {
  max-width: 2px !important;
  font-style: inherit !important;
  //padding: 0 5px !important;
}

:deep(.el-input__inner) {
  color: var(--text) !important;
  cursor: pointer !important;

  &:focus {
    cursor: text !important;
  }
}

:deep(.el-input__prefix) {
  width: 0 !important;
}

:deep(.el-input .el-input__icon) {
  max-width: 0 !important;
  max-height: 0 !important;
}

.date-input {
  font-style: inherit !important;
  border: 1px solid transparent;
  border-radius: 5px;

  &:hover {
    border: 1px solid #6bacea;
  }
}

:deep(.el-icon) {
  width: 2px !important;
  //max-height: 2xp !important;
  //margin-bottom: 5px;
}

:deep(.el-range-input) {
  //height: 30px !important;
  width: 100% !important;
  text-align: left !important;
}
</style>
