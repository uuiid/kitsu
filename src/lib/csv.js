import Papa from 'papaparse'
import * as XLSX from 'xlsx'

import { getTaskTypePriorityOfProd } from '@/lib/productions'
import { getPercentage } from '@/lib/stats'
import stringHelpers from '@/lib/string'
import {
  getDayRange,
  getMonthRange,
  getWeekRange,
  hoursToDays
} from '@/lib/time'

const csv = {
  generateTimesheet(
    name,
    timesheet,
    people,
    unit,
    organisation,
    detailLevel,
    year,
    month,
    currentYear,
    currentMonth,
    currentWeek
  ) {
    const headers = csv.getTimesheetHeaders(
      timesheet,
      detailLevel,
      year,
      month,
      currentYear,
      currentMonth,
      currentWeek
    )
    const entries = csv.getTimesheetEntries(
      organisation,
      unit,
      detailLevel,
      headers,
      people,
      timesheet
    )
    csv.buildCsvFile(name, entries)
  },

  getTimesheetHeaders(
    timesheet,
    detailLevel,
    year,
    month,
    currentYear,
    currentMonth,
    currentWeek
  ) {
    const headers = ['Person']
    let range = []
    if (detailLevel === 'year') {
      Object.keys(timesheet).forEach(yearLabel => {
        headers.push(yearLabel)
      })
    } else if (detailLevel === 'month') {
      range = getMonthRange(year, currentYear, currentMonth)
    } else if (detailLevel === 'week') {
      range = getWeekRange(year, currentYear, currentWeek)
    } else if (detailLevel === 'day') {
      range = getDayRange(year, month, currentYear, currentMonth)
    }
    for (const unit in range) {
      let value = parseInt(unit) + 1
      if (detailLevel === 'day') {
        value = `${year}-${String(month).padStart(2, 0)}-${String(value).padStart(2, 0)}`
      }
      headers.push(value)
    }
    return headers
  },

  getTimesheetEntries(
    organisation,
    unit,
    detailLevel,
    headers,
    people,
    timesheet
  ) {
    const entries = [headers]
    people.forEach(person => {
      const line = [person.full_name]
      if (detailLevel === 'year') {
        headers.forEach((h, index) => {
          if (index > 0) {
            if (timesheet[h] && timesheet[h][person.id]) {
              let value = timesheet[h][person.id] / 60
              if (unit !== 'hour') value = hoursToDays(organisation, value)
              line.push(value)
            } else {
              line.push('-')
            }
          }
        })
      } else {
        headers.forEach((h, index) => {
          if (index > 0) {
            if (timesheet && timesheet[index] && timesheet[index][person.id]) {
              let value = timesheet[index][person.id] / 60
              if (unit !== 'hour') value = hoursToDays(organisation, value)
              line.push(value)
            } else {
              line.push('-')
            }
          }
        })
      }
      entries.push(line)
    })
    return entries
  },

  turnEntriesToCsvString(entries, config = {}) {
    return Papa.unparse(entries, {
      delimiter: ';',
      newline: '\n',
      quotes: true,
      skipEmptyLines: true,
      ...config
    })
  },

  buildCsvFile(name, entries) {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(entries)
    XLSX.utils.book_append_sheet(wb, ws, name)

    XLSX.writeFile(wb, `${name}.xlsx`)
  },

  buildCsvFileAll(name, headers, sheets) {
    const wb = XLSX.utils.book_new()
    const entries = [headers]
    sheets.forEach(s => {
      for (const e of s.entries) {
        entries.push(e)
      }
    })
    const ws = XLSX.utils.aoa_to_sheet(entries)
    XLSX.utils.book_append_sheet(wb, ws, 'ALL')
    sheets.forEach(s => {
      s.entries.unshift(headers)
      const ws = XLSX.utils.aoa_to_sheet(s.entries)
      XLSX.utils.book_append_sheet(wb, ws, s.name)
    })
    XLSX.writeFile(wb, `${name}.xlsx`)
  },

  generateStatReports(
    name,
    mainStats,
    taskTypeMap,
    taskStatusMap,
    entryMap,
    countMode,
    production
  ) {
    const headers = csv.getStatReportsHeaders(
      mainStats,
      taskTypeMap,
      production
    )
    const entries = csv.getStatReportsEntries(
      mainStats,
      taskTypeMap,
      taskStatusMap,
      entryMap,
      countMode,
      production
    )
    const lines = [headers, ...entries]
    return csv.buildCsvFile(name, lines)
  },

  getStatReportsHeaders(mainStats, taskTypeMap, production) {
    const taskTypeIds = getStatsTaskTypeIds(mainStats, taskTypeMap, production)
    const initialHeaders = ['Name', '', 'All', '']
    return taskTypeIds.reduce((acc, taskTypeId) => {
      if (taskTypeId !== 'all') {
        const taskTypeName = taskTypeMap.get(taskTypeId).name
        return acc.concat([taskTypeName, ''])
      } else {
        return acc
      }
    }, initialHeaders)
  },

  getStatReportsEntries(
    mainStats,
    taskTypeMap,
    taskStatusMap,
    entryMap,
    countMode = 'count',
    production
  ) {
    let entries = []
    const taskTypeIds = getStatsTaskTypeIds(mainStats, taskTypeMap, production)
    const entryIds = getStatsEntryIds(mainStats, entryMap)

    entryIds.forEach(entryId => {
      const taskStatusIds = getStatsTaskStatusIdsForEntry(mainStats, entryId)
      const total = getStatsTotalCount(
        mainStats,
        taskStatusIds,
        countMode,
        entryId
      )
      const lineMap = buildTotalLines(
        entryMap,
        taskStatusMap,
        countMode,
        mainStats,
        taskStatusIds,
        entryId,
        total
      )

      taskTypeIds.forEach(taskTypeId => {
        if (taskTypeId !== 'all') {
          const taskTypeStats = mainStats[entryId][taskTypeId]
          if (taskTypeStats) {
            const total = getStatsTotalEntryCount(
              mainStats,
              taskTypeStats,
              countMode,
              entryId,
              taskTypeId
            )
            addEntryStatusStats(
              mainStats,
              countMode,
              entryId,
              taskTypeId,
              taskStatusIds,
              total,
              lineMap
            )
          } else {
            Object.keys(mainStats[entryId].all).forEach(taskStatusId => {
              lineMap[taskStatusId] = lineMap[taskStatusId].concat(['', ''])
            })
          }
        }
      })

      entries = entries.concat(
        Object.values(lineMap).sort((a, b) => {
          return a[1].localeCompare(b[1], undefined, {
            numeric: true
          })
        })
      )
      entries.push([''])
    })
    return entries
  },

  generateRetakeStatReports(
    name,
    mainStats,
    taskTypeMap,
    taskStatusMap,
    entryMap,
    countMode,
    production
  ) {
    const headers = csv.getStatReportsHeaders(
      mainStats,
      taskTypeMap,
      production
    )
    const entries = csv.getRetakeStatReportsEntries(
      mainStats,
      taskTypeMap,
      taskStatusMap,
      entryMap,
      countMode,
      production
    )
    const lines = [headers, ...entries]
    return csv.buildCsvFile(name, lines)
  },

  getRetakeStatReportsEntries(
    mainStats,
    taskTypeMap,
    taskStatusMap,
    entryMap,
    countMode = 'count',
    production
  ) {
    let entries = []
    const taskTypeIds = getStatsTaskTypeIds(mainStats, taskTypeMap, production)
    const entryIds = getStatsEntryIds(mainStats, entryMap)

    entryIds.forEach(entryId => {
      const taskStatusIds = getStatsTaskStatusIdsForEntry(
        mainStats,
        entryId
      ).filter(s => !['max_retake_count', 'evolution'].includes(s))
      const total = getStatsTotalCount(
        mainStats,
        taskStatusIds,
        countMode,
        entryId
      )
      const lineMap = buildTotalLines(
        entryMap,
        taskStatusMap,
        countMode,
        mainStats,
        taskStatusIds,
        entryId,
        total
      )

      taskTypeIds.forEach(taskTypeId => {
        if (taskTypeId !== 'all') {
          const taskTypeStats = mainStats[entryId][taskTypeId]
          if (taskTypeStats) {
            const total = getStatsTotalEntryCount(
              mainStats,
              taskTypeStats,
              countMode,
              entryId,
              taskTypeId
            )
            addEntryStatusStats(
              mainStats,
              countMode,
              entryId,
              taskTypeId,
              taskStatusIds,
              total,
              lineMap
            )
          } else {
            Object.keys(mainStats[entryId].all).forEach(taskStatusId => {
              if (!['max_retake_count', 'evolution'].includes(taskStatusId)) {
                lineMap[taskStatusId] = lineMap[taskStatusId].concat(['', ''])
              }
            })
          }
        }
      })

      entries = entries.concat(Object.values(lineMap))
      entries.push([''])
    })
    return entries
  },

  generateQuotas(
    name,
    quotas,
    people,
    countMode,
    detailLevel,
    todayYear,
    todayMonth,
    year,
    month,
    week
  ) {
    const headers = csv.getTimesheetHeaders(
      {},
      detailLevel,
      todayYear,
      todayMonth,
      year,
      month,
      week
    )
    const entries = csv.getQuotaEntries(
      quotas,
      people,
      countMode,
      detailLevel,
      headers,
      year,
      month
    )
    csv.buildCsvFile(name, entries)
  },

  getQuotaEntries(
    quotas,
    people,
    countMode,
    detailLevel,
    headers,
    year,
    month
  ) {
    const entries = [headers]
    people.forEach(person => {
      const line = [person.full_name]
      headers.forEach((h, index) => {
        if (index > 0) {
          let key = year
          if (detailLevel === 'day') {
            key = `${year}-${String(month).padStart(2, '0')}-${String(index).padStart(2, '0')}`
          } else {
            key = `${year}-${String(index).padStart(2, '0')}`
          }
          if (
            quotas &&
            quotas[person.id] &&
            quotas[person.id][detailLevel][countMode][key]
          ) {
            line.push(quotas[person.id][detailLevel][countMode][key])
          } else {
            line.push('-')
          }
        }
      })
      entries.push(line)
    })
    return entries
  },

  processCSV: (data, config = {}) => {
    return new Promise((resolve, reject) => {
      // is path .csv
      if (data.name.endsWith('.xlsx')) {
        const reader = new FileReader()
        reader.onload = function (e) {
          const xlsx_data = e.target.result
          const workbook = XLSX.read(xlsx_data, { type: 'array' })
          const ws = workbook.Sheets[workbook.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
          resolve(data)
        }
        reader.readAsArrayBuffer(data)
      } else {
        Papa.parse(data, {
          encoding: 'UTF-8',
          error: reject,
          transform: value => value.trim(),
          complete: results => {
            results.data[0].forEach(stringHelpers.capitalize)
            resolve(results.data)
          },
          ...config
        })
      }
    })
  }
}

const getStatsTaskTypeIds = (mainStats, taskTypeMap, production) => {
  return Object.keys(mainStats.all)
    .filter(taskTypeId => taskTypeId !== 'evolution')
    .sort((a, b) => {
      if (a === 'all') return 1
      if (b === 'all') return -1
      const taskTypeA = taskTypeMap.get(a)
      const taskTypeB = taskTypeMap.get(b)
      const taskTypeAPriority = getTaskTypePriorityOfProd(taskTypeA, production)
      const taskTypeBPriority = getTaskTypePriorityOfProd(taskTypeB, production)
      if (taskTypeAPriority === taskTypeBPriority) {
        return taskTypeA.name.localeCompare(taskTypeB.name, undefined, {
          numeric: true
        })
      }
      return taskTypeAPriority - taskTypeBPriority
    })
}

const getStatsEntryIds = (mainStats, entryMap) => {
  return Object.keys(mainStats)
    .filter(entryId => entryId === 'all' || entryMap.get(entryId))
    .sort((a, b) => {
      if (a === 'all') return -1
      if (b === 'all') return 1
      return entryMap
        .get(a)
        .name.localeCompare(entryMap.get(b).name, undefined, {
          numeric: true
        })
    })
}

const getStatsTotalCount = (mainStats, taskStatusIds, countMode, entryId) => {
  let total = 0
  taskStatusIds.forEach(taskStatusId => {
    const taskStatusStats = mainStats[entryId].all[taskStatusId]
    total += taskStatusStats[countMode]
  })
  return total
}

const getStatsTaskStatusIdsForEntry = (mainStats, entryId) => {
  return Object.keys(mainStats[entryId].all)
}

const getStatsTotalEntryCount = (
  mainStats,
  taskTypeStats,
  countMode,
  entryId,
  taskTypeId
) => {
  let total = 0
  Object.keys(taskTypeStats).forEach(taskStatusId => {
    if (!['max_retake_count', 'evolution'].includes(taskStatusId)) {
      const taskStatusStats = mainStats[entryId][taskTypeId][taskStatusId]
      total += taskStatusStats[countMode]
    }
  })
  return total
}

const buildTotalLines = (
  entryMap,
  taskStatusMap,
  countMode,
  mainStats,
  taskStatusIds,
  entryId,
  total
) => {
  const lineMap = {}
  taskStatusIds.forEach(taskStatusId => {
    const taskStatus = taskStatusMap.get(taskStatusId)
    const taskStatusName = taskStatus ? taskStatus.name : taskStatusId
    const entry = entryMap.get(entryId)
    const name = entry ? entry.name : 'All'
    const taskStatusStats = mainStats[entryId].all[taskStatusId]
    const count = taskStatusStats[countMode]
    const percentage = getPercentage(count, total)
    lineMap[taskStatusId] = [
      name,
      taskStatusName,
      count || '0',
      `${percentage}%`
    ]
  })
  return lineMap
}

const addEntryStatusStats = (
  mainStats,
  countMode,
  entryId,
  taskTypeId,
  taskStatusIds,
  total,
  lineMap
) => {
  taskStatusIds.forEach(taskStatusId => {
    const taskStatusStats = mainStats[entryId][taskTypeId][taskStatusId]
    let count = 0
    if (taskStatusStats) count = taskStatusStats[countMode]
    const percentage = getPercentage(count, total)
    lineMap[taskStatusId] = lineMap[taskStatusId].concat([
      count || '0',
      `${percentage}%`
    ])
  })
}

export default csv
