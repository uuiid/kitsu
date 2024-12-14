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
  submitWorkTask(task, localPath = '') {
    const path = localPath + `/api/doodle/task`
    return client.ppost(path, task)
  }
}
