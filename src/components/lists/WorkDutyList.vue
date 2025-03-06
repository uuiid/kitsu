<template>
  <div class="data-list task-list">
    <div class="datatable-wrapper" ref="body" v-scroll="onBodyScroll">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th
              scope="col"
              class="name datatable-row-header"
              ref="th-name"
              :style="{ left: colNamePosX }"
            >
              {{ $t('people.persons') }}
            </th>
            <th scope="col" class="episode">
              {{ $t('doodle.type') }}
            </th>
            <th class="description" scope="col" v-if="isDescriptionPresent">
              {{ $t('assets.fields.description') }}
            </th>
            <th scope="col" class="start-date">
              {{ $t('doodle.start_date') }}
            </th>
            <th scope="col" class="due-date">
              {{ $t('doodle.end_date') }}
            </th>
            <th scope="col" class="remark">
              {{ $t('doodle.user_remark') }}
            </th>
            <th scope="col" class="last-comment">
              {{ $t('doodle.action') }}
            </th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="tasks.length > 0">
          <el-config-provider :locale="zhCn">
            <tr
              v-for="(entry, i) in displayedTasks"
              :key="entry + '-' + i"
              :class="{
                'datatable-row': true,
                'datatable-row--selectable': true,
                selected:
                  selectionGrid && selectionGrid[i]
                    ? selectionGrid[i][0]
                    : false
              }"
            >
              <td
                class="name datatable-row-header"
                :style="{ left: colNamePosX }"
              >
                <div class="flexrow">
                  <people-avatar
                    class="flexrow-item"
                    :font-size="14"
                    :key="person.id"
                    :person="person"
                    :size="30"
                    :with-link="false"
                  />
                  <span class="entity-name">
                    {{ person.full_name }}
                  </span>
                </div>
              </td>

              <td class="">
                <div
                  class="flexrow"
                  :title="getDutyType(entry)"
                  v-if="!entry.is_custom"
                >
                  {{ getDutyType(entry) }}
                </div>
                <div v-else v-focus>
                  <span class="select">
                    <select
                      v-model="entry.type"
                      @change="onEntryChange(entry, 'type')"
                      @blur="entry.is_show = false"
                    >
                      <option
                        :key="entry_option.type"
                        :value="entry_option.type"
                        v-for="entry_option in [
                          { type: 'overtime' },
                          { type: 'leave' }
                        ]"
                      >
                        {{ getDutyType(entry_option) }}
                      </option>
                    </select>
                  </span>
                </div>
              </td>

              <description-cell
                class="description"
                :entry="{ description: entry.entity_description }"
                v-if="isDescriptionPresent"
              />
              <td class="start-date">
                <div v-if="!entry.is_custom">
                  {{ formatDate(entry.start_time) }}
                </div>
                <el-date-picker
                  class="custom-input"
                  v-else
                  v-model="entry.start_time"
                  :prefix-icon="1"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="datetime"
                  placeholder="Select date and time"
                  :default-value="entry.start_time"
                  @change="onEntryChange(entry, 'start_time')"
                />
              </td>
              <td class="due-date">
                <div v-if="!entry.is_custom">
                  {{ formatDate(entry.end_time) }}
                </div>
                <el-date-picker
                  class="custom-input"
                  v-else
                  @change="onEntryChange(entry, 'end_time')"
                  v-model="entry.end_time"
                  :prefix-icon="1"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="Select date and time"
                  :default-value="entry.end_time"
                />
              </td>
              <td class="remark">
                <span v-if="!entry.is_custom">
                  {{ entry.remark }}
                </span>
                <input
                  @keyup.enter="onEntryChange(entry, 'remark', $event)"
                  @blur="onEntryChange(entry, 'remark', $event)"
                  class="duty-editor"
                  :value="entry.remark"
                  v-else
                />
              </td>
              <td class="actions has-text-centered">
                <button
                  class="button"
                  data-test="button-delete"
                  tabindex="-1"
                  @click="onRemove(entry)"
                  v-if="entry.is_custom"
                >
                  <trash-icon class="icon is-small only-icon" />
                </button>
              </td>
            </tr>
          </el-config-provider>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <div
      class="has-text-centered empty-list"
      v-if="tasks.length === 0 && !isLoading"
    >
      <p>
        <!-- <img src="../../assets/illustrations/empty_todo.png" /> -->
      </p>
      <p>
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { selectionListMixin } from '@/components/mixins/selection'
import { formatListMixin } from '@/components/mixins/format'
import { descriptorMixin } from '@/components/mixins/descriptors'

import { PAGE_SIZE } from '@/lib/pagination'
import { formatFullDate } from '@/lib/time'

import DescriptionCell from '@/components/cells/DescriptionCell'
import TableInfo from '@/components/widgets/TableInfo'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import { zhCn } from 'element-plus/es/locale/index'
import { TrashIcon } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'

export default {
  name: 'work-duty-list',
  mixins: [formatListMixin, selectionListMixin, descriptorMixin],

  components: {
    TrashIcon,
    PeopleAvatar,
    DescriptionCell,
    TableInfo
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
    emptyText: {
      type: String,
      default: ''
    },
    person: {
      type: Object,
      default: () => {}
    }
  },
  emits: ['scroll', 'delete-entry'],

  data() {
    return {
      page: 1,
      colTypePosX: '',
      colNamePosX: ''
    }
  },

  mounted() {
    this.page = 1
    this.resizeHeaders()
  },

  computed: {
    zhCn() {
      return zhCn
    },
    ...mapGetters([
      'nbSelectedTasks',
      'openProductions',
      'productionMap',
      'taskTypeMap',
      'user'
    ]),

    displayedTasks() {
      return this.tasks.slice(0, this.page * PAGE_SIZE)
    },

    isDescriptionPresent() {
      return this.tasks.some(task => {
        return task.entity_description && task.entity_description.length > 0
      })
    },

    isEpisodeVisible() {
      return this.displayedTasks.some(
        task => task.source_id || task.episode_names?.length > 0
      )
    }
  },

  methods: {
    ...mapActions(['changeCustomDuty', 'deleteCustomDuty']),
    getDutyType(entry) {
      return this.$t(`doodle.${entry.type}`)
    },

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    formatDate(date) {
      return date ? formatFullDate(date) : ''
    },
    onClick(entry) {
      entry.is_show = true
    },
    onBodyScroll(event, position) {
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.page++
      }
    },

    onLineClicked(i) {
      console.log('validation-' + i + '-0')
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
    onEntryChange(entry, type, event = null) {
      let isTo = true
      if (event) {
        if (entry[type] === event.target.value) isTo = false
      }
      if (isTo) {
        this.changeCustomDuty(entry).then(res => {
          if (res) {
            ElMessage({
              message: `${this.$t(`doodle.${type}`)}: ${this.$t('doodle.modified_successfully')}`,
              type: 'success',
              plain: true
            })
          } else {
            ElMessage({
              message: `${this.$t(`doodle.${type}`)}: ${this.$t('doodle.modified_failed')}`,
              type: 'error',
              plain: true
            })
          }
        })
      }
    },
    onRemove(entry) {
      this.deleteCustomDuty(entry).then(res => {
        console.log(res)
        this.$emit('delete-entry', entry)
      })
    },
    resizeHeaders() {
      const tableBody = this.$refs['body-tbody']
      const isTableBodyContainLines = tableBody && tableBody.children
      if (isTableBodyContainLines) {
        // const bodyElement = tableBody.children[0]
        const columnDescriptors = [
          { index: 1, name: 'type' },
          { index: 3, name: 'name' }
        ]
        columnDescriptors.forEach(desc => {
          const width = 100
          this.$refs['th-' + desc.name].style['min-width'] = `${width}px`
        })
      }
    }
  },
  watch: {
    displayedTasks(newValue, oldValue) {
      console.log(newValue, oldValue)
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
  width: 70px;
  min-width: 70px;
  max-width: 70px;
}

.type {
  width: 130px;
  min-width: 130px;
}

.status {
  width: 130px;
  min-width: 130px;
}

.start-date,
.due-date {
  min-width: 110px;
  width: 180px;
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
  min-width: 130px;
  width: 130px;
}

.input-editor {
  text-align: right;
  color: $grey-strong;
  height: 100%;
  width: 100%;
  background: transparent;
}

.duty-editor {
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text);
  height: 100%;
  padding: 0.5rem;
  width: 100%;
  z-index: 100;

  &:focus {
    border: 1px solid $green;
    background: var(--background);
  }
}

.select {
  padding: 0;
}

td.remark {
  border-right: 1px solid var(--border);
}

.remark {
  min-width: 200px;
}

::v-deep .el-input__wrapper {
  box-shadow: none !important; /* 取消默认边框 */
  padding: 0;
}

::v-deep .el-input__inner {
  color: var(--text) !important;
}

::v-deep .el-input__prefix {
  width: 0 !important;
}

.actions {
  min-width: 80px;
  padding: 0.4em;
}
</style>
