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
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="tasks.length > 0">
          <tr
            v-for="(entry, i) in displayedTasks"
            :key="entry + '-' + i"
            :class="{
              'datatable-row': true,
              'datatable-row--selectable': true,
              selected:
                selectionGrid && selectionGrid[i] ? selectionGrid[i][0] : false
            }"
            @click="onLineClicked(i)"
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

            <td class="episode">
              <div class="flexrow" :title="'111'">
                {{ getDutyType(entry) }}
              </div>
            </td>

            <description-cell
              class="description"
              :entry="{ description: entry.entity_description }"
              v-if="isDescriptionPresent"
            />
            <td class="start-date">
              {{ formatDate(entry.start_time) }}
            </td>
            <td class="due-date">
              {{ formatDate(entry.end_time) }}
            </td>
            <td class="remark">
              {{ entry.remark }}
            </td>
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
        <!-- <img src="../../assets/illustrations/empty_todo.png" /> -->
      </p>
      <p>
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { selectionListMixin } from '@/components/mixins/selection'
import { formatListMixin } from '@/components/mixins/format'
import { descriptorMixin } from '@/components/mixins/descriptors'

import { PAGE_SIZE } from '@/lib/pagination'
import { formatFullDate } from '@/lib/time'

import DescriptionCell from '@/components/cells/DescriptionCell'
import TableInfo from '@/components/widgets/TableInfo'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

export default {
  name: 'work-duty-list',
  mixins: [formatListMixin, selectionListMixin, descriptorMixin],

  components: {
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
  emits: ['scroll'],

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
    getDutyType(entry) {
      if (entry.type === 0) return this.$t('doodle.overtime')
      if (entry.type === 1) return this.$t('doodle.leave')
      return ''
    },

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    formatDate(date) {
      return date ? formatFullDate(date) : ''
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

td.due-date {
  border-right: 1px solid var(--border);
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

.remark {
  min-width: 200px;
}
</style>
