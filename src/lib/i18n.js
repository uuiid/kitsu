import { createI18n } from 'vue-i18n'

import locales from '@/locales'

const i18n = new createI18n({
  legacy: true,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: locales
})

export default i18n
