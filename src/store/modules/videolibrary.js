import videolibraryApi from '../api/videolibrary'
const initialState = {
  videos: [],
  originalVideoTypes: [],
  videoTypes: {},
  editVideo: {},
  editVideos: [],
  editVideoImage: null,
  isElectron: false
}

const state = {
  ...initialState
}

const mutations = {
  SET_VIDEOS(state, videos) {
    state.videos = videos.filter(item => item.active)
  },
  SET_EDIT_VIDEO(state, video) {
    state.editVideo = video
  },
  SET_VIDEO_TYPE(state, videoTypes) {
    state.videoTypes = videoTypes
  },
  SET_ORIGINAL_VIDEO_TYPES(state, videoTypes) {
    state.originalVideoTypes = videoTypes
  },
  NEW_VIDEO(state, video) {
    state.editVideo = video
    state.videos.push(video)
  },
  NEW_VIDEOS_TYPE(state, type) {
    state.originalVideoTypes.push(type)
  },
  DLETE_VIDEO(state, video) {
    state.videos = state.videos.filter(item => item.id !== video.id)
  },
  MODIFY_VIDEO(state, video) {},
  SET_IS_ELECTRON(state, isElectron) {
    state.isElectron = isElectron
  }
}

const getters = {
  videos: state => state.videos,
  videosType: state => state.videosType,
  editVideo: state => state.editVideo,
  originalVideoTypes: state => state.originalVideoTypes,
  isElectron: state => state.isElectron
}
const actions = {
  loadVideos({ commit }) {
    videolibraryApi
      .getVideos()
      .then(res => {
        commit('SET_VIDEOS', res)
        return res
      })
      .catch(err => {
        console.log(err)
        return err
      })
  },
  newVideos({ commit }, Videos) {
    commit('NEW_VIDEOS', Videos)
    return videolibraryApi.newVideo(Videos)
  },
  newVideo({ commit }, video) {
    return videolibraryApi
      .newVideo(video)
      .then(res => {
        videolibraryApi.addImage(res.id, video.upimage).then(imageres => {
          commit('NEW_VIDEO', res)
        })
        return res
      })
      .catch(err => {
        console.log(err)
        return err
      })
  },
  modifyVideo({ commit }, video) {
    return videolibraryApi
      .modifyVideo(video)
      .then(res => {
        commit('DLETE_VIDEO', video)
      })
      .catch(err => {
        console.log(err)
        return err
      })
  },
  deleteVideo({ commit }, video) {
    videolibraryApi.deleteVideo(video).then(res => {
      commit('DLETE_VIDEO', video)
    })
  },
  loadVideosType({ commit }) {
    videolibraryApi
      .getVideosType()
      .then(res => {
        commit('SET_ORIGINAL_VIDEO_TYPES', res)
        return res
      })
      .catch(err => {
        console.log(err)
        return err
      })
  },
  newVideosType({ commit }, type) {
    videolibraryApi
      .newVideoType(type)
      .then(res => {
        commit('NEW_VIDEOS_TYPE', res)
        return res
      })
      .catch(err => {
        console.log(err)
        return err
      })
  },

  setIsElectron({ commit }, isElectron) {
    commit('SET_IS_ELECTRON', isElectron)
  }
}
export default {
  state,
  getters,
  actions,
  mutations
}
