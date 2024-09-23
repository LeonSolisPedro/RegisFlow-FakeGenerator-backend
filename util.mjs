import fs from "fs/promises"
const DELIMITER = '\n'
const READ_BUFFER_SIZE = 1000 // Must be greater than the record size

export async function readRandomLine(filepath, seedrandom) {
  const stats = await fs.stat(filepath)
  const handle = await fs.open(filepath, 'r')
  const randomPos = Math.floor(seedrandom() * stats.size)
  const buffer = Buffer.alloc(READ_BUFFER_SIZE)
  await handle.read(buffer, 0, READ_BUFFER_SIZE, randomPos)
  const xs = buffer.toString().split(DELIMITER)
  if (xs[2] !== undefined) {
    return xs[1]
  }
  return ""
}


export function scrambleWord(word, probability,methodScram) {
  return word.split("").map(word => {
    if (word === " ") return word
    if ((methodScram() * 10) < probability) return "X"
    return word
  }).join("")
}