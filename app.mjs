import express from "express"
import cors from "cors"
import seedrandom from "seedrandom";
import { body, query } from "express-validator"
import validation from "./validation.mjs"
import { generateTable } from "./util.mjs";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generatedata", [
  query("seednumber").notEmpty().isNumeric(),
  query("totalperpage").default(20).isNumeric().toInt(),
  query("probability").notEmpty().isNumeric().isFloat({ min: 0, max: 10 }).toFloat(),
  query("region").notEmpty().isIn(["MXN", "USA", "ITA"])
], validation, async (req, res) => {
  const { seednumber, totalperpage, probability, region } = req.query
  const method = seedrandom(seednumber, { state: true })
  const table = await generateTable(totalperpage, region, probability, method)
  const response = {
    table,
    seeddata: method.state()
  }
  return res.status(200).json(response)
})

app.post("/api/continue", [
  body("seeddata").notEmpty(),
  query("totalperpage").default(10).isNumeric().toInt(),
  query("probability").notEmpty().isNumeric().isFloat({ min: 0, max: 10 }).toFloat(),
  query("region").notEmpty().isIn(["MXN", "USA", "ITA"])
], validation, async (req, res) => {
  const { seeddata } = req.body
  const { totalperpage, probability, region } = req.query
  const method = seedrandom("", { state: seeddata })
  const table = await generateTable(totalperpage, region, probability, method)
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