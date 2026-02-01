const express=require("express")
const cors=require("cors")
const bodyParser=require("body-parser")
const WebSocket=require("ws")

const {calculateIndicators}=require("./indicators")
const {trainAI,predictAI}=require("./aiModel")

const app=express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))

let livePrice=0
let tradeHistory=[]

const binance=new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade")

binance.onmessage=(msg)=>{
 const data=JSON.parse(msg.data)
 livePrice=parseFloat(data.p)
}

app.get("/data",async(req,res)=>{

 if(!livePrice) livePrice=30000

 const indicators=calculateIndicators(livePrice)

 await trainAI({
  ...indicators,
  price:livePrice
 })

 const ai=predictAI(indicators)

 if(ai.signal!=="SKIP"){
  tradeHistory.push({
   time:Date.now(),
   signal:ai.signal,
   price:livePrice
  })
 }

 res.json({
  price:livePrice,
  ...indicators,
  signal:ai.signal,
  confidence:ai.confidence
 })

})

app.get("/history",(req,res)=>{
 res.json(tradeHistory)
})

const PORT=process.env.PORT||3000
app.listen(PORT,()=>console.log("Running on",PORT))