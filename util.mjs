import fs from "fs/promises"
import seedrandom from "seedrandom";
import { v4 as uuidv4 } from "uuid"
const DELIMITER = '\n'
const READ_BUFFER_SIZE = 1000 // Must be greater than the record size

/*
 * https://stackoverflow.com/a/76759865/20961125
 */
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


export function scrambleWord(string, probability, methodScram) {
  return string.split("").map((word, i, arr) => {
    if (word === " ") return word
    if ((methodScram() * 10) < probability) {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      const randomItem = Math.floor(methodScram() * 3);
      if (randomItem === 0) return ""
      if (randomItem === 1) {
        const letter = Math.floor(methodScram() * alphabet.length);
        return alphabet[letter];
      }
      if (randomItem === 2) {
        // idk what I'm doing
        if (i > 0) { 
          let temp = arr[i];
          arr[i] = arr[i - 1];
          arr[i - 1] = temp;
          return arr[i];
        } else if (i < arr.length - 1) {
          let temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          return arr[i];
        }
      }
    }
    return word;
  }).join("");
}



export function generateUuid(method) {
  return uuidv4({
    random: Array.from({ length: 16 }, () => Math.floor(method() * 256))
  });
}


export async function generateTable(totalperpage, region, probability, method) {
  const table = []
  for (let i of Array(totalperpage).keys()) {
    //Reading
    const name = await readRandomLine(`dataset/${region}/names.txt`, method)
    const lastname = await readRandomLine(`dataset/${region}/lastnames.txt`, method)
    let fullname = `${name} ${lastname}`
    let address = await readRandomLine(`dataset/${region}/addresses.txt`, method)
    let phone = await readRandomLine(`dataset/${region}/phones.txt`, method)
    const uuid = generateUuid(seedrandom(fullname + address + phone))
    //Applying errors
    fullname = scrambleWord(fullname, probability, seedrandom(fullname))
    address = scrambleWord(address, probability, seedrandom(address))
    phone = scrambleWord(phone, probability, seedrandom(phone))
    table.push([uuid, fullname, address, phone])
  }
  return table;
}