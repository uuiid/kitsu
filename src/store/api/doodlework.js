import client from '@/store/api/client.js'

export default {
  cancelWorkTask(task_id, data, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}`
    return client.ppatch(path, data)
  },
  deleteWorkTask(task_id, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}`
    return client.pdel(path)
  },
  getLocalSetting(localPath = '') {
    const path = localPath + `/api/doodle/local_setting`
    return client.pget(path)
  },
  getToolVersion(localPath = '') {
    const path = localPath + `/api/doodle/tool/version`
    return client.pget(path)
  },
  getWorkLog(task_id, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}/log`
    return fetch(path)
  },
  getWorkLogMini(task_id, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}/log/mini`
    return fetch(path)
  },
  getWorkTask(task_id, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}`
    return client.pget(path)
  },
  listWorkTask(localPath = '', options = '') {
    const path = localPath + `/api/doodle/task?` + options
    return client.pget(path)
  },
  setLocalSetting(setting, localPath = '') {
    const path = localPath + `/api/doodle/local_setting`
    return client.ppost(path, setting)
  },
  setWorkTask(task_id, task, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}`
    return client.ppatch(path, task)
  },
  submitWorkTask(task, localPath = '', isVisitor = false, project_id = '') {
    let path = localPath + `/api/doodle/task`
    if (isVisitor) path = `/api/actions/projects/${project_id}/export-anim-fbx`
    return client.ppost(path, task)
  },
  addWatermark(task, localPath = '') {
    const path = localPath + `/api/actions/tools/add-watermark`
    return client.ppost(path, task)
  },
  resubmitWorkTask(task, localPath = '') {
    const path = localPath + `/api/doodle/task/${task.id}/restart`
    return client.ppost(path, task)
  },
  checkIsVisitor() {
    const path = '/api/auth/authenticated'
    return fetch(path, { method: 'GET' })
  },
  getVisitorContext() {
    const path = '/api/data/user/context'
    return client.pget(path)
  },
  updateFile(task, file_data, type, onProgress, assetOrShot = '') {
    const path = `/api/doodle/data/${assetOrShot !== '' ? assetOrShot : task.entity_type || `assets`}/${task.task_id || task.id}/file/${type}`
    return client.ppostFileData(path, file_data, onProgress)
  },
  getVideoThumbnail(task, localPath = '') {
    const path = localPath + `/api/doodle/video/thumbnail`
    return client.ppostThumbnail(path, task)
  },
  getDoodleFlags(id) {
    const path = `/api/doodle/file_association/${id}`
    return client.pget(path)
  },
  getMayaFilePath(id) {
    const path = `/api/doodle/data/asset/${id}/file/maya`
    return client.pget(path)
  },
  getUeFilePath(id) {
    const path = `/api/doodle/data/asset/${id}/file/ue`
    return client.pget(path)
  },
  getImageFilePath(id) {
    const path = `/api/doodle/data/asset/${id}/file/image`
    return client.pget(path)
  },
  getLocalLogPath(localPath = '') {
    const path = localPath + `/api/doodle/local_setting/tmp_dir/server_task`
    return client.pget(path)
  },
  getLocalWatermarkSetting(localPath = '') {
    const path = localPath + `/api/actions/tools/add-watermark`
    return client.pget(path)
  },
  previewWatermark(data, localPath = '') {
    const path = localPath + `/api/actions/tools/add-watermark`
    return client.pput(path, data)
  },
  submitLightTask(project_id, task, localPath = '') {
    const path = localPath + `/api/actions/project/${project_id}/sync`
    return client.ppost(path, task)
  },
  submitInspectTask(task, localPath = '') {
    const path = localPath + `/api/doodle/task/${task.task_id}/inspect`
    return client.ppost(path, task)
  },
  submitGenerateUeskTask(task, localPath = '') {
    const path =
      localPath + `/api/doodle/task/${task.task_id}/generate_uesk_file`
    return client.ppost(path, task)
  },
  submitExportAnimation(task, localPath = '') {
    const path =
      localPath +
      `/api/actions/projects/${task.project_id}/shots/${task.task_id}/export-anim-fbx`
    return client.ppost(path, task)
  },
  submitSimAbc(task, localPath = '') {
    const path =
      localPath +
      `/api/actions/projects/${task.project_id}/shots/${task.task_id}/update-sim-abc`
    return client.ppost(path, task)
  },
  updateUeFile(task, localPath = '') {
    const path = localPath + `/api/actions/local/task/${task.task_id}/update/ue`
    return client.ppost(path, task)
  }
}
