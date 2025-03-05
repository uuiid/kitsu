<template>
  <div class="data-list task-list">
    <div class="datatable-wrapper" ref="body">
      <table class="datatable" ref="myTable">
        <thead class="datatable-head">
          <tr>
            <th
              scope="col"
              class="production datatable-row-header datatable-row-header--nobd"
              ref="th-prod"
            >
              {{ $t('library.fields.production') }}
            </th>
            <th
              scope="col"
              class="type datatable-row-header datatable-row-header--nobd"
              ref="th-type"
              :style="{ left: colTypePosX }"
            >
              {{ $t('tasks.fields.task_type') }}
            </th>
            <th
              scope="col"
              class="name datatable-row-header"
              ref="th-name"
              :style="{ left: colNamePosX }"
            >
              {{ $t('tasks.fields.entity') }}
            </th>
            <th scope="col" class="episode">
              {{ $t('assets.fields.episode') }}
            </th>

            <th class="assignees" ref="th-assignees" v-if="isToCheck">
              {{ $t('tasks.fields.assignees') }}
            </th>
            <th
              class="description"
              scope="col"
              v-if="isDescriptionPresent && !isToCheck"
            >
              {{ $t('assets.fields.description') }}
            </th>
            <th scope="col" class="estimation">
              {{ $t('tasks.fields.duration').substring(0, 3) }} ({{
                allDuration
              }})
            </th>
            <th scope="col" class="start-date" v-if="!isToCheck">
              {{ $t('doodle.start_date') }}
            </th>
            <th scope="col" class="due-date">
              {{ $t('doodle.end_date') }}
            </th>
            <th scope="col" class="time-remark">
              {{ $t('doodle.remark') }}
            </th>
            <th scope="col" class="user-remark">
              {{ $t('doodle.user_remark') }}
            </th>
            <metadata-header
              :key="'desc-header' + field_name"
              :descriptor="
                mergeMetadataDescriptors(metadataDescriptorsMap[field_name])
              "
              :no-menu="true"
              v-for="field_name in Object.keys(metadataDescriptorsMap)"
            />
            <template v-if="!isToCheck">
              <th scope="col" class="last-comment" v-if="!done">
                {{ $t('doodle.action') }}
              </th>
              <th scope="col" class="end-date" v-else>
                {{ $t('tasks.fields.end_date') }}
              </th>
            </template>
            <th class="actions" v-else></th>
          </tr>
        </thead>
        <tbody
          class="datatable-body"
          v-if="tasks.length > 0"
          @dragover="onDragOver"
        >
          <tr
            v-for="(task, index) in displayedTasks"
            :key="task.computing_time.id"
            :class="{
              'datatable-row': true,
              'datatable-row--selectable': true,
              selected: task.checked || false
            }"
            @click="onLineClicked(task, $event)"
            :draggable="true"
            @dragenter="onDragEnter(task, index)"
            @dragstart="onDragStart(task, index)"
            @dragend="onDragEnd"
          >
            <td class="datatable-row-header datatable-row-header--nobd">
              <div class="flexrow">
                <input
                  type="checkbox"
                  class="mr1"
                  v-model="task.checked"
                  @click.stop
                />
                <production-name-cell
                  class="entity-name"
                  :is-tooltip="true"
                  :entry="task.project"
                />
              </div>
              <div
                :class="{
                  'line-top': task.drogPosition === 'top',
                  'line-bottom': task.drogPosition === 'bottom'
                }"
              ></div>
            </td>

            <task-type-cell
              class="type datatable-row-header datatable-row-header--nobd"
              :production-id="task.project?.id"
              :task-type="task.task_type"
              :style="{ left: colTypePosX }"
              v-if="task.task_type"
            />

            <td
              class="type datatable-row-header datatable-row-header--nobd"
              :style="{ left: colTypePosX }"
              v-else
            >
              自定义
              <div
                :class="{
                  'line-top': task.drogPosition === 'top',
                  'line-bottom': task.drogPosition === 'bottom'
                }"
              ></div>
            </td>
            <td
              class="name datatable-row-header"
              :style="{ left: colNamePosX }"
            >
              <div class="flexrow">
                <entity-thumbnail
                  :empty-width="60"
                  :empty-height="40"
                  :entity="{ preview_file_id: task.entity?.preview_file_id }"
                />
                <span>{{ task.computing_time.name || task.entity.name }}</span>
                <!--router-link class="entity-name" :to="entityPath(task.entity)">
{{ task.entity.entity_name }}
</router-link-->
              </div>
              <div
                :class="{
                  'line-top': task.drogPosition === 'top',
                  'line-bottom': task.drogPosition === 'bottom'
                }"
              ></div>
            </td>

            <td class="episode">
              <div class="flexrow" :title="''">
                {{ task.computing_time.episode || getEpisodes(task) }}
              </div>
            </td>

            <description-cell
              class="description"
              :title="task.entity?.entity_description"
              :entry="{ description: task.entity?.entity_description }"
              v-if="isDescriptionPresent && !isToCheck"
            />
            <td class="assignees" v-if="isToCheck">
              <div class="avatars">
                <people-avatar
                  :key="`${entry.id}-${person.id}`"
                  :person="person"
                  :size="30"
                  :font-size="16"
                  v-for="person in getSortedPeople(task.assignees)"
                />
              </div>
            </td>
            <td class="estimation" :title="$t('doodle.duration_cue_word')">
              <input
                class="input-editor"
                @keyup.enter="event => durationDate(event, task.computing_time)"
                min="0"
                :value="getDurationValue(task.computing_time.duration)"
                @focusout="event => durationDate(event, task.computing_time)"
                @click="onLineClicked(task, 'duration')"
              />
            </td>
            <td class="start-date" v-if="!isToCheck">
              {{ formatDate(task.computing_time.start_time) }}
            </td>
            <td class="due-date">
              {{ formatDate(task.computing_time.end_time) }}
            </td>
            <td class="time-remark">
              {{ task.computing_time.remark }}
            </td>
            <td class="user-remark">
              <input
                class="input-editor"
                @keyup.enter="
                  event => setUserRemark(event, task.computing_time)
                "
                min="0"
                :value="task.computing_time.user_remark"
                @focusout="event => setUserRemark(event, task.computing_time)"
              />
            </td>
            <td
              :key="field_name + `${index}`"
              class="normal"
              v-for="(field_name, index) in Object.keys(metadataDescriptorsMap)"
            >
              {{
                dataFieldMapping[field_name]
                  ? task.computing_time[dataFieldMapping[field_name]]
                  : task.entity?.data[field_name]
              }}
            </td>

            <td class="actions has-text-centered">
              <button
                class="button"
                data-test="button-delete"
                tabindex="-1"
                @click="onRemove(task)"
              >
                <trash-icon class="icon is-small only-icon" />
              </button>
            </td>
          </tr>
          <tr class="line-row">
            <td colspan="10"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <div
      class="has-text-centered empty-list"
      v-if="tasks.length === 0 && !isLoading"
    >
      <p>
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { TrashIcon } from 'lucide-vue-next'
import { selectionListMixin } from '@/components/mixins/selection'
import { formatListMixin } from '@/components/mixins/format'
import { descriptorMixin } from '@/components/mixins/descriptors'
import { sortPeople } from '@/lib/sorting'
import { formatSimpleDate } from '@/lib/time'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import DescriptionCell from '@/components/cells/DescriptionCell'
import ProductionNameCell from '@/components/cells/ProductionNameCell'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TaskTypeCell from '@/components/cells/TaskTypeCell'
import TableInfo from '@/components/widgets/TableInfo'
import MetadataHeader from '@/components/cells/MetadataHeader'
import { ElMessage } from 'element-plus'

export default {
  name: 'work-sheet-list',
  mixins: [formatListMixin, selectionListMixin, descriptorMixin],

  components: {
    EntityThumbnail,
    DescriptionCell,
    PeopleAvatar,
    ProductionNameCell,
    TableInfo,
    TaskTypeCell,
    MetadataHeader,
    TrashIcon
  },

  props: {
    checkboxShow: {
      default: false,
      type: Boolean
    },
    done: {
      type: Boolean,
      default: false
    },
    tasks: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    selectionGrid: {
      type: Object,
      default: () => {}
    },
    isToCheck: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: ''
    },
    yearString: {
      type: String,
      default: ''
    },
    monthString: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      default: ''
    }
  },
  emits: ['set-sort-task', 'remove-sort-task', 'scroll', 'set-user-remark'],

  data() {
    return {
      page: 1,
      colTypePosX: '',
      colNamePosX: '',
      isShiftSelected: false,
      isCtrlSelected: false,
      startSelection: null,
      dataFieldMapping: {
        ji_shu: 'season',
        ji_shu_lie: 'episode',
        deng_ji: 'grade'
      },
      currentTask: null,
      dragStartIndex: 0,
      dragIndex: 0
    }
  },

  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('keyup', this.handleKeyup)
    this.page = 1
    this.resizeHeaders()
    this.colTypePosX = this.$refs['th-prod'].offsetWidth + 'px'
    this.colNamePosX =
      this.$refs['th-prod'].offsetWidth +
      this.$refs['th-type'].offsetWidth +
      'px'
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('keyup', this.handleKeyup)
  },

  computed: {
    ...mapGetters([
      'nbSelectedTasks',
      'openProductions',
      'personMap',
      'productionMap',
      'taskTypeMap',
      'user'
    ]),

    allDuration() {
      let duration = 0
      this.tasks.forEach(task => {
        duration += Number(task.computing_time.duration)
      })
      return duration / (1000 * 1000 * 60 * 60 * 8)
    },

    displayedTasks() {
      return this.tasks
    },

    isDescriptionPresent() {
      return this.tasks.some(task => {
        return task.entity_description && task.entity_description.length > 0
      })
    },

    metadataDescriptorsMap() {
      const metadataDescriptorsMap = {}
      if (!this.isToCheck) {
        this.openProductions.forEach(project => {
          project.descriptors.forEach(descriptor => {
            const isUserDepartment = this.user.departments.some(department =>
              descriptor.departments.includes(department)
            )
            if (isUserDepartment) {
              // group them by field_name if they have the same field_name
              if (!(descriptor.field_name in metadataDescriptorsMap)) {
                metadataDescriptorsMap[descriptor.field_name] = {}
              }
              const descriptorFieldNameEntry =
                metadataDescriptorsMap[descriptor.field_name]
              // group them by entity_type if the have the same entity_type
              if (!(descriptor.entity_type in descriptorFieldNameEntry)) {
                descriptorFieldNameEntry[descriptor.entity_type] = {}
              }
              descriptorFieldNameEntry[descriptor.entity_type][project.id] =
                descriptor
            }
          })
        })
      }
      console.log('metadataDescriptorsMap', metadataDescriptorsMap)
      return metadataDescriptorsMap
    },

    isEpisodeVisible() {
      return this.displayedTasks.some(
        task => task.source_id || task.episode_names?.length > 0
      )
    }
  },

  methods: {
    ...mapActions(['sortTaskTime']),
    getSortedPeople(personIds) {
      const people = personIds.map(id => this.personMap.get(id))
      return sortPeople(people)
    },

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },
    addCustomEntry() {},
    formatDate(date) {
      return date ? formatSimpleDate(date) : ''
    },

    getDurationValue(duration) {
      return Number(duration / (1000 * 1000 * 60 * 60)).toFixed(1)
    },
    onDragEnter(task, index) {
      this.dragIndex = index
      this.currentTask.checked = true
    },
    onDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    },
    onDragStart(task, index) {
      this.dragStartIndex = index
      this.currentTask = task
    },
    onDragEnd() {
      this.currentTask.checked = false
      const task_ids = []
      this.displayedTasks.forEach(task => {
        task_ids.push(task.computing_time.id)
      })
      const year = this.yearString
      const month = this.monthString
      const user_id = this.userId
      const l_params = {
        user_id,
        year,
        month,
        task_ids
      }
      console.log(l_params)
      this.sortTaskTime(l_params)
    },
    moveElement(arr, index1, index2) {
      ;[arr[index1], arr[index2]] = [arr[index2], arr[index1]]
      this.$forceUpdate()
      this.dragStartIndex = index2
    },
    onBodyScroll(event, position) {
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.page++
      }
    },
    onLineClicked(task, event) {
      console.log(event)
      if (this.isShiftSelected) {
        if (this.startSelection) {
          const start = this.tasks.indexOf(this.startSelection)
          const end = this.tasks.indexOf(task)
          let entries = []
          if (start < end) {
            entries = this.tasks.slice(start, end + 1)
          } else {
            entries = this.tasks.slice(end, start + 1)
          }
          entries.forEach(entry => {
            entry.checked = !entry.checked
          })
        }
      } else if (this.isCtrlSelected) task.checked = !task.checked
      this.startSelection = task
    },
    handleKeyup(event) {
      if (event.key === 'Shift') {
        this.isShiftSelected = false
      } else if (event.key === 'Control') this.isCtrlSelected = false
    },
    handleKeydown(event) {
      if (event.key === 'Shift') {
        this.isShiftSelected = true
      } else if (event.key === 'Control') {
        this.isCtrlSelected = true
      }
    },
    getTaskType(entry) {
      const taskType = this.taskTypeMap.get(entry.task_type_id)
      const production = this.productionMap.get(entry.project_id)
      taskType.episode_id = entry.episode_id
      if (
        production &&
        production.production_type === 'tvshow' &&
        !entry.episode_id
      ) {
        taskType.episode_id = production.first_episode_id
      }
      return taskType
    },
    entityPath(entity) {
      const entityType = entity.sequence_name ? 'shot' : 'asset'
      const route = {
        name: entityType,
        params: {
          production_id: entity.project_id
        }
      }

      if (entityType === 'asset') {
        route.params.asset_id = entity.entity_id
      } else {
        route.params.shot_id = entity.entity_id
      }

      const production = this.productionMap.get(entity.project_id)
      let episodeId = entity.episode_id
      if (production && production.production_type === 'tvshow' && !episodeId) {
        if (entityType === 'shot') {
          episodeId = production.first_episode_id
        } else {
          episodeId = 'main'
        }
      }

      if (episodeId) {
        route.name = `episode-${entityType}`
        route.params.episode_id = episodeId
      }

      return route
    },
    resizeHeaders() {
      const tableBody = this.$refs['body-tbody']
      const isTableBodyContainLines = tableBody && tableBody.children
      if (isTableBodyContainLines) {
        const bodyElement = tableBody.children[0]
        const columnDescriptors = [
          { index: 1, name: 'type' },
          { index: 3, name: 'name' }
        ]
        columnDescriptors.forEach(desc => {
          const width = Math.max(
            bodyElement.children[desc.index].offsetWidth,
            100
          )
          this.$refs['th-' + desc.name].style['min-width'] = `${width}px`
        })
      }
    },
    mergeMetadataDescriptors(descriptors) {
      const firstKeyEntityType = Object.keys(descriptors)[0]
      const firstKeyProjectId = Object.keys(descriptors[firstKeyEntityType])[0]
      const mergedDescriptors = {
        departments: [],
        field_name:
          descriptors[firstKeyEntityType][firstKeyProjectId].field_name,
        name: descriptors[firstKeyEntityType][firstKeyProjectId].name
      }
      // merge departments
      Object.keys(descriptors).forEach(entityType =>
        Object.keys(descriptors[entityType]).forEach(projectId => {
          mergedDescriptors.departments = [
            ...new Set([
              ...descriptors[entityType][projectId].departments,
              ...mergedDescriptors.departments
            ])
          ]
        })
      )
      return mergedDescriptors
    },
    async onRemove(entry) {
      if (!entry) {
        alert(this.$t('doodle.calculate_tip'))
        return
      }
      let checked_num = 0
      let res = null
      for (const entry of this.tasks) {
        if (entry.checked) {
          const time_task_id = entry.computing_time.id
          const action = 'removeTaskTime'
          const l_params = {
            time_task_id
          }
          res = await this.$store.dispatch(action, l_params)
          checked_num++
        }
      }
      if (checked_num === 0) {
        ElMessage.error('请先至少勾选一个任务')
      } else {
        if (res) this.$emit('remove-sort-task', res)
      }
    },
    setUserRemark(event, entry) {
      const user_remark = event.target.value
      if (user_remark !== entry.user_remark) {
        const user_id = this.userId
        const year = this.yearString
        const month = this.monthString
        const task_id = entry.id
        if (!task_id) {
          alert(this.$t('doodle.calculate_tip'))
          return
        }
        const action = 'setUserRemark'
        const l_params = {
          user_id,
          year,
          month,
          task_id,
          user_remark
        }
        this.$store
          .dispatch(action, l_params)
          .then(res => {
            console.log('setUserRemark Done')
            if (res.data) {
              this.$emit('set-user-remark', entry, user_remark)
              ElMessage({
                message: this.$t('doodle_work.set_success'),
                type: 'success'
              })
            }
          })
          .catch(err => {
            console.log('getUserInfo Error')
            console.error(err)
            this.$emit('set-user-remark', 'error')
          })
      }
    },
    durationDate(event, entry) {
      const duration = event.target.value
      if (duration !== this.getDurationValue(entry.duration)) {
        const user_id = this.userId
        const year = this.yearString
        const month = this.monthString
        const task_id = entry.id
        if (!task_id) {
          alert(this.$t('doodle.calculate_tip'))
          return
        }
        const action = 'setTaskTime'
        const l_params = {
          user_id,
          year,
          month,
          task_id,
          duration
        }
        this.$store
          .dispatch(action, l_params)
          .then(res => {
            console.log('setTaskTime Done')
            if (res.data) {
              this.$emit('set-sort-task', res.data)
            }
          })
          .catch(err => {
            console.log('getUserInfo Error')
            console.error(err)
            this.$emit('set-sort-task', ['error'])
          })
      }
    },
    getEpisodes(task) {
      let episodes = ''
      if (task.entity) {
        //const theTaskType = this.taskTypeMap.get(entry.entity_type_id)
        if (task.task_type?.for_entity.includes('Shot')) {
          episodes = task.entity?.sequence_name.replaceAll('EP', '') ?? ''
        } else {
          episodes = task.entity?.data.ji_shu_lie
        }
      }
      return episodes
    }
  },
  watch: {
    dragIndex(new_v) {
      this.moveElement(this.displayedTasks, this.dragStartIndex, new_v)
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.datatable .datatable-row {
  cursor: pointer;
}

.name {
  width: 200px;
  min-width: 200px;
}

.normal {
  width: 100px;
  min-width: 100px;
}

.description {
  width: 200px;
  min-width: 200px;
}

.description li {
  list-style-type: disc;
  margin-left: 2em;
}

.name a {
  color: inherit;
}

.production {
  display: flex;
  gap: 5px;
  width: 150px;
  min-width: 150px;
  max-width: 150px;
}

.custom-plus {
  color: #1ea7fd;
  cursor: pointer;

  &:hover {
    color: $green !important;
  }
}

.type {
  width: 130px;
  min-width: 130px;
}

.assignees {
  width: 140px;
  max-width: 140px;

  .avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.status {
  width: 130px;
  min-width: 130px;
}

.estimation {
  width: 80px;
  min-width: 80px;
}

td.estimation {
  text-align: right;
}

.start-date,
.due-date {
  min-width: 110px;
  text-align: center;
  width: 110px;
}

.time-remark {
  min-width: 200px;
}

.user-remark {
  min-width: 250px;
}

td.due-date {
  border-right: 1px solid var(--border);
}

td.normal {
  border-right: 1px solid var(--border);
}

td.user-remark {
  border-right: 1px solid var(--border);
}

th.last-comment {
  max-width: 100%;
  width: 100%;
}

td.last-comment {
  min-width: 450px;
}

td.end-date {
  width: 100%;
  min-width: 150px;
  color: $grey;
}

.thumbnail {
  min-width: 60px;
  max-width: 60px;
  width: 60px;
  padding: 0;
}

.empty-list img {
  max-width: 80vh;
}

.entity-name {
  color: var(--text);
  font-weight: bold;
}

.episode {
  min-width: 60px;
  width: 60px;
}

.input-editor {
  text-align: right;
  color: $grey-strong;
  height: 100%;
  width: 100%;
  background: transparent;
}

.line-top {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4ecd76;
  top: -1px;
  z-index: 1;
}

.line-bottom {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4ecd76;
  bottom: 0;
  z-index: 1;
}

.line-row td {
  border-top: 1px solid #1fac27; /* 设置上边框为2px的黑色实线 */
  padding: 0; /* 去除内边距 */
}

.actions {
  min-width: 80px;
  padding: 0.4em;
}
</style>
