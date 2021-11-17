//環境變數
var updateFPS = 30
var showMouse = true
var time = 0
var bgColor = '#eee'


//控制
var controls = {
  play05x: function(){
    cd.angleSpeed = 0.5
    controls.fade = 1
  },
  play1x: function(){
    cd.angleSpeed = 1
    controls.fade = 1
  },
  play2x: function(){
    cd.angleSpeed = 2
    controls.fade = 1
  },
  fade: 0.98
}
var gui = new dat.GUI()
gui.add(controls,'play05x')
gui.add(controls,'play1x')
gui.add(controls,'play2x')
gui.add(controls,'fade',0.6,1,0.001).listen()

//---------------------------------------------
// Vec2
class Vec2{
  constructor(x,y){
    this.x = x
    this.y= y
  }
  set(x,y){
    this.x = x
    this.y = y
  }
  move(x,y){
    this.x += x
    this.y += y
  } 
  add(v){
    return new Vec2(this.x+v.x,this.y+v.y)
  }  
  sub(v){
    return new Vec2( this.x-v.x,this.y-v.y)
  } 
  mul(s){
    return new Vec2( this.x*s,this.y*s)
  } 
  get length(){
    return Math.sqrt(this.x*this.x+this.y*this.y)
  }
  set length(nv){
    let temp = this.unit.mul(nv)
    this.set(temp.x,temp.y)
  }
  clone(){ //回傳一個新的向量
    return new Vec2(this.x,this.y)
  }
  toString(){
    return `(${this.x}, ${this.y})`
  }
  equal(v){
    return this.x == v.x && this.y == v.y
  }
  get angle(){
    return Math.atan2(this.y,this.x)
  }
  get unit(){ //取得單位向量
    return this.mul(1/this.length)
  }
}
var a = new Vec2(3,4)
//---------------------------------------------

var player = $('#musicBg')[0]
player.volume = 0.3

var canvas = document.getElementById('mycanvas')
var ctx = canvas.getContext('2d')

ctx.circle = function(v,r){
  this.arc(v.x,v.y,r,0,Math.PI*2)
}

ctx.line = function(v1,v2){
  this.moveTo(v1.x,v1.y)
  this.lineTo(v2.x,v2.y)
}

//canvas設定
function initCanvas(){
  ww = canvas.width = window.innerWidth
  wh = canvas.height = window.innerHeight
}
initCanvas()


class CD{
  constructor(args){
    let def = {
      r: 400,
      p: new Vec2(0,0),
      angle: 0,
      angleSpeed: 5, //每次更新加多少角度
      dragging: false //拖曳狀態
    }
    Object.assign(def,args)
    Object.assign(this,def)
  }
  draw(){
    ctx.save()
      ctx.rotate(this.angle)
      function circle(p,r,fillColor,strokeColor){
        ctx.beginPath()
        ctx.arc(p.x,p.y,r,0,Math.PI*2)
        if(fillColor){
          ctx.fillStyle = fillColor
          ctx.fill()
        }
        if(strokeColor){
          ctx.strokeStyle = strokeColor
          ctx.stroke()
        }
      }
    ctx.shadowBlur = 100
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    circle(this.p,this.r,'black') //外圍黑色
    ctx.shadowBlur = 0 //記得歸0
    
    
    circle(this.p,150,"#c42929") //紅色部分
    let img = $('img')[0]
    ctx.globalCompositeOperation = 'color-burn'
    ctx.drawImage(img,-this.r/2,-this.r/2)
    ctx.globalCompositeOperation = 'source-over'
    
    ctx.lineWidth = 10
    circle(this.p,130,null,"#ffd760")
    circle(this.p,40,"black")
    circle(this.p,15,"#ddd")
    ctx.lineWidth = 1
    
    for(var i = 0 ; i < 40; i++){
      circle(this.p,i*this.r/40,null,"rgba(255,255,255,"+(i%5)/20+")") //0-5個 除於20
    }
    
    for(var i = 0; i<10; i++){
      ctx.beginPath()
        let start_angle = i*Math.PI/10
        let end_angle = start_angle + this.angleSpeed
        let opacity = i*Math.abs(this.angleSpeed)/30+0.1
        ctx.arc(this.p.x,this.p.y,i*this.r/10,start_angle,end_angle)
        ctx.strokeStyle ='rgba(255,255,255,'+ opacity +')'
      ctx.stroke()
    }
    ctx.restore()
  }
  update(){
    this.angle += this.angleSpeed * Math.PI/4
    this.angleSpeed *= controls.fade
  }
}

var cd

//物件邏輯初始化
function init(){
  cd = new CD
}


//遊戲邏輯更新
function update(){
  time++
  cd.update()
  
  if(mousePosDown){ //剛開始沒有被記錄 就不會進到這判斷式裡面
    if(!cd.lastAngle){ //如果cd沒有紀錄上一個角度 //可能是第一次點按
      cd.lastAngle = cd.angle
    }
    cd.dragging = true
    let delta = mousePos.sub(new Vec2(ww/2,wh/2)).angle - mousePosDown.sub(new Vec2(ww/2,wh/2)).angle
    // console.log(delta)
    cd.angle = cd.lastAngle + delta
    cd.angleSpeed = delta  //angleSpeed = 最後的速度 點唱盤之前的速度
  } else {
    cd.lastAngle = null
  }
  if(mousePos.sub(new Vec2(ww/2,wh/2)).length < cd.r){
    $('canvas').css('cursor','pointer')
  } else {
    $('canvas').css('cursor','initial')
  }
  
  
  //angleSpee = -10 ~ 10
  // playSpeed = 0.1 ~ 5
  //音樂速度最小是0.1 如果是0<=的話會出錯
  
  //所以用Math.abs取絕對值
 var cur = Math.abs(cd.angleSpeed)
  var volume = Math.sqrt(Math.abs(cd.angleSpeed))/3 //大概是0-3之間
  if(volume > 1) {volume = 1}
  if(cur > 0 && cur < 0.1){
    cur = 0.1
  }
  player.playbackRate = cur
  player.volume = volume
}



//畫面更新
function draw(){
  //清空背景
  ctx.fillStyle = bgColor
  ctx.fillRect(0,0,ww,wh)
  
  //---------------------------
  //在這裡繪製
  
  ctx.save()
    ctx.translate(ww/2,wh/2)
    cd.draw()
  ctx.restore()
  
  //---------------------------
  //滑鼠
  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.circle(mousePos,3)
  ctx.fill()
  
  ctx.save()
    ctx.beginPath()
    ctx.translate(mousePos.x,mousePos.y)
    ctx.strokeStyle = 'red'
    let len = 20
    ctx.line(new Vec2(-len,0),new Vec2(len,0))
    ctx.fillText(mousePos,10,-10)
    ctx.rotate(Math.PI/2)
    ctx.line(new Vec2(-len,0),new Vec2(len,0))
    ctx.stroke()
  ctx.restore()
  
  requestAnimationFrame(draw)
}

//當頁面載入完成後呼叫
function loaded(){
  initCanvas()
  init()
  requestAnimationFrame(draw)
  setInterval(update,1000/updateFPS)
}

//載入 縮放的事件
window.addEventListener('load',loaded)
window.addEventListener('resize',initCanvas)


//滑鼠事件跟紀錄
var mousePos = new Vec2(0,0)
var mousePosDown = null //不用new Vec2(0,0) 的原因是因為這樣就不會記錄一點進去就是0,0的位置 他就會自己轉
var mousePosUp = new Vec2(0,0)
window.addEventListener('mousemove',mousemove)
window.addEventListener('mouseup',mouseup)
window.addEventListener('mousedown',mousedown)
function mousemove(e){
  mousePos.set(e.x,e.y)
  // console.log(mousePos)
}
function mouseup(e){
  mousePos.set(e.x,e.y)
  mousePosUp = mousePos.clone()
  mousePosDown = null
}
function mousedown(e){
  mousePos.set(e.x,e.y)
  mousePosDown = mousePos.clone()
  player.play()
}