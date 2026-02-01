let prices = []

function EMA(period, data) {
  const k = 2 / (period + 1)
  let ema = data[0]

  data.forEach(p => {
    ema = p * k + ema * (1 - k)
  })

  return ema
}

function RSI(data) {
  let gain = 0
  let loss = 0

  for (let i = 1; i < data.length; i++) {
    let diff = data[i] - data[i - 1]
    if (diff > 0) gain += diff
    else loss += Math.abs(diff)
  }

  let rs = gain / (loss || 1)
  return 100 - (100 / (1 + rs))
}

exports.calculateIndicators = (price) => {

  prices.push(price)

  if (prices.length > 50) prices.shift()

  const rsi = RSI(prices)
  const ema12 = EMA(12, prices)
  const ema26 = EMA(26, prices)
  const macd = ema12 - ema26

  return { rsi, ema12, ema26, macd }
}