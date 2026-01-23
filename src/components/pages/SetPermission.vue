<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { epibolyAuthorizationStore } from '@/store/modules/epibolyauthorization'
import productionsStore from '@/store/modules/productions'
import TreeFilterView from '@/components/widgets/TreeFilterView.vue'
import AssetListCopy from '@/components/lists/AssetListCopy.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import assetTypeStore from '@/store/modules/assettypes'
import ShotListCopy from '@/components/lists/ShotListCopy.vue'
import SequenceListCopy from '@/components/lists/SequenceListCopy.vue'
import studiosStore from '@/store/modules/studios'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
let lastValue = productionsStore.state.currentProduction
const epibolyAuthorization = epibolyAuthorizationStore()
const displayedAssetsPage = ref(1)
const searchFieldText = ref('')
const epibolyAuthorizationListByType = ref(new Map())
const initialLoading = ref(false)
const selectedStudio = ref(studiosStore.state.studios[0].id)
const isStudioSelected = ref(false)
const sequenceId = ref('all')
const sequencesOptions = ref([])

const selectedDepartment = ref('asset')
const selectableDepartments = ref([
  {
    name: '镜头',
    id: 'shot',
    color: 'green'
  },
  {
    name: '序列',
    id: 'sequence'
  },
  {
    name: '资产',
    id: 'asset',
    color: 'red'
  }
])
const displayedAssetsByTypeWithPreview = computed(() => {
  return epibolyAuthorizationListByType.value.get(selectedDepartment.value)
})

const displayedAssetsBySequence = computed(() => {
  if (sequenceId.value === 'all' || selectedDepartment.value === 'sequence')
    return displayedAssetsByTypeWithPreview.value
  return displayedAssetsByTypeWithPreview.value.filter(entity => {
    return (
      (selectedDepartment.value === 'asset'
        ? `EP${entity.ji_shu_lie}`
        : entity.sequence_name) === sequenceId.value
    )
  })
})

const displayedAssetsByStudio = computed(() => {
  if (!displayedAssetsBySequence.value) return []
  if (isStudioSelected.value) {
    return displayedAssetsBySequence.value.filter(entity => {
      if (entity.authorizations.length === 0) return false
      return entity.authorizations.find(
        a => a.studio_id === selectedStudio.value
      )
    })
  } else {
    return displayedAssetsBySequence.value.filter(entity => {
      if (entity.authorizations.length === 0) return true
      return !entity.authorizations.find(
        a => a.studio_id === selectedStudio.value
      )
    })
  }
})
const searchedAssets = computed(() => {
  if (searchFieldText.value === '') return displayedAssetsByStudio.value
  if (!displayedAssetsByStudio.value) return []
  else {
    return displayedAssetsByStudio.value.filter(entity => {
      return entity.name.indexOf(searchFieldText.value) !== -1
    })
  }
})

const displayedAssetsByPage = computed(() => {
  if (!searchedAssets.value) return []
  return groupEntitiesByDepartment(
    searchedAssets.value.slice(
      0,
      Math.min(displayedAssetsPage.value * 100, searchedAssets.value.length)
    )
  )
})

function loadEpibolyAuthorization() {
  displayedAssetsPage.value = 1
  searchFieldText.value = ''
  initialLoading.value = true
  displayedAssetsByTypeWithPreview.value = []
  epibolyAuthorization.actions
    .getEpibolyAuthorization(productionsStore.state.currentProduction.id)
    .then(res => {
      initialLoading.value = false
      groupEntitiesByType(res)
      sequencesOptions.value.push({
        label: '全部',
        value: 'all'
      })
      sequencesOptions.value.push(
        ...epibolyAuthorizationListByType.value
          .get('sequence')
          .map(sequence => {
            return {
              label: sequence.name,
              value: sequence.name
            }
          })
      )
    })
}

onMounted(() => {
  loadEpibolyAuthorization()
  selectedStudio.value = studiosStore.state.studios[0].id
  setInterval(() => {
    const current = productionsStore.state.currentProduction
    if (current !== lastValue) {
      lastValue = current
      loadEpibolyAuthorization()
    }
  }, 300)
})

watch(selectedDepartment, () => {
  displayedAssetsPage.value = 1
  searchFieldText.value = ''
})

function groupEntitiesByDepartment(entities) {
  let parentNameField
  if (selectedDepartment.value === 'asset') parentNameField = 'asset_type_name'
  if (selectedDepartment.value === 'shot') parentNameField = 'sequence_name'
  if (selectedDepartment.value === 'sequence') return entities
  const entitiesByParents = []
  let parentEntities = []
  let previousEntity = null
  entities = entities.sort((a, b) => {
    if (a[parentNameField] < b[parentNameField]) return -1
    if (a[parentNameField] > b[parentNameField]) return 1
    return 0
  })
  for (const entity of entities) {
    if (previousEntity)
      if (
        previousEntity &&
        entity[parentNameField] !== previousEntity[parentNameField]
      ) {
        entitiesByParents.push(parentEntities.slice(0))
        parentEntities = []
      }
    parentEntities.push(entity)
    previousEntity = entity
  }
  entitiesByParents.push(parentEntities)

  return entitiesByParents
}

async function groupEntitiesByType(entities) {
  epibolyAuthorizationListByType.value.clear()
  const assetTypeIds = assetTypeStore.state.assetTypes.map(
    assetType => assetType.id
  )
  for (const entity of entities) {
    if (entity.canceled) continue
    if (entity.entity_type_id === 'e00f8293-81d8-4f04-8309-a6c2e0f652ec') {
      if (!epibolyAuthorizationListByType.value.has('sequence')) {
        epibolyAuthorizationListByType.value.set('sequence', [entity])
      } else {
        epibolyAuthorizationListByType.value.get('sequence').push(entity)
      }
    } else if (assetTypeIds.includes(entity.entity_type_id)) {
      entity['asset_type_name'] =
        assetTypeStore.state.assetTypes.find(
          assetType => assetType.id === entity.entity_type_id
        ).name || '其他'
      if (epibolyAuthorizationListByType.value.has('asset'))
        epibolyAuthorizationListByType.value.get('asset').push(entity)
      else epibolyAuthorizationListByType.value.set('asset', [entity])
    } else if (
      entity.entity_type_id === 'c8b65ac0-e0b7-4da5-b4d2-9b466be0788e'
    ) {
      entity['sequence_name'] = entity.episode_name
      if (epibolyAuthorizationListByType.value.has('shot'))
        epibolyAuthorizationListByType.value.get('shot').push(entity)
      else epibolyAuthorizationListByType.value.set('shot', [entity])
    }
  }
}

function onSearchChange(searchField) {
  searchFieldText.value = searchField
}

async function onEditClicked(entities, callback) {
  for (const entity of entities) {
    if (
      entity.authorizations.length > 0 &&
      entity.authorizations.find(a => a.studio_id === selectedStudio.value)
    )
      continue
    const res = await epibolyAuthorization.actions.addEpibolyAuthorization(
      productionsStore.state.currentProduction.id,
      {
        entity_id: entity.id,
        studio_id: selectedStudio.value
      }
    )
    if (res) {
      entity.authorizations.push({
        entity_id: entity.id,
        studio_id: selectedStudio.value,
        id: res.id
      })
    }
  }
  callback()
}

async function onDeleteClicked(entities, callback) {
  for (const entity of entities) {
    if (
      entity.authorizations.length > 0 &&
      entity.authorizations.find(a => a.studio_id === selectedStudio.value)
    ) {
      await epibolyAuthorization.actions.deleteEpibolyAuthorization(
        productionsStore.state.currentProduction.id,
        entity.authorizations.find(a => a.studio_id === selectedStudio.value).id
      )

      entity.authorizations = entity.authorizations.filter(
        a => a.studio_id !== selectedStudio.value
      )
    }
  }
  callback()
}

function onSequenceChange() {
  displayedAssetsPage.value = 1
}

function onDepartmentChange() {
  displayedAssetsPage.value = 1
}
function onStudioChange(studio) {
  selectedStudio.value = studio
}
</script>

<template>
  <div class="columns fixed-page">
    <div class="assets page">
      <div class="asset-list-header page-header">
        <div class="flexrow mb1">
          <search-field
            ref="search-field"
            class="flexrow-item"
            :can-save="false"
            @change="onSearchChange"
            placeholder="名称"
          />
          <combobox-department
            :selectable-departments="selectableDepartments"
            v-model="selectedDepartment"
            @change="onDepartmentChange"
          />
          <combobox-styled
            :options="sequencesOptions"
            v-model="sequenceId"
            @change="onSequenceChange"
          />
          <combobox-department
            :selectable-departments="studiosStore.state.studios"
            v-model="selectedStudio"
            @change="onStudioChange"
          />
          <el-switch v-model="isStudioSelected" />
        </div>
      </div>
      <div class="assets-row datatable-wrapper">
        <tree-filter-view
          class="asset-list-tree"
          :type="`copy`"
          @tree-selection-changed="onTreeSelectionChanged"
          v-if="false"
        />
        <asset-list-copy
          ref="asset-list"
          class="shot-list"
          :displayed-assets="displayedAssetsByPage"
          :is-error="false"
          :is-edit="false"
          :is-loading="initialLoading"
          @edit-clicked="onEditClicked"
          @delete-clicked="onDeleteClicked"
          @load-more-shots="displayedAssetsPage++"
          v-if="selectedDepartment === 'asset'"
        />
        <shot-list-copy
          class="shot-list"
          :displayed-shots="displayedAssetsByPage"
          :is-error="false"
          :is-loading="initialLoading"
          @edit-clicked="onEditClicked"
          @delete-clicked="onDeleteClicked"
          @load-more-shots="displayedAssetsPage++"
          v-if="selectedDepartment === 'shot'"
        />
        <sequence-list-copy
          class="sequence-list"
          :displayed-sequences="displayedAssetsByPage"
          :is-error="false"
          :is-loading="initialLoading"
          @edit-clicked="onEditClicked"
          @delete-clicked="onDeleteClicked"
          @load-more-shots="displayedAssetsPage++"
          v-if="selectedDepartment === 'sequence'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.assets-row {
  display: flex;
  flex-direction: row;
  height: 100%;
}
.asset-list {
  overflow: auto;
}
.assets {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.flexrow {
  gap: 10px;
}
</style>
