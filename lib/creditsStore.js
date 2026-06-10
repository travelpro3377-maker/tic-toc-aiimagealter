import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const CREDITS_FILE = path.join(DATA_DIR, 'credits.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const PROCESSED_FILE = path.join(DATA_DIR, 'processedEvents.json')

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
  if (!fs.existsSync(CREDITS_FILE)) fs.writeFileSync(CREDITS_FILE, JSON.stringify({}), 'utf8')
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]), 'utf8')
  if (!fs.existsSync(PROCESSED_FILE)) fs.writeFileSync(PROCESSED_FILE, JSON.stringify({}), 'utf8')
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8') || '{}')
  } catch (e) {
    return {}
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
}

export async function addCreditsForUser(userId, credits, meta = {}) {
  await ensureDataDir()
  const all = readJson(CREDITS_FILE)
  const current = all[userId] || { credits: 0, history: [] }
  current.credits = (current.credits || 0) + credits
  current.history = current.history || []
  current.history.push({ credits, meta, ts: Date.now() })
  all[userId] = current
  writeJson(CREDITS_FILE, all)
  return current
}

export async function getCredits(userId) {
  await ensureDataDir()
  const all = readJson(CREDITS_FILE)
  return all[userId] || { credits: 0, history: [] }
}

export async function saveOrder(order) {
  await ensureDataDir()
  let arr = readJson(ORDERS_FILE)
  if (!Array.isArray(arr)) arr = []
  arr.push(order)
  writeJson(ORDERS_FILE, arr)
  return order
}

export async function isEventProcessed(eventId) {
  await ensureDataDir()
  const processed = readJson(PROCESSED_FILE)
  return !!processed[eventId]
}

export async function markEventProcessed(eventId) {
  await ensureDataDir()
  const processed = readJson(PROCESSED_FILE)
  processed[eventId] = { ts: Date.now() }
  writeJson(PROCESSED_FILE, processed)
  return true
}
