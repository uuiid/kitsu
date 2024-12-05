<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content wide">
      <div class="box content">
        <div class="flexrow">
          <combobox
            class="flexrow-item"
            :label="$t('timesheets.year')"
            :options="yearOptions"
            v-model="yearString"
          />

          <combobox
            class="flexrow-item"
            :label="$t('timesheets.month')"
            :options="monthOptions"
            v-model="monthString"
          />

          <button
            class="button"
            :text="$t('doodle.unselect_all_month')"
            @click="unselectAllMonthClick"
          >
            {{ $t('doodle.unselect_all_month') }}
          </button>

          <button
            class="button"
            :text="$t('doodle.select_all_month')"
            @click="allMonthClick"
          >
            {{ $t('doodle.select_all_month') }}
          </button>
        </div>
        <!-- <div class="datatable-wrapper" v-scroll="onBodyScroll"> -->
        <work-sheet-add-task-list
          class="datatable-wrapper"
          ref="todo-list"
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="notPendingTasks"
          :page="pageNumber"
          :selection-grid="todoSelectionGrid"
        />
        <!-- </div> -->
        <p class="has-text-right">
          <button
            class="button flexrow-item"
            @click="$emit('switch-page', 'back_page')"
            v-if="pageNumber > 1"
          >
            上一页
          </button>
          <button
            class="button flexrow-item"
            @click="$emit('switch-page', 'next_page')"
            v-if="isMore"
          >
            下一页
          </button>
          <button
            class="button is-primary flexrow-item"
            @click="addselectedTask"
          >
            {{ $t('doodle.add_select_task') }}
          </button>
          <button class="button is-link flexrow-item" @click="$emit('cancel')">
            {{ $t('main.cancel') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
>

<script>
import { mapActions, mapGetters } from 'vuex'
import moment from 'moment-timezone'

import { range } from '@/lib/time'
import { modalMixin } from '@/components/modals/base_modal'

import Combobox from '@/components/widgets/Combobox.vue'
import WorkSheetAddTaskList from '@/components/lists/WorkSheetAddTaskList.vue'

export default {
  name: 'add-task-sheet-modal',
  mixins: [modalMixin],
  components: {
    Combobox,
    WorkSheetAddTaskList
  },

  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    active: {
      default: false,
      type: Boolean
    },
    isMore: {
      type: Boolean,
      default: false
    },
    pageNumber: {
      type: Number,
      default: 1
    }
  },
  emits: ['add-sort-task', 'cancel', 'switch-page'],

  data() {
    return {
      yearString: `${moment().year()}`,
      monthString: `${moment().month() + 1}`,
      sortedTasks: []
    }
  },

  async mounted() {
    //--------------------
    //this.reload(null)
  },

  computed: {
    ...mapGetters([
      'isTodosLoading',
      'isTodosLoadingError',
      'todoSelectionGrid',
      'displayedTodos'
    ]),

    notPendingTasks() {
      console.log(this.tasks.length)
      return this.tasks
    },

    yearOptions() {
      const year = 2018
      const currentYear = moment().year()
      return range(year, currentYear).map(year => ({
        label: year,
        value: `${year}`
      }))
    },

    monthOptions() {
      const currentYear = `${moment().year()}`
      const month = 1
      const currentMonth = moment().month() + 1
      let monthRange = range(month, 12)
      if (currentYear === this.yearString) {
        monthRange = range(month, currentMonth)
      }
      return monthRange.map(month => ({
        label: month,
        value: `${month}`
      }))
    }
  },

  methods: {
    ...mapActions(['setTodosSearch', 'loadOpenTasks']),

    async reload(p) {
      this.person = p
      this.isLoading = true
      this.page = 1
      this.sortedTasks = []
      try {
        const params = { person_id: this.person ? this.person.id : null }
        const taskInfos = await this.loadOpenTasks(params)
        this.sortedTasks = taskInfos.data
        //this.isMore = taskInfos.is_more
      } catch (error) {
        this.isLoadingError = true
        console.error(error)
      }
      this.isLoading = false
    },

    unselectAllMonthClick() {
      const year = this.yearString
      const month = this.monthString.padStart(2, '0')
      const year_month = `${year}-${month}`
      this.$refs['todo-list'].displayedTasks.forEach(t => {
        if (
          t.created_at.startsWith(year_month) ||
          t.updated_at.startsWith(year_month)
        )
          t.checked = false
      })
      this.$refs['todo-list'].$forceUpdate()
    },

    allMonthClick() {
      const year = this.yearString
      const month = this.monthString.padStart(2, '0')
      const year_month = `${year}-${month}`
      this.$refs['todo-list'].tasks.forEach(t => {
        if (
          t.created_at.startsWith(year_month) ||
          t.updated_at.startsWith(year_month)
        )
          t.checked = true
      })
      this.$refs['todo-list'].$forceUpdate()
    },
    addselectedTask() {
      const data = []
      this.notPendingTasks.forEach(t => {
        if (t.checked) {
          data.push(t)
        }
      })
      this.$emit('add-sort-task', data)
    }
  },

  socket: {
    events: {
      'task:update'(eventData) {
        const task = this.tasks.find(t => t.id === eventData.task_id)
        if (task) {
          this.loadTask({ taskId: task.id }).then(updatedTask => {
            Object.assign(task, updatedTask)
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-field {
  margin: 25px 2em 5px 0;
}

.modal-content {
  max-height: calc(100vh - 75px);
  height: 100%;
  top: 28px;
  margin-bottom: 10px;
}

.modal-content .box {
  padding: 1em;
}

.datatable-wrapper {
  max-height: calc(70vh);
}

.modal-content.wide {
  height: 90%;
  margin: 1em;
  width: 80%;
  align-content: center;
}
</style>
