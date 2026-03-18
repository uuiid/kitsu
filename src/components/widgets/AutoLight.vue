<script setup>
import { onMounted, ref, computed } from 'vue'
//import { getCurrentInstance } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import TableList from '@/components/lists/TableList.vue'
import { ElMessage } from 'element-plus'
import { SearchIcon } from 'lucide-vue-next'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
//const _this = getCurrentInstance().appContext.config.globalProperties
const doodleWork = doodleWorkStore()

const allComputers = ref([])
const computerListsVisible = ref(false)
const props = defineProps(['name', 'isDrop', 'isSetOutPath'])
doodleWork.state.currentDoodleWorkType = props.name
//const isDragOver = ref(false)
const inputValue = ref('')
const inputValueModel = ref('')
const statusNum = computed(() => {
  let temp = 0
  doodleWork.currentDoodleWorkState.workList.forEach((value, key) => {
    if (value.status === 'failed') {
      //temp_list.push(value)
      temp++
    }
  })
  return temp
})

const filteredWorkList = ref(new Map())

onMounted(async () => {
  doodleWork.state.currentDoodleWorkType = props.name
  await doodleWork.actions.get_all_jobs()
  filteredWorkList.value = doodleWork.currentDoodleWorkState.workList
})
const reload = async () => {
  try {
    await doodleWork.actions.get_all_jobs()
    ElMessage({
      message: '刷新成功',
      type: 'success'
    })
  } catch (e) {
    console.error(e)
    ElMessage({
      message: '刷新失败',
      type: 'error'
    })
  }
}

const onViewLog = work_task => {
  doodleWork.state.viewLogWorkTask = work_task
  doodleWork.state.isActiveLogModal = true
  doodleWork.actions.get_job_log(work_task.id).then(log => {
    doodleWork.state.workTaskLogData = log
  })
}

const onAddData = files => {
  doodleWork.currentDoodleWorkState.addFilesData(files)
  if (doodleWork.currentDoodleWorkState.uncommittedWorkList.size > 0) {
    doodleWork.state.isActiveModal = true
  }
}

const reExecute = async () => {
  doodleWork.currentDoodleWorkState.workList.forEach(work => {
    if (work.status === 'failed') {
      doodleWork.actions.resubmitLocalDoodleWork(work)
    }
  })
  doodleWork.currentDoodleWorkState.isReload = true
}
const onAction = async (action_name, task) => {
  if (action_name === 'view-log') {
    //onViewLog(task)
    doodleWork.state.viewLogWorkTask = task
    doodleWork.state.isActiveLogModal = true
    doodleWork.actions.get_job_log(task.id).then(log => {
      doodleWork.state.workTaskLogData = log
    })
  } else if (action_name === 'restart') {
    doodleWork.actions.resubmitLocalDoodleWork(task)
  }
}
async function getAllComputers() {
  allComputers.value = await doodleWork.actions.get_all_computers()
  computerListsVisible.value = true
}
function deleteComputer(computer) {
  doodleWork.actions.delete_computer(computer.id)
  allComputers.value = allComputers.value.filter(c => c.id !== computer.id)
}
//
// async function getComputerInfo(id) {
//   return await doodleWork.actions.get_one_computer_info(id)
// }
</script>

<template>
  <div class="datatable-main">
    <div class="datatable-content">
      <div class="has-right">
        <button-simple
          text="查看服务器"
          @click="getAllComputers"
        ></button-simple>
        <div class="search-field-main">
          <span class="search-icon">
            <search-icon :size="20" />
          </span>
          <input
            ref="search-field"
            class="input"
            :placeholder="$t('doodle_work.log')"
            v-model.trim="inputValueModel"
            @keydown.enter="inputValue = inputValueModel"
            @input="
              inputValueModel ? undefined : (inputValue = inputValueModel)
            "
          />
        </div>
      </div>
      <table-list
        style="width: 100%"
        :table-header-filed="doodleWork.currentDoodleWorkState.tableHeaderFiled"
        :body-list="filteredWorkList"
        name="刷新"
        :is-drop="false"
        :is-show-submit="false"
        :is-show-restart="false"
        :is-show-delete="false"
        :is-show-view-log="
          doodleWork.currentDoodleWorkState.name !== 'watermark'
        "
        :is-show-demonstrate="true"
        :is-show-cancel="false"
        @add-data="onAddData"
        @remove-data="doodleWork.currentDoodleWorkState.workList.delete"
        @view-log="onViewLog"
        @handle-action="onAction"
      ></table-list>
      <div
        class="has-right"
        v-if="doodleWork.currentDoodleWorkState.workList.size > 0"
      >
        <span>失败/所有:</span>
        <span>
          {{ statusNum }}/{{ doodleWork.currentDoodleWorkState.workList.size }}
        </span>
      </div>
      <div class="has-text-right" v-if="false">
        <div class="buttons">
          <a
            :class="{
              button: true
            }"
            @click="doodleWork.state.isActiveHistoryModal = true"
            v-if="false"
          >
            {{ `历史` }}
          </a>
          <div
            class="buttons"
            v-show="doodleWork.currentDoodleWorkState.workList.size > 0"
          >
            <a
              :class="{
                button: true
              }"
              @click="reload"
            >
              {{ `刷新` }}
            </a>
            <a
              :class="{
                button: true
              }"
              @click="reExecute"
            >
              {{ `重新执行错误任务` }}
            </a>
          </div>
          <a
            :class="{
              button: true
            }"
            @click="doodleWork.state.isShowAutoLightSearch = true"
            v-if="props.name === 'auto_light'"
          >
            查找
          </a>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="computerListsVisible" title="运行主机详情" width="800">
    <el-table :data="allComputers" empty-text="没有主机">
      <el-table-column property="name" label="名称" width="100" />
      <el-table-column property="ip" label="ip" width="200" />
      <el-table-column property="status" label="状态" />
      <el-table-column property="hardware_id" label="硬件id" />
      <el-table-column
        property="last_heartbeat_time"
        label="最后连接时间"
        width="200"
      />
      <el-table-column align="right">
        <template #default="scope">
          <el-button
            size="small"
            type="danger"
            @click="deleteComputer(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<style scoped lang="scss">
.datatable-main {
  display: flex;
  flex-direction: row;
  padding: 2em;
  max-height: 100%;
  width: 100%;
  overflow: hidden;
  margin-bottom: 1rem;
  gap: 10px;
}
.datatable-content {
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  max-height: 100%;
  width: 100%;
  overflow: hidden;
}
.settings {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 0.5em;
}
.watermark-settings {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  width: 300px;
  margin-bottom: 0.1em;
  overflow-x: hidden;
}

.settings-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
}

.input {
  max-width: 100px;
  max-height: 30px;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.search-field-main {
  margin-bottom: 5px;
  //display: flex;
  padding-top: 0;
  position: relative;

  .input {
    font-size: 0.8em;
    border-radius: 10px;
    padding-left: 40px;
  }

  .search-icon {
    position: absolute;
    color: $grey;
    z-index: 4;
    top: 6px;
    left: 10px;
  }
}

.has-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 5px;
  gap: 5px;
}

.input {
  min-width: 180px;
}
</style>
