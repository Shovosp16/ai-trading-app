const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

const { calculateIndicators } = require("./indicators")
const { trainAI, predictAI } = require("./aiModel")

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))

let livePrice = 30000
let tradeHistory = []

// Binance HTTP price fetch (stable)
async function updatePrice() {
  try {
    const res = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    )
    const data = await res.json()
    livePrice = parseFloat(data.price)
  } catch (e) {
    console.log("Price fetch failed")
  }
}

setInterval(updatePrice, 3000)

// API Endpoint
app.get("/data", async (req, res) => {

  const indicators = calculateIndicators(livePrice)

  // Light AI training (low CPU)
  if (Math.random() < 0.25) {
    await trainAI(indicators)
  }

  const ai = predictAI(indicators)

  if (ai.signal !== "SKIP") {
    tradeHistory.push({
      time: Date.now(),
      signal: ai.signal,
      price: livePrice
    })
  }

  res.json({
    price: livePrice,
    ...indicators,
    signal: ai.signal,
    confidence: ai.confidence
  })

})

// Trade history API
app.get("/history", (req, res) => {
  res.json(tradeHistory)
})

// Railway PORT Fix
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})