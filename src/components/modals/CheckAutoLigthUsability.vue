<script setup>
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { computed } from 'vue'
const doodleWork = doodleWorkStore()
const props = defineProps({
  autoLightList: {
    type: Array,
    default: () => []
  }
})
const displayList = computed(() => {
  return [...props.autoLightList].sort((a, b) => {
    return a.task.entity_name.localeCompare(a.task.entity_name, undefined, {
      numeric: true
    })
  })
})
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': doodleWork.state.isShowCheckAutoLightList
    }"
  >
    <div
      class="modal-background"
      @click="doodleWork.state.isShowCheckAutoLightList = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle_work.auto_light_list') }}
        </h1>
        <div class="statistical-assets-content">
          <table class="datatable multi-section">
            <thead class="datatable-head" v-columns-resizable>
              <tr>
                <th class="name datatable-row-header">名称</th>
                <th class="name datatable-row-header">消息</th>
              </tr>
            </thead>
            <tbody class="datatable-body">
              <tr
                class="datatable-row"
                :key="index"
                v-for="(item, index) in displayList"
              >
                <td>{{ item.task.entity_name }}</td>
                <td>{{ item.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-list {
  max-height: 60vh;
}

.interval {
  display: flex;
  flex-direction: row;
  gap: 2em;
  margin-bottom: 10px;
}

.project-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.modal-content {
  min-width: 60%;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input {
  max-width: 100px;
  max-height: 30px;
}

.input-checkbox {
  height: 30px;
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
}

.input {
  min-width: 180px;
}
</style>
