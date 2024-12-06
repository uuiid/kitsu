<script setup>
import PageTitle from '@/components/widgets/PageTitle.vue'
import ExportFbx from '@/components/widgets/ExportFbx.vue'
import { computed, ref } from 'vue'
import AddDoodleWork from '@/components/modals/AddDoodleWork.vue'

const currentPage = ref('')
const switchPage = pageName => {
  currentPage.value = pageName
}
const homePage = computed(() => {
  return currentPage.value === 'home' || currentPage.value === ''
})

const pagTitle = computed(() => {
  return currentPage.value ? '-' + currentPage.value : currentPage.value
})

const pagedAssets = ref([
  {
    id: 0,
    label: '导出FBX',
    textIcon: 'F',
    disabled: true,
    description: '',
    color: '#00b89c'
  },
  {
    id: 1,
    label: '导出ABC',
    textIcon: 'A',
    disabled: true,
    description: '',
    color: '#d775ec'
  },
  {
    id: 2,
    label: '自动灯光',
    textIcon: 'L',
    disabled: true,
    description: '',
    color: '#ec758b'
  }
])
</script>

<template>
  <div>
    <div class="columns fixed-page">
      <div class="doodle-work">
        <header class="header interval">
          <page-title
            class="mt1 mt1-hover"
            :text="$t('doodle_work.doodle_work')"
            :bold="true"
            @click="switchPage('')"
          />
          <page-title class="mt1" :text="pagTitle" :bold="true" />
        </header>
        <div class="list-body" v-if="homePage">
          <ul class="items">
            <li
              class="item flexcolumn"
              :key="entity.id"
              v-for="entity in pagedAssets"
              @click="switchPage(entity.label)"
            >
              <div class="card">
                <span
                  class="text-icon"
                  :style="`background-color: ${entity.color}`"
                  >{{ entity.textIcon }}</span
                >
                <div class="item-description">
                  <div class="entity-name" :title="entity.label">
                    {{ entity.label }}
                  </div>
                  <div class="entity-description" :title="entity.label">
                    {{ entity.description }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <export-fbx
          class="datatable-wrapper"
          name="导出FBX"
          v-if="currentPage === '导出FBX'"
        />
        <export-fbx
          class="datatable-wrapper"
          v-if="currentPage === '导出ABC'"
        />
        <export-fbx
          class="datatable-wrapper"
          v-if="currentPage === '自动灯光'"
        />
      </div>
      <add-doodle-work />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.doodle-work {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  width: 100%;
  padding: 4em 2em 1em 2em;
  color: var(--text);
  margin-left: auto;
  margin-right: auto;
  gap: 50px;
}

.header {
  display: flex;
  flex-direction: row;
}

.mt1-hover {
  &:hover {
    cursor: pointer;
  }
}

.list-body {
  height: 90%;
  overflow: auto;
  //border: thick dotted #ff0000;
}

.items {
  display: flex;
  flex-wrap: wrap;
  gap: 50px;
  //height: 100%;
  //overflow: auto;
}

.card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  min-width: 300px;
  min-height: 100px;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
  border: 5px solid transparent;
  border-radius: 1em;
  padding: 2px;
  background-color: var(--background-alt);

  .dark & {
    color: var(--text-alt);
    background-color: var(--background-alt);
  }

  &:hover {
    cursor: pointer;
    border-color: var(--background-selectable);
  }

  .text-icon {
    border-radius: 5px;
    display: flex;
    user-select: none;
    justify-content: center;
    align-items: center;
    font-size: 100px;
    min-height: 100px;
    min-width: 100px;
    max-width: 100px;
    max-height: 100px;
    background-color: #ec758b;
    color: var(--text-strong);
  }

  .item-description {
    display: flex;
    height: 100px;
    flex-direction: column;

    .entity-name {
      font-size: 20px;
    }
  }
}
</style>
