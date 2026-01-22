<script setup>
import colors from '@/lib/colors.js'
import user from '@/store/modules/user.js'
import main from '@/store/modules/main.js'
import openProductions from '@/store/modules/productions.js'
import { PRODUCTION_CUSTOM_TYPE_OPTIONS } from '@/lib/productions'
import { ref, computed } from 'vue'

const props = defineProps({
  productions: {
    type: Array,
    default: () => []
  }
})

const currentProduction = ref('')

const productionTypes = computed(() => {
  return Object.keys(PRODUCTION_CUSTOM_TYPE_OPTIONS)
})

function getAvatarColor(production) {
  return colors.fromString(production.name)
}

function getThumbnailPath(production) {
  const lastUpdate = production.updated_at || production.created_at
  const timestamp = Date.parse(lastUpdate)
  return `/api/pictures/thumbnails/projects/${production.id}.png?t=${timestamp}`
}

function sectionPath(production, section) {
  const routeName =
    user.state.user && user.state.user.role === 'client'
      ? 'playlists'
      : production.homepage || section
  const route = {
    name: routeName,
    params: {
      production_id: production.id
    },
    query: {}
  }
  if (production.production_type === 'tvshow') {
    if (routeName !== 'episodes') {
      route.name = `episode-${routeName}`
    }
    if (
      !['edits', 'episodes'].includes(routeName) &&
      production.first_episode_id
    ) {
      route.params.episode_id = production.first_episode_id
    } else {
      route.params.episode_id = 'all'
    }
  } else if (production.production_type === 'shots' && routeName === 'assets') {
    route.name = 'shots'
  } else if (
    production.production_type === 'assets' &&
    ['shots', 'sequences'].includes(routeName)
  ) {
    route.name = 'assets'
  }
  if (user.getters.isCurrentUserVendor) route.name = 'breakdown'
  const isEntityPage = [
    'assets',
    'shots',
    'edits',
    'sequences',
    'episodes'
  ].includes(routeName)
  if (isEntityPage) {
    route.query.search = ''
  }
  return route
}

function generateAvatar(production) {
  if (production.short_name) return production.short_name
  const firstLetter = production.name?.slice(0, 2) || 'P'
  return firstLetter.toUpperCase()
}

function getPath(production) {
  return sectionPath(production, main.state.lastProductionScreen)
}
</script>

<template>
  <div :key="productionType" v-for="productionType in productionTypes">
    <div class="production-type">
      {{
        $t(
          'productions.type.' +
            PRODUCTION_CUSTOM_TYPE_OPTIONS[productionType].value
        )
      }}
    </div>
    <div
      :class="{
        'open-productions-list': true,
        'is-grid': openProductions.state.openProductions?.length > 4
      }"
    >
      <div
        class="open-production has-text-centered"
        v-if="!props.productions?.length"
      >
        {{ $t('main.search.no_result') }}
      </div>
      <div
        class="open-production has-text-centered"
        :key="production.id"
        v-for="production in props.productions"
        @mouseenter="currentProduction = production.name"
        @mouseleave="currentProduction = ''"
        v-show="
          production.production_category ===
            PRODUCTION_CUSTOM_TYPE_OPTIONS[productionType].value ||
          (production.production_category === '' &&
            PRODUCTION_CUSTOM_TYPE_OPTIONS[productionType].value === 'short')
        "
      >
        <router-link :to="getPath(production)">
          <div
            class="avatar has-text-centered"
            :style="{
              background: getAvatarColor(production)
            }"
          >
            <template v-if="!production.has_avatar">
              <span
                class="avatar-initials"
                :style="{
                  fontSize:
                    86 / generateAvatar(production).length +
                    (9 - generateAvatar(production).length) +
                    'px'
                }"
              >
                {{ generateAvatar(production) }}
              </span>
            </template>
            <img :src="getThumbnailPath(production)" alt="" v-else />
          </div>
          <div class="production-name">
            <div v-if="production.name === currentProduction">
              {{ production.name }}
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dark {
  .open-productions {
    background: $dark-grey-light;
  }

  .open-productions-box {
    background: $dark-grey-lighter;
    box-shadow: 0 0 4px 2px #333;
  }

  .open-productions-list {
    .open-production:hover .avatar {
      box-shadow: 0 0 4px 2px #444;
    }
  }

  .big-button {
    background: $dark-grey-2;
    box-shadow: 0 0 4px 0 #393;
  }
}

h1.title {
  margin-bottom: 0;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: $grey;
  font-size: 1.9em;
}

.is-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  .open-production {
    margin: 2em auto 0 auto;
  }
}

.open-productions .open-productions-list {
  max-width: 1000px;
  margin: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  text-align: center;

  .avatar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 110px;
    height: 110px;
    margin: auto;
    border-radius: 25px;
    transition: font-size 0.3s ease;
  }

  .avatar-initials {
    display: inline-block;
    font-size: calc(42px);
    font-weight: bold;
    white-space: nowrap;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    border-radius: 25px;
  }

  .open-production {
    overflow-wrap: break-word;
    padding: 10px;
    cursor: pointer;
    padding: 1em;
    flex: 1;
  }

  .open-production:hover {
    transition: all 0.4s ease-in-out;
    transform: scale(1.1);
  }

  .open-production:hover .avatar {
    transition: all 0.4s ease-in-out;
    box-shadow: 0 0 4px 2px var(--box-shadow);
  }

  .open-production:hover .production-name {
    transition: all 0.4s ease-in-out;
    transform: scale(1.15);
    text-shadow: 0 0 3px var(--box-shadow);
  }
}

.production-name {
  font-size: 1.4em;
  text-transform: uppercase;
  color: $grey;
  margin: 0.5em auto;
  width: 200px;
  height: 20px;
}

.welcome {
  max-width: 1000px;
  margin: auto;

  h1 {
    margin-top: 1em;
  }
}

.kitsu-logo {
  margin-top: 4em;
}

a.secondary {
  color: #bbb;
}

a.secondary:hover {
  text-decoration: underline;
}

.new-production-link {
  margin-top: 4em;

  a {
    color: #bbb;
  }
}

.open-productions {
  background: #fafafa;
}

.open-productions-box {
  background: white;
  box-shadow: 0 0 3px 3px #eee;
  border-radius: 3em;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 3em 3em 4em 3em;
}

.open-productions-header {
  gap: 0 1em;
  margin-top: 4em;
  margin-bottom: 1em;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  .logo {
    margin: 0 3px;
    border-radius: 7px;
  }
}

.open-productions.page {
  height: auto;
  min-height: 100vh;
  padding-bottom: 3em;
}

.social-contributions {
  display: flex;
  background: var(--background);
  border: 3px solid var(--selected);
  box-shadow: 0 0 3px 3px var(--box-shadow-alt);
  color: var(--text);
  border-radius: 1em;
  font-size: 1.1rem;
  max-width: 800px;
  margin-bottom: 0;
  margin-top: 2em;
  margin-left: auto;
  margin-right: auto;
  padding: 2em;
  position: relative;

  a {
    color: $green;
  }

  ul {
    margin-bottom: 1em;
    margin-top: 1em;
  }

  .close-contributions {
    cursor: pointer;
    position: absolute;
    right: 30px;
    top: 15px;
    width: 2px;
  }

  .kitsu-with-body {
    margin-right: 2em;
    width: 320px;
  }
}

.big-button {
  background: $white;
  border: 1px solid $green;
  box-shadow: 0 0 4px 0 #9c9;
  color: $green;
  margin-top: 1em;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
    width: auto;
  }

  &:active {
    box-shadow: none;
  }
}

.search-area {
  justify-content: center;
}

.info {
  img {
    width: 800px;
  }
}

@media screen and (max-width: 768px) {
  .title {
    margin-top: 1em;
  }

  .production-name {
    font-size: 1.1em;
  }

  .page {
    padding-top: 3em;
  }

  .open-productions-header {
    margin-bottom: 2em;

    h1 {
      font-size: 1.6em;
      font-weight: bold;
      margin-bottom: 1em;
      margin-top: 0;
      padding-top: 0;
    }
  }

  .open-productions-box {
    padding: 1em 0;
  }

  .open-productions-header,
  .social-contributions .flexrow {
    flex-direction: column;
  }
}

.production-type {
  font-size: 30px;
  font-weight: bold;
}
</style>
