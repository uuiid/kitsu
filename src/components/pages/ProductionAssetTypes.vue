<template>
  <div class="asset-types page fixed-page">
    <div class="asset-type-list-header page-header flexrow">
      <search-field
        class="flexrow-item mt1"
        ref="asset-type-search-field"
        @change="onSearchChange"
        placeholder="ex: chars, agent327"
      />
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.display_mode')"
        style="margin-bottom: 8px"
        locale-key-prefix="statistics."
        :options="displayModeOptions"
        v-model="displayMode"
      />
      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="refresh"
        :title="$t('main.reload')"
        @click="reset"
      />
      <button-simple
        class="flexrow-item"
        icon="download"
        @click="exportStatisticsToCsv"
      />
    </div>
    <div class="flex gap-2 mt-4">
      <span
        class="tag"
        :key="episode"
        :class="{
          'tag-checked': selectedEpisodes.includes(episode)
        }"
        style="width: 50px"
        v-for="episode in episodeList"
        @click="
          selectedEpisodes.includes(episode)
            ? selectedEpisodes.splice(selectedEpisodes.indexOf(episode), 1)
            : selectedEpisodes.push(episode)
        "
      >
        {{ episode }}
      </span>
    </div>
    <production-asset-type-list
      ref="asset-type-list"
      :entries="displayedAssetTypes"
      :is-loading="isAssetsLoading || initialLoading"
      :is-error="isAssetsLoadingError"
      :validation-columns="assetValidationColumns"
      :asset-type-stats="computedAssetTypeStats"
      :display-mode="displayMode"
      :show-all="assetTypeSearchText.length === 0"
      @scroll="saveScrollPosition"
    />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
import { computeStats } from '@/lib/stats'
import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import { searchMixin } from '@/components/mixins/search'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ProductionAssetTypeList from '@/components/lists/ProductionAssetTypeList.vue'
import SearchField from '@/components/widgets/SearchField.vue'

export default {
  name: 'production-asset-types',

  mixins: [searchMixin],

  components: {
    ButtonSimple,
    Combobox,
    ProductionAssetTypeList,
    SearchField
  },

  data() {
    return {
      initialLoading: true,
      displayMode: 'pie',
      displayModeOptions: [
        { label: 'pie', value: 'pie' },
        { label: 'count', value: 'count' }
      ],
      selectedEpisodes: []
    }
  },

  computed: {
    ...mapGetters([
      'assetTypeMap',
      'assetTypeStats',
      'assetTypeSearchText',
      'assetTypeListScrollPosition',
      'assetValidationColumns',
      'currentEpisode',
      'currentProduction',
      'displayedAssetTypes',
      'isAssetsLoading',
      'isAssetsLoadingError',
      'isTVShow',
      'taskStatusMap',
      'taskTypeMap',
      'taskMap',
      'assets'
    ]),

    searchField() {
      return this.$refs['asset-type-search-field']
    },
    episodeList() {
      const temp = []
      this.assets.forEach(asset => {
        if (!temp.includes(asset.ji_shu_lie)) {
          temp.push(asset.ji_shu_lie)
        }
      })
      temp.sort()
      return temp
    },
    computedAssetTypeStats() {
      return computeStats(
        this.assets.filter(asset =>
          this.selectedEpisodes.length === 0
            ? true
            : this.selectedEpisodes.includes(asset.ji_shu_lie)
        ),
        'asset_type_id',
        this.taskStatusMap,
        this.taskMap
      )
    }
  },

  mounted() {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
    setTimeout(() => {
      this.reset()
    }, 100)
  },

  methods: {
    ...mapActions([
      'computeAssetTypeStats',
      'initAssetTypes',
      'loadAssets',
      'setAssetTypeSearch',
      'setAssetTypeListScrollPosition',
      'setLastProductionScreen'
    ]),
    setDefaultSearchText() {
      if (this.assetTypeSearchText.length > 0) {
        this.$refs['asset-type-search-field'].setValue(this.assetTypeSearchText)
      }
    },

    setDefaultListScrollPosition() {
      this.$refs['asset-type-list'].setScrollPosition(
        this.assetTypeListScrollPosition
      )
    },

    onSearchChange() {
      const searchQuery = this.$refs['asset-type-search-field'].getValue()
      this.setAssetTypeSearch(searchQuery)
      this.setSearchInUrl(searchQuery)
    },

    saveScrollPosition(scrollPosition) {
      this.setAssetTypeListScrollPosition(scrollPosition)
    },

    exportStatisticsToCsv() {
      const nameData = [
        moment().format('YYYYMMDD'),
        this.currentProduction.name,
        'asset_types',
        'statistics'
      ]
      if (this.currentEpisode) {
        nameData.splice(2, 0, this.currentEpisode.name)
      }
      const name = stringHelpers.slugify(nameData.join('_'))
      csv.generateStatReports(
        name,
        this.computedAssetTypeStats,
        this.taskTypeMap,
        this.taskStatusMap,
        this.assetTypeMap,
        this.countMode,
        this.currentProduction
      )
    },

    reset() {
      this.initialLoading = true
      this.loadAssets().then(() => {
        this.computeAssetTypeStats()
        this.setAssetTypeListScrollPosition(0)
        this.initialLoading = false
        this.setSearchFromUrl()
        this.onSearchChange()
      })
    }
  },

  watch: {
    currentProduction() {
      if (!this.isTVShow) this.reset()
    },

    currentEpisode() {
      if (this.isTVShow) this.reset()
    }
  },

  head() {
    return {
      title: `${this.currentProduction.name} | ${this.$t(
        'asset_types.production_title'
      )}`
    }
  }
}
</script>

<style lang="scss" scoped>
.tag {
  background: transparent;
  color: var(--text);
  cursor: pointer;
  border-radius: 3px;
  padding: 1px;
  margin: 0 4px 4px 0;
  font-size: 0.9em;

  &:hover {
    background: var(--background-selectable);
  }
}

.tag-checked {
  background: var(--background-selectable);
  color: rgba(100, 255, 100, 1);
}
</style>
