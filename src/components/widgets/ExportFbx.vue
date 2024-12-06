<script setup>
import { ref } from 'vue'
//import { getCurrentInstance } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import TableList from '@/components/lists/TableList.vue'

//const _this = getCurrentInstance().appContext.config.globalProperties
const doodleWork = doodleWorkStore()
const props = defineProps(['name', 'isDrop'])

const isDragOver = ref(false)
const handleDragOver = event => {
  event.preventDefault()
  if (!isDragOver.value) {
    isDragOver.value = true
    if (props.isDrop) {
      event.dataTransfer.dropEffect = 'none'
    } else {
      event.dataTransfer.dropEffect = 'copy'
    }
  }
}

const onDrop = event => {
  event.preventDefault()
  doodleWork.state.isActiveModal = true
  isDragOver.value = false
  const files = event.dataTransfer.files
  const data = []
  files.forEach(file => {
    if (file.name.endsWith('.ma')) {
      data.push(doodleWork.actions.formatFbxData(file))
    }
  })
  doodleWork.state.uncommittedWorkList = [
    ...doodleWork.state.uncommittedWorkList,
    ...data
  ]
}
</script>

<template>
  <div class="datatable-main" @drop="onDrop" @dragover="handleDragOver">
    <table-list
      :table-header-filed="doodleWork.state.tableHeaderFiled"
      :body-list="doodleWork.state.workList"
      :is-drop="false"
      :is-show-view-log="true"
      @add-data="data => doodleWork.state.workList.push(...data)"
      @remove-data="dataIndex => doodleWork.state.workList.splice(dataIndex, 1)"
      @view-log="index => console.log(index)"
    ></table-list>
  </div>
</template>

<style scoped lang="scss">
.datatable-main {
  display: flex;
  flex-direction: column;
  padding: 2em;
  border-radius: 5px;
  max-height: 100%;
  overflow: auto;
  margin-bottom: 1rem;
}
</style>
