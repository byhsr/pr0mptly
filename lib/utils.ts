import { clsx, type ClassValue } from 'clsx'
import { error, warn, info, debug, trace } from "@tauri-apps/plugin-log"
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export const log = {
  info: (msg: string, data?: unknown) =>
    info(data ? `${msg} ${JSON.stringify(data)}` : msg),

  warn: (msg: string, data?: unknown) =>
    warn(data ? `${msg} ${JSON.stringify(data)}` : msg),

  error: (msg: string, data?: unknown) =>
    error(data ? `${msg} ${JSON.stringify(data)}` : msg),

  debug: (msg: string, data?: unknown) =>
    debug(data ? `${msg} ${JSON.stringify(data)}` : msg),

  trace: (msg: string, data?: unknown) =>
    trace(data ? `${msg} ${JSON.stringify(data)}` : msg),
}