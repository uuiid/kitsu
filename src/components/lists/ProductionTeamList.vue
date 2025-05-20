<template>
  <custom-table-header-menu
    ref="headerMenu"
    @blur="departmentsMenu = false"
    v-if="departmentsMenu"
    :style="`top:${departmentsMenuPosition.Y}px;left:${departmentsMenuPosition.X}px;`"
  >
    <template #list>
      <div
        class="departments-list"
        :key="department"
        v-for="department in departmentsList"
      >
        <div class="departments-list">
          <input
            type="checkbox"
            @mousedown.prevent
            :checked="selectedDepartments.includes(department)"
            @change="onChange(department)"
          />
          <span
            style="
              width: 100%;
              cursor: pointer;
              user-select: none;
              color: var(--text);
            "
            @click="onChange(department)"
            >{{ departmentMap.get(department).name }}</span
          >
        </div>
      </div>
    </template>
  </custom-table-header-menu>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('people.list.name') }}
            </th>
            <th scope="col" class="email" v-if="isCurrentUserManager">
              {{ $t('people.list.email') }}
            </th>
            <th scope="col" class="contract" v-if="isCurrentUserManager">
              {{ $t('people.list.contract') }}
            </th>
            <th scope="col" class="role">
              {{ $t('people.list.role') }}
            </th>
            <th scope="col">
              <div style="position: relative" ref="departmentsRef">
                <span>
                  {{ $t('people.list.departments') }}
                </span>
                <span
                  class="metadata-menu-button header-icon"
                  @click="showHeaderMenu"
                >
                  <chevron-down-icon :size="12" />
                </span>
              </div>
            </th>
            <th scope="col" class="actions" v-if="isCurrentUserManager"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="!isEmpty">
          <tr
            class="datatable-row"
            :key="person.id"
            v-for="person in filteredEntries"
          >
            <people-name-cell
              class="name datatable-row-header"
              :person="person"
            />
            <td class="email" v-if="isCurrentUserManager">
              {{ person.email }}
            </td>
            <td class="contract" v-if="isCurrentUserManager">
              {{ $t(`people.contract.${person.contract_type}`) }}
            </td>
            <td class="role">
              {{ $t(`people.role.${person.role}`) }}
            </td>
            <department-names-cell :departments="person.departments" />
            <td class="actions has-text-right" v-if="isCurrentUserManager">
              <button class="button" @click="removePerson(person)">
                {{ $t('main.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="has-text-centered mt2" v-if="isEmpty">
      {{ $t('people.empty_team') }}
    </p>

    <p class="has-text-centered footer-info" v-else>
      {{ entries.length }} {{ $tc('people.persons', entries.length) }}
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import DepartmentNamesCell from '@/components/cells/DepartmentNamesCell.vue'
import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'
import { ChevronDownIcon } from 'lucide-vue-next'
import CustomTableHeaderMenu from '@/components/cells/CustomTableHeaderMenu.vue'

export default {
  name: 'production-team-list',

  components: {
    CustomTableHeaderMenu,
    ChevronDownIcon,
    DepartmentNamesCell,
    PeopleNameCell
  },
  data() {
    return {
      departmentsMenu: false,
      selectedDepartments: [],
      allDepartments: [],
      departmentsMenuPosition: {
        X: 0,
        Y: 0
      }
    }
  },

  props: {
    entries: {
      type: Array,
      default: () => []
    }
  },
  mounted() {},

  computed: {
    ...mapGetters(['isCurrentUserManager', 'departmentMap']),
    filteredEntries() {
      if (this.selectedDepartments.length === 0) {
        return this.entries
      } else {
        return this.entries.filter(entry => {
          return this.checkIncludeList(
            entry.departments,
            this.selectedDepartments
          )
        })
      }
    },
    departmentsList() {
      const temp = []
      this.entries.forEach(entry => {
        entry.departments.forEach(department => {
          if (!temp.includes(department)) temp.push(department)
        })
      })
      return temp
    },
    isEmpty() {
      return !this.entries?.length
    }
  },

  methods: {
    ...mapActions(['removePersonFromTeam']),

    removePerson(person) {
      this.removePersonFromTeam(person)
    },
    onChange(department) {
      if (this.selectedDepartments.includes(department)) {
        const index = this.selectedDepartments.indexOf(department)
        this.selectedDepartments.splice(index, 1)
      } else this.selectedDepartments.push(department)
    },
    showHeaderMenu() {
      this.departmentsMenu = true
      this.$nextTick(() => {
        this.$refs.headerMenu.focus()
        const rect =
          this.$refs.departmentsRef.$el?.getBoundingClientRect?.() ??
          this.$refs.departmentsRef.getBoundingClientRect?.()

        if (rect) {
          this.departmentsMenuPosition.X = rect.left + window.scrollX + 35
          this.departmentsMenuPosition.Y = rect.top + window.scrollY + 25
        }
      })
    },
    checkIncludeList(list = [], list2 = []) {
      if (list && list2) {
        for (const i of list) {
          if (list2.includes(i)) return true
        }
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 230px;
  min-width: 230px;
}

.email {
  width: 300px;
  min-width: 300px;
}

.phone {
  width: 200px;
  min-width: 200px;
}

.role {
  width: 160px;
  min-width: 160px;
}

.contract {
  width: 125px;
  min-width: 125px;
}

.actions {
  min-width: 100px;
}

.data-list {
  margin-top: 2em;
}

.footer-info {
  color: var(--text);
}

.departments-list {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 5px;
  list-style: none;
  min-width: 100px;
  color: var(--color);

  :hover {
    background-color: var(--background-selectable);
  }
}
</style>
