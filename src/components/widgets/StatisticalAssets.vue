<script setup>
import { workingFileStore } from '@/store/modules/workingfile.js'
import { computed, onMounted } from 'vue'
import assets from '@/store/modules/assets'
import tasktypes from '@/store/modules/tasktypes.js'
import productions from '@/store/modules/productions.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  projectId: {
    type: String,
    default: ''
  },
  sequenceId: {
    type: String,
    default: ''
  }
})
const workingFile = workingFileStore()
const displayedTaskTypes = computed(() => {
  return tasktypes.state.taskTypes.filter(
    taskType => taskType.for_entity === 'Asset'
  )
})

const workingFilesList = computed(() => {
  if (
    props.projectId === '' ||
    !props.sequenceId === '' ||
    props.sequenceId === 'all'
  )
    return []
  const temp_list = []
  for (const entity_id of workingFile.state.workingFiles.keys()) {
    const entity = assets.state.assetMap.get(entity_id)
    if (entity) {
      const temp_entity = Object.assign({}, entity)
      temp_entity['work_files'] =
        workingFile.actions.groupEntitiesTaskByParents(
          workingFile.state.workingFiles.get(entity_id),
          'task_id',
          'task_type_id',
          true
        )
      temp_list.push(temp_entity)
    }
  }
  temp_list.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })
  const temp = workingFile.actions.groupEntitiesByParents(
    temp_list,
    'asset_type_name'
  )
  return temp
})
onMounted(() => {
  if (props.sequenceId === 'all') return
  if (workingFile.state.workingFiles.size === 0)
    workingFileStore().actions.getWorkingFilesFromSequence(
      props.projectId,
      props.sequenceId
    )
})
function onClickWorkFile(work_file) {
  const fs = require('fs')
  const path = require('path')
  const full_path = `${productions.state.productionMap.get(props.projectId).path}/${work_file.path}`
  if (!fs.existsSync(full_path)) {
    ElMessage.error('文件不存在')
    return
  }
  window.api.openPath(path.dirname(full_path))
}
</script>

<template>
  <div class="statistical-assets">
    <table class="datatable multi-section">
      <thead class="datatable-head" v-columns-resizable id="datatable-asset">
        <tr>
          <th>名称</th>
          <th :key="taskType.id" v-for="taskType in displayedTaskTypes">
            {{ taskType.name }}
          </th>
        </tr>
      </thead>
      <tbody
        class="datatable-body"
        :key="k"
        v-for="(group, k) in workingFilesList"
      >
        <tr class="datatable-type-header" v-if="group[0]">
          <th scope="rowgroup" :colspan="visibleColumns">
            <span class="datatable-row-header pointer">
              {{ group[0] ? group[0].asset_type_name : '' }}
            </span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          :key="`row${asset.id}`"
          v-for="asset in group"
        >
          <td>{{ asset.name }}</td>
          <td
            :key="taskType.id + asset.id"
            v-for="taskType in displayedTaskTypes"
          >
            <div
              class="clickable-text"
              :class="{
                errorText: work_file.path === ''
              }"
              :key="work_file.id"
              :title="work_file.path"
              v-for="work_file in asset.work_files.get(taskType.id)"
              @click="onClickWorkFile(work_file)"
            >
              {{ work_file.description }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.errorText {
  color: red;
  cursor: default;
}
.clickable-text {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
  text-decoration: underline;
  color: #6098df;
}
</style>
