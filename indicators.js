let prices=[]

function EMA(period,data){
 const k=2/(period+1)
 let ema=data[0]
 data.forEach(p=>{
  ema=p*k+ema*(1-k)
 })
 return ema
}

function RSI(data){
 let gain=0,loss=0
 for(let i=1;i<data.length;i++){
  let d=data[i]-data[i-1]
  if(d>0) gain+=d
  else loss+=Math.abs(d)
 }
 let rs=gain/(loss||1)
 return 100-(100/(1+rs))
}

exports.calculateIndicators=(price)=>{

 prices.push(price)
 if(prices.length>60) prices.shift()

 const rsi=RSI(prices)
 const ema12=EMA(12,prices)
 const ema26=EMA(26,prices)
 const macd=ema12-ema26

 return {rsi,ema12,ema26,macd}
}