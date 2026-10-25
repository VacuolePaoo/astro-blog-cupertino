import type { messages } from '../i18n/messages'

export type UiLocale = 'zh-CN' | 'en'
export type UiMessageKey = keyof (typeof messages)['zh-CN']
