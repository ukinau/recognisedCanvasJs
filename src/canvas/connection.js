ConnectionBaseCanvas = function(){
  this.begin_possition = [] // [x, y]
  this.end_possition = [] // [x, y]
  this.globalAlpha = null
  this.strokeStyle = null
  this.lineWidth = null
  this.z_index = 99 //TODO temporally max higher value
}

ConnectionBaseCanvas.prototype.calculate = function(){
}
ConnectionBaseCanvas.prototype.ctx_stash = function(ctx){
  stash = {}
  stash.globalAlpha = ctx.globalAlpha
  stash.lineWidth = ctx.lineWidth
  stash.strokeStyle = ctx.strokeStyle
  stash.fillStyle = ctx.fillStyle
  return stash
}
ConnectionBaseCanvas.prototype.ctx_reset = function(ctx, stash){
  ctx.globalAlpha = stash.globalAlpha
  ctx.lineWidth = stash.lineWidth
  ctx.strokeStyle = stash.strokeStyle
  ctx.fillStyle = stash.fillStyle
}

ConnectionBaseCanvas.prototype.draw = function(ctx){
  stashed = this.ctx_stash(ctx)
  ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
  ctx.strokeStyle = this.strokeStyle

  ctx.beginPath()
  ctx.moveTo(this.begin_possition[0],
             this.begin_possition[1])
  ctx.lineTo(this.end_possition[0],
             this.end_possition[1])
  ctx.stroke()
  this.ctx_reset(ctx, stashed)
}
ConnectionBaseCanvas.prototype.collision_detect = function(x, y){
  return false
}

ArrowConnection = function(){
  ConnectionBaseCanvas.call(this)
  this.arrow_width = 5
  this.arrow_height = 10
}

ArrowConnection.prototype.draw = function(ctx){
  this.end_possition[0] = Number(this.end_possition[0])
  this.end_possition[1] = Number(this.end_possition[1])
  var left_possitions = []
  var original_end_possition = this.end_possition
  this.end_possition = []

  arrowPos(this.begin_possition, original_end_possition,
           0, this.arrow_height, left_possitions, [])
  this.end_possition[0] = Number(left_possitions[0])
  this.end_possition[1] = Number(left_possitions[1])
  ConnectionBaseCanvas.prototype.draw.call(this, ctx)
  this.end_possition = original_end_possition
  this.draw_arrow(ctx)
}

ArrowConnection.prototype.draw_arrow = function(ctx){
  var left_possitions = []
  var right_possitions = []
  stashed = this.ctx_stash(ctx)
  ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
  ctx.strokeStyle = this.strokeStyle
  ctx.fillStyle = this.strokeStyle

  arrowPos(this.begin_possition, this.end_possition,
           this.arrow_width, this.arrow_height,
           left_possitions, right_possitions)

  ctx.moveTo(this.end_possition[0], this.end_possition[1])
  ctx.lineTo(left_possitions[0], left_possitions[1])
  ctx.lineTo(right_possitions[0], right_possitions[1])
  ctx.fill()
  this.ctx_reset(ctx, stashed)
}
inherits(ArrowConnection, ConnectionBaseCanvas)


var ArrowConnectionWithTitle = function(name){
  ArrowConnection.call(this)
  this.title = new TextCanvasModel(name)
  this.title_seed_possition = randomNum(1.4, 3)
}
ArrowConnectionWithTitle.prototype.draw = function(ctx){
  this.end_possition[0] = Number(this.end_possition[0])
  this.end_possition[1] = Number(this.end_possition[1])
  this.begin_possition[0] = Number(this.begin_possition[0])
  this.begin_possition[1] = Number(this.begin_possition[1])
  var original_end_possition = this.end_possition
  var original_begin_possition = this.begin_possition
  var half_vector = vectorDividedBy(this.begin_possition,
                                    this.end_possition, this.title_seed_possition)
  var middle_end_possition = addVector(this.begin_possition, half_vector)
  var m_minus_character = subtractedVector(this.begin_possition,
                                           middle_end_possition,
                                           13, this.begin_possition)
  var m_plus_character = extendVector(this.begin_possition,
                                   middle_end_possition, 13,
                                   this.end_possition)
  this.end_possition = m_minus_character
  ConnectionBaseCanvas.prototype.draw.call(this, ctx)
  this.begin_possition = m_plus_character
  this.end_possition = original_end_possition
  ArrowConnection.prototype.draw.call(this, ctx)

  this.title.possitionY = middle_end_possition[1] + 3 //Adjustment
  var m_left = this.title.get_px_width()/2
  this.title.possitionX = middle_end_possition[0] - m_left
  this.title.z_index = this.z_index
  this.title.draw(ctx)
}

inherits(ArrowConnectionWithTitle, ArrowConnection)
