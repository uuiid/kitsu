<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="todos page">
        <div class="flexrow" v-if="!isShow">
          <h1 class="title">请先前往简介设置电话和公司</h1>
        </div>
        <div class="flexrow" v-else>
          <div class="flexrow-select-company" v-if="companyString != null">
            <div class="flexrow-item-selector" v-if="showAllUser()">
              <people-field
                class="person-field"
                :label="$t('main.person')"
                :people="personList"
                :model-value="peopleFieldUser"
                ref="person-field"
                v-model="person"
              />
            </div>

            <combobox
              class="flexrow-item"
              :label="$t('timesheets.year')"
              :options="yearOptions"
              v-model="yearString"
              v-show="person"
            />

            <combobox
              class="flexrow-item"
              :label="$t('timesheets.month')"
              :options="monthOptions"
              v-model="monthString"
              v-show="person"
            />

            <combobox
              class="flexrow-item"
              :label="$t('doodle.day')"
              :options="dayOptions"
              v-model="dayString"
              v-if="isActiveTab('duty')"
            />
          </div>

          <span class="filler"></span>

          <div
            class="flexrow-item selector"
            v-if="companyString != null && person != null"
          >
            <label class="label">
              {{ $t('doodle.action') }}
            </label>
            <div v-if="isActiveTab('workSheet')">
              <button-simple
                class="flexrow-item"
                icon="export"
                :text="$t('doodle.export')"
                :title="$t('main.csv.export_file')"
                @click="exportButtonClick"
              >
                {{ $t('doodle.export') }}
              </button-simple>
              <button
                class="button"
                :class="{
                  'is-loading': isLoading
                }"
                :text="$t('doodle.add_task')"
                @click="onAverageTime"
              >
                {{ $t('doodle.average_time') }}
              </button>
              <button
                class="button"
                :class="{
                  'is-loading': isLoading
                }"
                :text="$t('doodle.add_task')"
                @click="onNewClicked"
              >
                {{ $t('doodle.add_task') }}
              </button>
              <button
                class="button"
                :text="$t('doodle.add_task')"
                @click="modals.add = true"
              >
                {{ $t('doodle.add_custom_entry') }}
              </button>
            </div>
            <button
              v-if="isActiveTab('duty')"
              class="button"
              :text="$t('doodle.get_duty')"
              @click="getDutyClick"
            >
              {{ $t('doodle.get_duty') }}
            </button>
            <button
              v-if="isActiveTab('duty')"
              class="button"
              :text="$t('doodle.add_custom_duty')"
              @click="addCustomDutyClick"
            >
              {{ $t('doodle.add_custom_duty') }}
            </button>
          </div>
        </div>

        <route-section-tabs
          class="section-tabs"
          :active-tab="currentSection"
          :route="$route"
          :tabs="workTabs"
        />

        <work-sheet-list
          ref="todo-list"
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="sortCalculatedTasks"
          :year-string="yearString"
          :month-string="monthString"
          :user-id="getUserId"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          @set-sort-task="onWorkSheetEvent"
          @remove-sort-task="removeSortTask"
          @set-user-remark="setUserRemark"
          @soft-task="onSoftTask"
          @copy-task="onAddCustomEntry"
          v-if="isActiveTab('workSheet')"
        />

        <div v-if="isActiveTab('duty')">&nbsp;</div>
        <work-duty-list
          ref="work-list"
          class="work-list"
          :tasks="notPendingDutys"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :selection-grid="doneSelectionGrid"
          :done="true"
          :person="person"
          v-if="isActiveTab('duty')"
          @delete-entry="onDeleteDuty"
        />
      </div>
    </div>
    <div class="column side-column" v-if="isCurrentUserManager">
      <div class="department-import flexcolumn mt2">
        <combobox-department
          class="flexrow-item export-btn"
          :label="$t('doodle.filter-person')"
          :department-list="departments"
          :with-empty-choice="false"
          :display-all-and-my-departments="true"
          v-model="selectedDepartment"
        />
        <p class="label mt2">
          {{ $t('doodle.batch-export-list') }}
        </p>
        <div class="batch-export-action">
          <combobox
            class="flexrow-item"
            :label="$t('timesheets.year')"
            :options="yearOptions"
            v-model="batchYearString"
            v-show="person"
          />
          <combobox
            class="flexrow-item"
            :label="$t('timesheets.month')"
            :options="batchMonthOptions"
            v-model="batchMonthString"
            v-show="person"
          />
          <button-simple
            class="flexrow-item mt05 export-btn"
            :class="{
              'is-loading': isExporting
            }"
            :text="$t('doodle.batch-export')"
            @click="batchExport"
          />
          <button-simple
            class="flexrow-item mt05 export-btn"
            :class="{
              'is-loading': isExporting
            }"
            :text="
              isSelectAll
                ? $t('doodle.not_select_all')
                : $t('doodle.select_all')
            "
            @click="selectAll"
          />
        </div>
      </div>
      <div class="export-list">
        <div
          :key="`unlisted-person-${person.id}`"
          class="flexrow person-to-add mb05"
          @click="selectPerson(person)"
          v-for="person in filterPersonList"
        >
          <input
            type="checkbox"
            class="mr1"
            :checked="person.checked ? person.checked : false"
            @input="event => onCheckChanged(person, event)"
          />
          <people-avatar
            class="flexrow-item"
            :font-size="14"
            :key="person.id"
            :person="person"
            :size="30"
            :with-link="false"
          />
          <people-name
            class="flexrow-item"
            :style="{
              color: person.name_color || isDarkTheme ? '#f1f1f1' : '#404040'
            }"
            :person="person"
            :with-link="false"
          />
        </div>
      </div>
    </div>
    <add-task-sheet-modal
      :active="modals.edit"
      ref="add-task-sheet-modal"
      :text="$t('doodle.add_task')"
      :title="$t('doodle.add_task')"
      :tasks="notPendingTasks"
      :is-more="isMore"
      :page-number="pageNumber"
      @cancel="modals.edit = false"
      @add-sort-task="addSortTask"
      @switch-page="pageLoadOpenTasks"
      @on-time-changed="timeLoadOpenTasks"
    />
    <add-sheet-custom-entry
      :active="modals.add"
      @cancel="modals.add = false"
      @on-confirm="onAddCustomEntry"
    />
    <add-custom-duty-modal
      :active="modals.addDuty"
      @cancel="modals.addDuty = false"
      @on-confirm="onAddCustomDuty"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import moment from 'moment-timezone'
import { sortPeople } from '@/lib/sorting'
import stringHelpers from '@/lib/string'

import csv from '@/lib/csv'
import { range } from '@/lib/time'
import { formatFullDate } from '@/lib/time'

import AddTaskSheetModal from '@/components/modals/AddTaskSheetModal.vue'

import Combobox from '@/components/widgets/Combobox.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import WorkSheetList from '@/components/lists/WorkSheetList.vue'
import WorkDutyList from '@/components/lists/WorkDutyList.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import PeopleName from '@/components/widgets/PeopleName'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment'
import { PAGE_SIZE } from '@/lib/pagination.js'
import AddSheetCustomEntry from '@/components/modals/AddSheetCustomEntry.vue'
import AddCustomDutyModal from '@/components/modals/AddCustomDutyModal.vue'

export default {
  name: 'work-sheet',

  components: {
    AddCustomDutyModal,
    AddSheetCustomEntry,
    Combobox,
    RouteSectionTabs,
    WorkSheetList,
    WorkDutyList,
    AddTaskSheetModal,
    PeopleAvatar,
    PeopleField,
    PeopleName,
    ButtonSimple,
    ComboboxDepartment
  },

  data() {
    return {
      currentSection: 'workSheet',
      year_month: moment().format('YYYY-MM'),
      daysOff: [],
      dayOffError: false,
      productionId: undefined,
      selectedDate: moment().format('YYYY-MM-DD'),
      companyString: null,
      yearString: `${moment().year()}`,
      batchYearString: `${moment().year()}`,
      monthString: `${moment().month() + 1}`,
      batchMonthString: `${moment().month() + 1}`,
      dayString: `${moment().date()}`,
      modals: {
        del: false,
        edit: false,
        add: false,
        addDuty: false
      },
      person: null,
      tasks: [],
      personTasks: [],
      companyOptionList: [],
      dutys: [],
      selectPersons: [],
      isSelectAll: false,
      selectedDepartment: null,
      filterPersonList: [],
      isShow: false,
      calculatedTasks: new Map(),
      prepareCalculateTasks: [],
      isLoading: false,
      isMore: false,
      pageNumber: 1,
      cacheTasks: [],
      isExporting: false,
      headers: [
        '部门',
        '制作人',
        '项目',
        '集数',
        '开始时间',
        '结束时间',
        '持续时间/day',
        '时间备注',
        '名称(备注)',
        '等级'
      ]
    }
  },

  mounted() {
    this.updateActiveTab()
    if (this.user && this.user.dingding_company_id && this.user.phone) {
      this.isShow = true
    }
    //--------------------
    const res = []
    //res = [...res, ...this.dingDingCompany]
    this.dingDingCompany.forEach(element => {
      const temp = {
        id: element.id,
        value: element.id,
        name: element.name,
        label: element.name
      }
      if (element.id === this.user.dingding_company_id) {
        res.unshift(temp)
        this.companyString = element.name
      } else {
        res.push(temp)
      }
    })
    //res.splice(0, 0, { id: null, name: '' })
    this.companyOptionList = res
    if (this.isShow) {
      this.person = this.user
      if (this.$refs['person-field'])
        this.$refs['person-field'].item = this.user
    }
    this.$nextTick(() => {
      if (this.isShow) {
        this.person = this.user
        if (this.$refs['person-field'])
          this.$refs['person-field'].item = this.user
      }
    })
    if (!this.showAllUser()) {
      this.person = this.user
    }
    // this.reload().then(() => {
    //   if (this.isShow) {
    //     this.person = this.user
    //     this.$refs['person-field'].item = this.user
    //   }
    //   if (!this.showAllUser()) {
    //     this.person = this.user
    //   }
    // })
    //--------------------
    this.filterPersonList = this.personList
  },

  afterDestroy() {},

  computed: {
    ...mapGetters([
      'taskMap',
      'displayedTodos',
      'doneSelectionGrid',
      'isTodosLoading',
      'isTodosLoadingError',
      'openProductions',
      'taskStatuses',
      'taskTypeMap',
      'timeSpentMap',
      'timeSpentTotal',
      'todoListScrollPosition',
      'todoSelectionGrid',
      'user',
      'productionMap',
      'personMap',
      'displayedPeople',
      'activePeopleWithoutBot',
      'activePeople',
      'departmentMap',
      'departments',
      'dingDingCompany',
      'isCurrentUserManager',
      'people',
      'isDarkTheme'
    ]),
    notPendingTasks() {
      return this.tasks.filter(task => {
        return ![...this.calculatedTasks.keys()].includes(task.id)
      })
    },
    sortCalculatedTasks() {
      return [...this.calculatedTasks.values()]
    },
    notPendingDutys() {
      return this.dutys.filter(task => task != null)
    },

    getUserId() {
      return this.person ? this.person.id : null
    },
    workTabs() {
      return [
        {
          label: this.$t('doodle.task_sheet'),
          name: 'workSheet'
        },
        {
          label: this.$t('doodle.duty'),
          name: 'duty'
        }
      ].filter(Boolean)
    },

    todoList() {
      return this.$refs['todo-list']
    },

    haveDoneList() {
      return this.$refs['work-list']
    },
    peopleFieldUser() {
      return this.user
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
    },
    batchMonthOptions() {
      const currentYear = `${moment().year()}`
      const month = 1
      const currentMonth = moment().month() + 1
      let monthRange = range(month, 12)
      if (currentYear === this.batchYearString) {
        monthRange = range(month, currentMonth)
      }
      return monthRange.map(month => ({
        label: month,
        value: `${month}`
      }))
    },
    dayOptions() {
      const currentYear = `${moment().year()}`
      const currentMonth = moment().month() + 1
      let dayRange = range(1, 31)
      if (
        currentYear === this.yearString &&
        currentMonth === this.monthString
      ) {
        dayRange = range(1, moment().date())
      } else {
        const currentDate = moment(
          `${this.yearString}-${Number(this.monthString)}`,
          'YYYY-M',
          'en'
        )
        dayRange = range(1, currentDate.endOf('month').date())
      }
      return dayRange.map(day => ({
        label: day,
        value: `${day}`
      }))
    },

    personList() {
      const productionId = this.productionId
      const production = this.productionMap.get(productionId)
      if (production) {
        return sortPeople(
          production.team
            .map(personId => this.personMap.get(personId))
            .filter(
              person =>
                !person.is_bot && person.dingding_company_id && person.phone
            )
        )
      } else {
        return this.activePeopleWithoutBot.filter(
          person => person.dingding_company_id && person.phone
        )
      }
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'loadAggregatedPersonDaysOff',
      'loadOpenProductions',
      'loadTodos',
      'setDayOff',
      'setTodoListScrollPosition',
      'loadOpenTasks',
      'loadTask',
      'countOneTaskTime',
      'countCustomTaskTime',
      'sortTaskTime',
      'createCustomDuty',
      'averageTime'
    ]),

    isActiveTab(tab) {
      return this.currentSection === tab
    },
    selectAll() {
      if (this.isSelectAll) {
        this.filterPersonList.forEach(person => {
          person.checked = false
        })
        this.selectPersons = []
      } else {
        this.filterPersonList.forEach(person => {
          person.checked = true
          this.selectPersons.push(person)
        })
      }
      this.isSelectAll = !this.isSelectAll
    },
    updateActiveTab() {
      const availableSections = ['duty']
      const currentSection = this.$route.query.section
      this.currentSection = availableSections.includes(currentSection)
        ? currentSection
        : 'workSheet'
      this.clearSelectedTasks()
    },
    onAddCustomEntry(task) {
      if (!task.user_id) task.user_id = this.getUserId
      this.onCountCustomTaskTime(task)
    },
    onAddCustomDuty(task) {
      this.createCustomDuty({ user_id: this.getUserId, task: task }).then(res =>
        this.dutys.push(res)
      )
    },
    onSoftTask(task_ids) {
      const year = this.yearString
      const month = this.monthString
      const user_id = this.person.id
      const l_params = {
        user_id,
        year,
        month,
        task_ids
      }
      this.sortTaskTime(l_params).then(res => {
        if (res) {
          this.resetTask(res)
        }
      })
    },
    onDeleteDuty(task) {
      this.dutys = this.dutys.filter(duty => duty.id !== task.id)
    },
    onNewClicked() {
      this.isLoading = true
      if (!this.person) {
        alert(this.$t('doodle.person_tip'))
        return
      }
      if (!this.companyString) {
        alert(this.$t('doodle.company_tip'))
        return
      }
      this.clearSelectedTasks()
      this.tasks = []
      const start_date = `${this.$refs['add-task-sheet-modal'].yearString}-${this.$refs['add-task-sheet-modal'].monthString}-01`
      const end_date = `${this.$refs['add-task-sheet-modal'].endYearString}-${this.$refs['add-task-sheet-modal'].endMonthString}-01`
      this.reload(start_date, end_date).then(() => {
        this.isLoading = false
        this.modals.edit = true
      })
    },

    exportButtonClick() {
      if (!this.person) {
        alert(this.$t('doodle.person_tip'))
        return
      }
      if (!this.companyString) {
        alert(this.$t('doodle.company_tip'))
        return
      }
      const nameData = [
        moment().utcOffset(8).format('HH-mm-ss'),
        this.person.name,
        this.yearString,
        this.monthString
      ]
      const name = stringHelpers.slugify(nameData.join('_'))
      const entries = [this.headers]
      Array.from(this.calculatedTasks.values()).forEach(t => {
        const line = this.exportLine(this.person, t)
        entries.push(line)
      })
      csv.buildCsvFile(name, entries, this.person.first_name)
    },

    exportLine(person, t) {
      const line = []
      //const theTaskType = this.taskTypeMap.get(t.task_type_id)
      let department
      if (t.task_type)
        department = this.departmentMap.get(t.task_type.department_id).name
      else if (person.departments.length > 0) {
        department = this.departmentMap.get(person.departments[0]).name
      }
      line.push(department)
      line.push(person.first_name)
      let episodes = ''
      if (t.entity_ji_shu_lie || t.entity_ji_shu_lie === 0)
        episodes = t.entity_ji_shu_lie
      else {
        if (t.task_type?.for_entity?.includes('Shot')) {
          episodes = t.entity.sequence_name.replaceAll('EP', '') ?? ''
        } else {
          episodes = t.entity_ji_shu_lie
        }
      }
      const season = t.entity_ji_du
      // if (season === undefined) {
      //   season = t.entity.data.ji_du
      //     ? t.entity.data.ji_du
      //     : Math.ceil(Number(episodes) / 20)
      // }
      let project_name = t.project_name
      if (project_name === undefined || project_name === '') {
        if (t.project_uuid) {
          project_name = this.productionMap.get(t.project_uuid).name
        } else {
          project_name = this.productionMap.get(t.project.id).name
        }
      }
      if (episodes < 10) {
        episodes = `0${episodes}`
      }
      line.push(`《${project_name}》第${season}季`)
      line.push(`EP${episodes}`)
      line.push(formatFullDate(t.work_start_time))
      line.push(formatFullDate(t.work_end_time))
      const duration = Number(t.work_duration / (1000 * 1000 * 60 * 60 * 8))
      line.push(duration)
      line.push(t.work_remark)
      if (t.work_user_remark) line.push(`${t.task_name}(${t.work_user_remark})`)
      else line.push(t.task_name)
      const level = t.entity_deng_ji
      line.push(level)
      return line
    },

    async reload(
      start_date = `${moment().year()}-${moment().month()}-01`,
      end_date = `${moment().year()}-${moment().month() + 1}-01`,
      page = 1
    ) {
      try {
        //const [year, month] = start_date.split('-').map(Number)
        //const date = new Date(year, month, 1)
        //date.setMonth(date.getMonth())
        //const due_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
        const params = {
          person_id: this.person ? this.person.id : null,
          page: page,
          start_date: start_date,
          end_date: end_date
        }
        const taskInfos = await this.loadOpenTasks(params)
        this.isMore = taskInfos.is_more
        if (page === 1) this.tasks = taskInfos
        else {
          this.tasks.push(...taskInfos)
        }
      } catch (error) {
        this.isLoadingError = true
        console.error(error)
      }
    },

    async timeLoadOpenTasks(year, month, end_year, end_month) {
      this.pageNumber = 1
      const end_date = new Date(year, end_month + 1, 0).getDate()
      await this.reload(
        `${year}-${month}-01`,
        `${end_year}-${end_month}-${end_date}`,
        this.pageNumber
      )
    },

    async pageLoadOpenTasks(params, yearString, monthString) {
      if (params === 'back_page') {
        this.pageNumber--
        this.isMore = true
      } else {
        if (this.tasks.length < (this.pageNumber + 1) * PAGE_SIZE)
          await this.reload(
            `${yearString}-${monthString.padStart(2, '0')}-01`,
            this.pageNumber + 1
          )
        this.pageNumber++
      }
    },
    async loadPersonTask(person_id) {
      this.personTasks = []
      try {
        const params = {
          project_id: this.productionId,
          person_id: person_id
        }
        const taskInfos = await this.loadOpenTasks(params)
        this.personTasks = taskInfos.data
      } catch (error) {
        this.isLoadingError = true
        console.error(error)
      }
    },

    getUserInfo(user_id) {
      this.getTaskTime(user_id)
      this.getDutyList(user_id)
      // this.reload().then(() => {
      //   this.getTaskTime(user_id)
      //   this.getDutyList(user_id)
      // })
    },

    createUserInfo(user_id, company) {
      const action = 'createUserInfo'
      const l_params = {
        user_id,
        company
      }
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('createUserInfo Done')
          if (res) {
            this.getTaskTime(res.id)
            this.getDutyList(res.id)
          }
        })
        .catch(err => {
          console.log('createUserInfo Error')
          console.error(err)
          if (err.response) {
            if (err.response.statusCode === 500) {
              alert(this.$t('doodle.phone_tip'))
            }
          }
        })
    },

    getTaskTime(user_id) {
      const year = this.yearString
      const month = this.monthString
      const l_params = {
        user_id,
        year,
        month
      }
      const action = 'getTaskTime'
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          if (res) {
            this.setSortTask(res)
          } else {
            this.setSortTask([])
          }
        })
        .catch(err => {
          console.log('getTaskTime Error')
          console.error(err)
          if (err.response) {
            if (err.response.statusCode === 404) {
              this.countTaskTime(user_id)
            }
          } else {
            alert(err.message)
          }
        })
    },

    async countTaskTime(user_id) {
      const data_list = []
      this.prepareCalculateTasks = [...this.prepareCalculateTasks]
      this.prepareCalculateTasks.forEach(task => {
        console.log(task)
        const data = {}
        if (task.assignees) {
          data.work_start_time = task.start_date || task.created_at
          data.work_end_time = task.due_date || task.updated_at
          data.task_id = task.id

          data_list.push(data)
        }
      })
      const year = this.yearString
      const month = this.monthString
      const l_params = {
        user_id,
        year,
        month
      }
      const action = 'countTaskTime'
      if (this.calculatedTasks.size > 0) {
        let num = 0
        for (const task of data_list) {
          l_params.task = task
          num++
          const res = await this.countOneTaskTime(l_params)
          if (num === data_list.length) {
            this.setSortTask(res)
          }
        }
      } else {
        l_params.data_list = data_list
        this.$store
          .dispatch(action, l_params)
          .then(res => {
            console.log('countTaskTime Done')
            if (res) {
              this.setSortTask(res)
            }
          })
          .catch(err => {
            console.log('countTaskTime Error')
            console.error(err)
            if (err.response) {
              alert(err.response.text)
            } else {
              alert(err.message)
            }
          })
      }
    },
    onAverageTime() {
      const year = this.yearString
      const month = this.monthString
      const user_id = this.getUserId
      const l_params = {
        user_id,
        year,
        month
      }
      this.averageTime(l_params)
        .then(res => {
          if (res) {
            this.resetTask(res)
          } else {
            this.resetTask([])
          }
        })
        .catch(err => {
          console.log('averageTime Error')
          console.error(err)
        })
    },
    async onCountCustomTaskTime(custom_task) {
      const year = this.yearString
      const month = this.monthString
      const user_id = this.person.id
      const l_params = {
        user_id,
        year,
        month,
        custom_task
      }
      const res = await this.countCustomTaskTime(l_params)
      if (res) {
        this.setSortTask(res)
      }
    },
    getTimeClick() {
      if (this.person?.phone) {
        this.getUserInfo(this.person.id)
      } else {
        alert(this.$t('doodle.phone_tip'))
      }
    },

    getDutyList(user_id) {
      const year = this.yearString
      const month = this.monthString
      const l_params = {
        user_id,
        year,
        month
      }
      const action = 'getDutyList'
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          this.dutys = res
          this.getTaskTime(user_id)
        })
        .catch(err => {
          console.log('getDutyList Error')
          console.error(err)
          if (err.response) {
            alert(err.response.text)
          } else {
            alert(err.message)
          }
        })
    },

    getDutyDingDing(user_id) {
      const year = this.yearString
      const month = this.monthString
      const day = this.dayString
      const l_params = {
        user_id,
        year,
        month,
        day
      }
      const action = 'getDutyDingDing'
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          if (res) {
            res.forEach(n => {
              let contain = false
              for (const t of this.dutys) {
                if (t.id === n.id) {
                  contain = true
                }
              }
              if (!contain) this.dutys.push(n)
            })
          }
        })

        .catch(err => {
          console.log('getDutyDingDing Error')
          console.error(err)
          if (err.response) {
            alert(err.response.text)
          } else {
            alert(err.message)
          }
        })
    },

    getDutyClick() {
      if (!this.person) {
        alert(this.$t('doodle.person_tip'))
        return
      }
      if (!this.companyString) {
        alert(this.$t('doodle.company_tip'))
        return
      }
      this.getDutyDingDing(this.person.id)
    },
    addCustomDutyClick() {
      this.modals.addDuty = true
    },
    onWorkSheetEvent(data) {
      if (data[0] === 'error') {
        this.getTaskTime(this.person.id)
      } else {
        this.resetTask(data)
      }
    },
    resetTask(data) {
      data.forEach(item => {
        if (this.calculatedTasks.has(item.kitsu_task_ref_id || item.id)) {
          this.calculatedTasks.set(item.kitsu_task_ref_id || item.id, item)
        }
      })
    },
    setSortTask(data) {
      this.calculatedTasks = new Map()
      data.forEach(item => {
        if (item.kitsu_task_ref_id) {
          item.name = item.entity.name
          this.calculatedTasks.set(item.kitsu_task_ref_id, item)
        } else {
          item.project = this.productionMap.get(item.project_id)
          this.calculatedTasks.set(item.id, item)
        }
      })
      this.person.tasks = [...this.calculatedTasks.values()]
    },
    setPersonTask(data) {
      const l_tasks = []
      data.forEach(item => {
        for (const t of this.personTasks) {
          if (item.kitsu_task_ref_id === t.id) {
            const tt = t
            tt.duration = item.duration
            tt.doodle_task_id = item.id
            tt.remark = item.remark
            tt.start_time = item.start_time
            tt.end_time = item.end_time
            tt.user_remark = item.user_remark
            l_tasks.push(tt)
          }
        }
      })
      return l_tasks
    },
    addSortTask(data) {
      this.prepareCalculateTasks = data
      this.countTaskTime(this.person.id)
      this.modals.edit = false
    },
    removeSortTask(ent) {
      const temp = new Map(
        ent.map(value => [value.kitsu_task_ref_id || value.id, value])
      )
      if (ent) {
        temp.set(temp)
      }
      Array.from(this.calculatedTasks.keys()).forEach(item => {
        if (temp.has(item)) {
          this.calculatedTasks.set(item, temp.get(item))
        } else {
          this.calculatedTasks.delete(item)
        }
      })
    },

    setUserRemark(entity, user_remark) {
      if (this.calculatedTasks.has(entity.kitsu_task_ref_id)) {
        this.calculatedTasks.get(entity.kitsu_task_ref_id).user_remark =
          user_remark
      }
    },

    showAllUser() {
      return ['admin', 'manager', 'supervisor'].includes(this.user.role)
    },
    async batchExport() {
      this.isExporting = true
      try {
        if (this.selectPersons.length <= 0) {
          this.isExporting = false
          return
        }

        const nameData = [
          moment().utcOffset(8).format('HH-mm-ss'),
          this.batchYearString,
          this.batchMonthString
        ]
        const name = stringHelpers.slugify(nameData.join('_'))
        const sheets = []

        const year = this.batchYearString
        const month = this.batchMonthString
        const day = this.dayString
        const l_params = {
          year,
          month,
          day
        }
        const allPerson = []
        for (const p of this.selectPersons) {
          if (!allPerson.includes(p)) allPerson.push(p)
        }

        for (const p of allPerson) {
          const sheet = {}
          const entries = []
          l_params.user_id = p.id
          const tasks = await this.$store.dispatch('getTaskTime', l_params)
          if (tasks && tasks.length > 0) {
            tasks.forEach(t => {
              const line = this.exportLine(p, t)
              entries.push(line)
            })
          }
          sheet.name = p.first_name
          sheet.entries = entries
          sheets.push(sheet)
        }
        csv.buildCsvFileAll(name, this.headers, sheets)
      } catch (err) {
        console.error(err)
      }
      this.isExporting = false
    },
    selectPerson(person) {},
    onCheckChanged(person, event) {
      person.checked = event.target.checked
      if (person.checked) {
        if (!this.selectPersons.includes(person))
          this.selectPersons.push(person)
      } else {
        this.selectPersons = this.selectPersons.filter(p => p.id !== person.id)
      }
      this.$forceUpdate()
    },
    updateDepartment() {
      const department = this.selectedDepartment
      if (department === 'ALL') {
        this.filterPersonList = this.personList
      } else {
        this.filterPersonList = []
        this.personList.forEach(p => {
          p.checked = false
          if (p.departments.includes(department)) this.filterPersonList.push(p)
        })
      }
      this.selectPersons = []
      this.isSelectAll = false
      //this.$forceUpdate()
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
  },
  watch: {
    productionId() {
      this.$router.push({
        query: {
          productionId: this.productionId,
          section: this.currentSection
        }
      })
    },
    '$route.query.section'() {
      this.updateActiveTab()
    },
    $route() {
      this.currentSection = this.$route.query.section || 'workSheet'
    },
    selectedDepartment() {
      this.updateDepartment()
    },
    companyString() {
      this.person = null
      this.calculatedTasks = new Map()
    },
    person(val) {
      if (val) this.getTimeClick()
    },
    yearString() {
      this.getTimeClick()
    },
    monthString() {
      this.getTimeClick()
    }
  },
  head() {
    return {
      title: `${this.$t('doodle.my_worksheet')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
// .columns {
//   display: flex;
//   flex-direction: row;
//   padding: 0;
// }

.flexrow-select-company {
  display: flex;
}

.flexrow-item-selector {
  margin-right: 1rem;
}

.datepicker {
  //background: #f2f2f2;
  //border: 1px solid #ddd;
  //padding: 0em 1em 1em;
  //margin-bottom: 2em;
}

.batch-export-action {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-left: 0.5rem;
}

.column {
  padding: 0;
  overflow-y: auto;
}

.todos {
  display: flex;
  flex-direction: column;
}

.section-tabs {
  min-height: 18px;
}

.work-list {
  margin-top: 2em;
}

.field {
  margin-bottom: 0;
}

.person-label {
  margin-top: -23px;
}

.button {
  margin-left: 0.8em;
}

.side-column {
  border-left: 1px solid $light-grey;
}

// .label {
//   color: var(--text-alt);
//   font-size: 0.8em;
//   letter-spacing: 1px;
//   text-transform: uppercase;
//   margin-bottom: 0;
//   margin-left: 10px;
// }

.export-list {
  border: 1px solid var(--border);
  border-radius: 5px;
  margin-top: 0.5em;
  padding: 0.5em;
  flex: 1;
  overflow-y: auto;
  margin-left: 0.5em;
  margin-right: 0.5em;
}

.export-btn {
  margin: 0.5em;
}
</style>
