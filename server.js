const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require("path")

// fetch for Binance API
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

const { calculateIndicators } = require("./indicators")
const { trainAI, predictAI } = require("./aiModel")

const app = express()

// Middlewares
app.use(cors())
app.use(bodyParser.json())

// Static public folder (IMPORTANT)
app.use(express.static(path.join(__dirname, "public")))

// ROOT FIX (Cannot GET / solution)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// ================================
// LIVE PRICE ENGINE (BINANCE HTTP)
// ================================

let livePrice = 30000
let tradeHistory = []

async function updatePrice() {
  try {
    const response = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    )

    const data = await response.json()

    livePrice = parseFloat(data.price)

  } catch (err) {
    console.log("Binance API error")
  }
}

// Update price every 3 seconds
setInterval(updatePrice, 3000)

// ================================
// MAIN DATA API
// ================================

app.get("/data", async (req, res) => {

  const indicators = calculateIndicators(livePrice)

  // Light AI training (cloud safe)
  if (Math.random() < 0.25) {
    await trainAI(indicators)
  }

  const ai = predictAI(indicators)

  // Save trade history
  if (ai.signal !== "SKIP") {
    tradeHistory.push({
      time: Date.now(),
      signal: ai.signal,
      price: livePrice
    })
  }

  res.json({
    price: livePrice,
    rsi: indicators.rsi,
    ema12: indicators.ema12,
    ema26: indicators.ema26,
    macd: indicators.macd,
    signal: ai.signal,
    confidence: ai.confidence
  })

})

// ================================
// TRADE HISTORY API
// ================================

app.get("/history", (req, res) => {
  res.json(tradeHistory)
})

// ================================
// SERVER START (RAILWAY SAFE)
// ================================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on port:", PORT)
})