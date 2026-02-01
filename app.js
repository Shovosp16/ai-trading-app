const indBox = document.getElementById("indicators")
const signalBox = document.getElementById("signal")

const chart = LightweightCharts.createChart(
  document.getElementById("chart"),
  {
    width: window.innerWidth - 30,
    height: 300,
    layout: {
      background: { color: "#0d1117" },
      textColor: "#fff"
    }
  }
)

const candleSeries = chart.addCandlestickSeries()
const emaSeries = chart.addLineSeries({ lineWidth: 2 })

let candles = []

async function load() {

  const res = await fetch("/data")
  const d = await res.json()

  const t = Math.floor(Date.now() / 1000)

  candles.push({
    time: t,
    open: d.price - 30,
    high: d.price + 60,
    low: d.price - 60,
    close: d.price
  })

  if (candles.length > 50) candles.shift()

  candleSeries.setData(candles)

  emaSeries.setData(candles.map(c => ({
    time: c.time,
    value: d.ema12
  })))

  indBox.innerHTML =
    "RSI: " + d.rsi.toFixed(2) + "<br>" +
    "MACD: " + d.macd.toFixed(2)

  signalBox.innerHTML = d.signal + " " + d.confidence + "%"
}

setInterval(load, 3000)