import superagent from 'superagent'
import errors from '@/lib/errors'
import store from '@/store'

const client = {
  get(path, callback) {
    superagent.get(`${store.state.login.server}${path}`).end((err, res) => {
      // if (res?.statusCode === 401) return errors.backToLogin()
      callback(err, res?.body)
    })
  },

  post(path, data, callback) {
    superagent
      .post(`${store.state.login.server}${path}`)
      .send(data)
      .end((err, res) => {
        if (res?.statusCode === 401) return errors.backToLogin()
        callback(err, res?.body)
      })
  },

  put(path, data, callback) {
    superagent
      .put(`${store.state.login.server}${path}`)
      .send(data)
      .end((err, res) => {
        if (res?.statusCode === 401) return errors.backToLogin()
        callback(err, res?.body)
      })
  },

  del(path, callback) {
    superagent.del(`${store.state.login.server}${path}`).end((err, res) => {
      if (res?.statusCode === 401) return errors.backToLogin()
      callback(err, res?.body)
    })
  },

  pget(path) {
    return superagent
      .get(`${store.state.login.server}${path}`)
      .then(res => res?.body)
  },

  ppost(path, data) {
    return new Promise((resolve, reject) => {
      superagent
        .post(`${store.state.login.server}${path}`)
        .send(data)
        .end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            return reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res?.body)
          }
        })
    })
  },

  ppostFile(path, data) {
    const request = superagent
      .post(`${store.state.login.server}${path}`)
      .send(data)
      .on('progress', e => e)
    return {
      request,
      promise: new Promise((resolve, reject) => {
        request.end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            return reject(err)
          } else {
            if (err) return reject(err)
            else return resolve(res?.body)
          }
        })
      })
    }
  },

  pput(path, data) {
    return new Promise((resolve, reject) => {
      superagent
        .put(`${store.state.login.server}${path}`)
        .send(data)
        .end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res?.body)
          }
        })
    })
  },

  pdel(path, data) {
    return new Promise((resolve, reject) => {
      superagent
        .del(`${store.state.login.server}${path}`)
        .send(data)
        .end((err, res) => {
          if (res?.statusCode === 401) {
            errors.backToLogin()
            reject(err)
          } else {
            if (err) {
              err.body = res ? res.body : ''
              return reject(err)
            } else return resolve(res?.body)
          }
        })
    })
  },

  getConfig() {
    const path = '/api/config'
    return client.pget(path)
  },

  getModel(modelName, modelId, relations = false) {
    let path = `/api/data/${modelName}/${modelId}`
    if (relations) path += '?relations=true'
    return client.pget(path)
  },

  getEvents(after, before) {
    const path = `/api/data/events/last?after=${after}&before=${before}&page_size=100000`
    return client.pget(path)
  },

  searchData(query, limit, offset, index_names, productionId) {
    const path = '/api/data/search'
    const data = { query, limit, offset, index_names }
    if (productionId !== 'all') data.project_id = productionId
    return client.ppost(path, data)
  }
}

export default client
