const tf=require("@tensorflow/tfjs-node")

let model

async function init(){

 model=tf.sequential()

 model.add(tf.layers.dense({units:16,inputShape:[3],activation:"relu"}))
 model.add(tf.layers.dense({units:8,activation:"relu"}))
 model.add(tf.layers.dense({units:1,activation:"sigmoid"}))

 model.compile({
  optimizer:"adam",
  loss:"meanSquaredError"
 })
}

init()

exports.trainAI=async(data)=>{

 const xs=tf.tensor2d([[data.rsi,data.macd,data.ema12]])
 const ys=tf.tensor2d([[data.price>30000?1:0]])

 await model.fit(xs,ys,{epochs:1})

}

exports.predictAI=(ind)=>{

 const input=tf.tensor2d([[ind.rsi,ind.macd,ind.ema12]])
 const out=model.predict(input)

 const v=out.dataSync()[0]

 let signal="SKIP"

 if(v>0.7) signal="BUY"
 if(v<0.3) signal="SELL"

 return {
  signal,
  confidence:Math.round(v*100)
 }
}