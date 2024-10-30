import client from '@/store/api/client'

export default {
  newVideo(video) {
    const data = {
      label: video.label,
      parent_id: video.parent_id,
      id: video.id,
      path: video.path,
      notes: video.notes,
      active: video.active
    }
    const path = `/api/doodle/model_library/assets`
    return client.ppost(path, data)
  },
  getVideos() {
    const path = `/api/doodle/model_library/assets`
    return client.pget(path)
  },
  deleteVideo(video) {
    const path = `/api/doodle/model_library/assets/${video.id}`
    return client.pdel(path)
  },
  modifyVideo(video) {
    const path = `/api/doodle/model_library/assets/${video.id}`
    return client.ppost(path, video)
  },
  newVideoType(type) {
    const data = {
      label: type.label,
      parent_id: type.parent_id,
      id: type.id
    }
    const path = `/api/doodle/model_library/assets_tree`
    return client.ppost(path, data)
  },
  getVideosType() {
    const path = `/api/doodle/model_library/assets_tree`
    return client.pget(path)
  },
  deleteVideoType(video) {
    const path = `/api/doodle/model_library/assets_tree/${video.id}`
    return client.pdel(path)
  },
  addImage(id, image) {
    const path = `/api/doodle/pictures/${id}`
    //const formData = new FormData()
    //formData.append("file",image)
    return client.ppostFileData(path, image)
  }
}
