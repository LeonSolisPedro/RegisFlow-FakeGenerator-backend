import express from "express"
import cors from "cors"
import seedrandom from "seedrandom";
import { body, query } from "express-validator"
import validation from "./validation.mjs"
import { readRandomLine, scrambleWord } from "./util.mjs";

const app = express();
app.use(cors());
app.use(express.json());


app.post("/api/generatedata", [
  query("seednumber").notEmpty().isNumeric(),
  query("totalperpage").default(20).isNumeric().toInt(),
  query("probability").notEmpty().isNumeric().isInt({ min: 0, max: 10 }).toInt(),
  query("region").notEmpty().isIn(["MXN"])
], validation, async (req, res) => {
  const { seednumber, totalperpage, probability, region } = req.query
  const method = seedrandom(seednumber, { state: true })
  const table = []
  for (let i of Array(totalperpage).keys()) {
    //idk what Am I doing
    const name = await readRandomLine(`dataset/${region}/names.csv`, method)
    const lastname = await readRandomLine(`dataset/${region}/lastnames.csv`, method)
    const city = await readRandomLine(`dataset/${region}/cities.csv`, method)
    const street = await readRandomLine(`dataset/${region}/streets.csv`, method)

    //actually beign used
    let fullname = `${name} ${lastname}`
    let address = `${city} ${street}`
    let phone = await readRandomLine(`dataset/${region}/phones.csv`, method)

    //Applying errors
    fullname = scrambleWord(fullname, probability,seedrandom(fullname))
    address = scrambleWord(address, probability,seedrandom(address))
    phone = scrambleWord(phone, probability,seedrandom(phone))

    table.push([1, 2, fullname, address, phone])
  }
  const response = {
    table,
    seeddata: method.state()
  }
  return res.status(200).json(response)
})



app.post("/api/continue", [
  body("seeddata").notEmpty(),
  query("totalperpage").default(10).isNumeric().toInt(),
  query("probability").notEmpty().isNumeric().isInt({ min: 0, max: 10 }).toInt(),
  query("region").notEmpty().isIn(["MXN"]),
], validation, async (req, res) => {
  const { seeddata } = req.body
  const { totalperpage, probability, region } = req.query
  const method = seedrandom("", { state: seeddata })
  const table = []
  for (let i of Array(totalperpage).keys()) {
    //idk what Am I doing
    const name = await readRandomLine(`dataset/${region}/names.csv`, method)
    const lastname = await readRandomLine(`dataset/${region}/lastnames.csv`, method)
    const city = await readRandomLine(`dataset/${region}/cities.csv`, method)
    const street = await readRandomLine(`dataset/${region}/streets.csv`, method)

    //actually beign used
    let fullname = `${name} ${lastname}`
    let address = `${city} ${street}`
    let phone = await readRandomLine(`dataset/${region}/phones.csv`, method)

    //Applying errors
    fullname = scrambleWord(fullname, probability,seedrandom(fullname))
    address = scrambleWord(address, probability,seedrandom(address))
    phone = scrambleWord(phone, probability,seedrandom(phone))

    table.push([1, 2, fullname, address, phone])
  }
  const response = {
    table,
    seeddata: method.state()
  }
  return res.status(200).json(response)
})


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
