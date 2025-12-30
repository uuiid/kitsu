<script setup>
import { workingFileStore } from '@/store/modules/workingfile.js'
import { computed, onMounted } from 'vue'
import productions from '@/store/modules/productions.js'
import { ElMessage } from 'element-plus'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import csv from '@/lib/csv.js'
import sequences from '@/store/modules/sequences.js'
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

const workingFilesList = computed(() => {
  if (
    props.projectId === '' ||
    !props.sequenceId === '' ||
    props.sequenceId === 'all'
  )
    return []
  const temp_list = [...workingFile.state.workingFiles.values()]

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
  if (props.sequenceId === 'all') {
    workingFile.state.workingFiles.clear()
    ElMessage.error('请先选择集数')
    return
  }
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
  if (/^[^.]+\.[^.]+$/.test(work_file.name))
    window.api.openPath(path.dirname(full_path))
  else window.api.openPath(full_path)
}

function reset() {
  if (props.sequenceId === 'all') return
  workingFile.actions.getWorkingFilesFromSequence(
    props.projectId,
    props.sequenceId
  )
}

function exportPath() {
  const headers = ['类型', '名称', '路径']
  const project_path =
    `C:\\sy\\${productions.state.productionMap
      .get(props.projectId)
      .path.substring(
        productions.state.productionMap
          .get(props.projectId)
          .path.lastIndexOf('/') + 1
      )}` || ''
  const assetLines = []
  workingFilesList.value.forEach(group => {
    group.forEach(asset => {
      let work_files = ''
      let path = ''
      if (asset.asset_type_name === '场景') {
        work_files = asset.work_files.filter(
          work_file =>
            work_file.software_type === 'alembic' && work_file.is_exists
        )
        if (work_files.length === 0)
          work_files = asset.work_files.filter(
            work_file =>
              work_file.software_type === 'maya_rig' && work_file.is_exists
          )
      } else {
        work_files = asset.work_files.filter(
          work_file =>
            work_file.software_type === 'maya_rig' && work_file.is_exists
        )
      }
      if (work_files.length > 0) path = work_files[0].path
      assetLines.push([
        asset.asset_type_name,
        asset.name,
        path === '' ? '' : `${project_path}/${path}`
      ])
    })
  })
  const name = `${sequences.state.sequenceMap.get(props.sequenceId)?.name || props.sequenceId}项目路径`
  csv.buildCsvFile(name, [headers].concat(assetLines))
}
</script>

<template>
  <div class="statistical-assets">
    <div class="statistical-assets-title">
      <span class="title-text"> 当前集数所用资产 </span>
      <div>
        <button-simple
          class="flexrow-item"
          :title="$t('main.csv.export_file')"
          icon="export-lines"
          :is-responsive="true"
          @click="exportPath"
        />
        <button-simple
          class="flexrow-item"
          icon="refresh"
          :title="$t('doodle.refresh')"
          @click="reset"
        />
      </div>
    </div>
    <div class="statistical-assets-content">
      <table class="datatable multi-section">
        <thead class="datatable-head" v-columns-resizable>
          <tr>
            <th class="name datatable-row-header">名称</th>
            <th class="name datatable-row-header">拼音名称</th>
            <th class="name datatable-row-header">编号</th>
            <th class="name datatable-row-header">版本</th>
            <th class="name datatable-row-header">路径</th>
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
            <td>{{ asset.pin_yin_ming_cheng }}</td>
            <td>{{ asset.bian_hao }}</td>
            <td>{{ asset.ban_ben }}</td>
            <td>
              <div
                class="clickable-text"
                :class="{
                  errorText: !work_file.is_exists,
                  successText: work_file.is_exists
                }"
                :key="work_file.id"
                :title="work_file.path"
                v-for="work_file in asset.work_files"
                @click="onClickWorkFile(work_file)"
              >
                {{ work_file.description }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.statistical-assets {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
  height: 100%;
}
.title-text {
  font-size: 1.3em;
}
.errorText {
  color: red;
  cursor: default;
}
.successText {
  color: #6098df;
  cursor: pointer;
}
.clickable-text {
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
  text-decoration: underline;
}
.datatable-body {
  overflow-y: auto;
}

.statistical-assets-title {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
}

.statistical-assets-content {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
