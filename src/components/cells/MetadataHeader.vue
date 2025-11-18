<template>
  <th
    scope="col"
    class="metadata-descriptor"
    :class="{ 'datatable-row-header': isStick }"
    :style="{ left }"
  >
    <div class="flexrow metadata-wrapper-header">
      <!-- <department-name
        :key="department.id"
        :department="department"
        no-padding
        only-dot
        v-for="department in currentDepartments"
      /> -->
      <el-popover
        placement="top"
        trigger="hover"
        :width="196"
        v-if="descriptor.name === '等级'"
      >
        <template #reference>
          <span
            class="flexrow-item ellipsis descriptor-name"
            :title="descriptor.name"
          >
            {{ descriptor.name }}
          </span>
        </template>
        <span :key="grade.name" v-for="grade in gradeList"
          >{{ grade.name || '空' }}:{{ grade.num }},
        </span>
      </el-popover>
      <span
        class="flexrow-item ellipsis descriptor-name"
        :title="descriptor.name"
        v-else
      >
        {{ descriptor.name }}
      </span>

      <span
        class="metadata-menu-button header-icon"
        @click="$emit('show-metadata-header-menu', $event)"
        v-if="!noMenu"
      >
        <chevron-down-icon :size="12" />
      </span>
    </div>
  </th>
</template>

<script>
import { mapGetters } from 'vuex'
import { ChevronDownIcon } from 'lucide-vue-next'

export default {
  name: 'metadata-header',

  props: {
    descriptor: Object,
    isStick: {
      type: Boolean,
      default: false
    },
    left: {
      type: String,
      default: '0px'
    },
    noMenu: {
      type: Boolean,
      default: false
    },
    gradeList: {
      type: Array,
      default: () => []
    }
  },

  components: {
    ChevronDownIcon
  },

  emits: ['show-metadata-header-menu'],

  computed: {
    ...mapGetters(['departmentMap']),

    currentDepartments() {
      const departemts = this.descriptor.departments || []
      return departemts.map(departmentId =>
        this.departmentMap.get(departmentId)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
th.metadata-descriptor {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  overflow-wrap: break-word;
  hyphens: auto;
}

.metadata-wrapper-header {
  position: relative;
}

.metadata-menu-button {
  background: var(--background);
  border-radius: 50%;
  height: 15px;
  width: 15px;
  position: absolute;
  right: 0;
}
</style>
