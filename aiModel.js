const tf = require("@tensorflow/tfjs")

let model

async function init() {

  model = tf.sequential()

  model.add(tf.layers.dense({ units: 8, inputShape: [3], activation: "relu" }))
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }))

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError"
  })
}

init()

exports.trainAI = async (d) => {

  const xs = tf.tensor2d([[d.rsi, d.macd, d.ema12]])
  const ys = tf.tensor2d([[d.rsi < 50 ? 1 : 0]])

  await model.fit(xs, ys, { epochs: 1 })

}

exports.predictAI = (ind) => {

  const input = tf.tensor2d([[ind.rsi, ind.macd, ind.ema12]])
  const output = model.predict(input)

  const value = output.dataSync()[0]

  let signal = "SKIP"

  if (value > 0.65) signal = "BUY"
  if (value < 0.35) signal = "SELL"

  return {
    signal,
    confidence: Math.round(value * 100)
  }
}