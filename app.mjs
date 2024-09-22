import express from "express"
import cors from "cors"
import seedrandom from "seedrandom";
import { body,query } from "express-validator"
import validation from "./validation.mjs"

const app = express();
app.use(cors());
app.use(express.json());


app.get("/api/generatedata", [
  query("seednumber").notEmpty().isNumeric(),
  query("totalperpage").default(20).isNumeric().toInt(),
  query("probability").notEmpty().isNumeric().isInt({ min: 0, max: 10 }).toInt(),
  query("region").notEmpty().isIn(["MXN"])
], validation, (req, res) => {
  const { seednumber, totalperpage, probability, region } = req.query
  const method = seedrandom(seednumber, {state: true})
  const table = []
  for (let i of Array(totalperpage).keys()) {
    table.push([method(),method(),method(),method(),method()])
  }
  const response = {
    table,
    seeddata: method.state()
  }
  return res.status(200).json(response)
})



app.get("/api/continue", [
  body("seeddata").notEmpty(),
  query("totalperpage").default(10).isNumeric().toInt(),
  query("probability").notEmpty().isNumeric().isInt({ min: 0, max: 10 }).toInt(),
  query("region").notEmpty().isIn(["MXN"]),
], validation, (req, res) => {
  const { seeddata } = req.body
  const { totalperpage, probability, region } = req.query
  const method = seedrandom("", {state: seeddata})
  const table = []
  for (let i of Array(totalperpage).keys()) {
    table.push([method(),method(),method(),method(),method()])
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
