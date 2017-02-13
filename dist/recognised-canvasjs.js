var BaseCanvasModel = function(){
  this.possitionX = 0;
  this.possitionY = 0;
  this.width = 0; 
  this.height = 0; 
  this.z_index = 0;
  this.z_index_fixed = false;
}
BaseCanvasModel.prototype.get_possitionX_end = function(){
  return this.possitionX + this.width
}
BaseCanvasModel.prototype.get_possitionY_end = function(){
  return this.possitionY + this.height
}
BaseCanvasModel.prototype.collision_detect = function(x,y){
  if (this.possitionX < x && x < this.possitionX + this.width){
    if (this.possitionY < y && y < this.possitionY + this.height){
      return true
    }
  }
  return false
}

BaseCanvasModel.prototype.ctx_stash = function(ctx){
  stash = {}
  stash.globalAlpha = ctx.globalAlpha
  stash.lineWidth = ctx.lineWidth
  stash.strokeStyle = ctx.strokeStyle
  stash.fillStyle = ctx.fillStyle
  stash.font = ctx.font
  return stash
}
BaseCanvasModel.prototype.ctx_reset = function(ctx, stash){
  ctx.globalAlpha = stash.globalAlpha
  ctx.lineWidth = stash.lineWidth
  ctx.strokeStyle = stash.strokeStyle
  ctx.fillStyle = stash.fillStyle
  ctx.font = stash.font
}
;ConnectionBaseCanvas = function(){
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
;var SquareWithTitle = function(text, options){
  BaseCanvasModel.call(this)

  this.color = 'rgb(155, 187, 89)'
  this.globalAlpha = 1.0
  this.radius = 15
  this.lineWidth = 3
  this.lineColor = '#000000' //'rgb(0, 0, 0)'
  this.lineFlag = false // line is needed or not
  this.title = new TextCanvasModel(text)
  this.title_vertical_align = "center" //"center" or "bottom"

  if(options){
    var d_option_list = [["x", "possitionX"], ["y", "possitionY"],
                       ["width", "width"], ["height", "height"],
                       ["color", "color"], ["globalAlpha", "globalAlpha"]]
    for(var i=0; i<d_option_list.length; i++){
      if(typeof(options[d_option_list[i][0]])!="undefined"){
        this[d_option_list[i][1]] = options[d_option_list[i][0]]
      }
    }
    var text_option_list = [["text-color", "color"], ["text-font", "font"],
                            ["text-globalAlpha", "globalAlpha"], ["text-is_bold", "is_bold"]]
    for(var i=0; i<text_option_list.length; i++){
      if(typeof(options[text_option_list[i][0]])!="undefined"){
        this.title[text_option_list[i][1]] = options[text_option_list[i][0]]
      }
    }
  }
}
SquareWithTitle.prototype.calculate = function(){
  // center align
  var blank = this.width - this.title.get_px_width()
  var m_left = 0
  if(blank > 0){ m_left = blank/2 }
  this.title.possitionX = this.possitionX + m_left

  var m_top = null
  if(this.title_vertical_align == 'top'){
      //Texbox possitionY is based on the bottom of chaacter
      //    ----- <- not possitionY
      //      |
      //      | <- possitonY
      m_top = this.title.get_px_height()
  }else if(this.title_vertical_align == 'center'){
      m_top = (this.height - this.title.get_px_height())/2
      if(m_top < 0){ m_top = 0 }
      m_top += this.title.get_px_height()
  }else{
                              //Adjustment
      m_top = this.height - this.title.get_px_height()/4
  }
  this.title.possitionY = this.possitionY + m_top
  this.title.z_index = this.z_index
}
SquareWithTitle.prototype.draw = function(ctx){
  // draw square
  var tmp_globalAlpha = ctx.globalAlpha
  var tmp_lineWidth = ctx.lineWidth
  var tmp_fillStyle = ctx.fillStyle
  var tmp_strokeStyle = ctx.strokeStyle

  ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
  ctx.strokeStyle = this.lineColor
  ctx.fillStyle = this.color
  //ctx.fillRect(this.possitionX, this.possitionY, this.width, this.height)
  // Rounded square
  ctx.beginPath();
  ctx.moveTo(this.possitionX+this.radius, this.possitionY);
  ctx.lineTo(this.possitionX+this.width - this.radius, this.possitionY);
  ctx.quadraticCurveTo(this.possitionX+this.width, this.possitionY,
                       this.possitionX+this.width, this.possitionY+this.radius);

  ctx.lineTo(this.possitionX+this.width,
             this.possitionY+this.height-this.radius);
  ctx.quadraticCurveTo(this.possitionX+this.width,
                       this.possitionY+this.height,
                       this.possitionX+this.width-this.radius,
                       this.possitionY+this.height);
  ctx.lineTo(this.possitionX+this.radius, this.possitionY+this.height);
  ctx.quadraticCurveTo(this.possitionX, this.possitionY+this.height,
                       this.possitionX, this.possitionY+this.height-this.radius);
  ctx.lineTo(this.possitionX, this.possitionY+this.radius);
  ctx.quadraticCurveTo(this.possitionX, this.possitionY,
                       this.possitionX+this.radius, this.possitionY);
  ctx.fill();
  if(this.lineFlag){
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0
  this.calculate()
  this.title.draw(ctx)
  ctx.globalAlpha = tmp_globalAlpha
  ctx.lineWidth = tmp_lineWidth
  ctx.fillStyle = tmp_fillStyle
  ctx.strokeStyle = tmp_strokeStyle
}

SquareWithTitle.prototype.get_aspects = function(){
  results = {
    "right":{
      "begin":{"x":this.get_possitionX_end(), "y":this.possitionY},
      "end":{"x":this.get_possitionX_end(), "y":this.get_possitionY_end()}
      //TODO formula for calculating the connecting point like followings
      //{"x": function(x, sp){return x}, "y": function(y, sp){return y + sp }}
    },
    "left":{
      "begin":{"x": this.possitionX, "y":this.possitionY},
      "end": {"x": this.possitionX, "y": this.get_possitionY_end()}
    },
    "top":{
      "begin":{"x": this.possitionX, "y":this.possitionY},
      "end": {"x": this.get_possitionX_end(), "y":this.possitionY}
    },
    "down":{
      "begin": {"x": this.possitionX, "y": this.get_possitionY_end()},
      "end": {"x": this.get_possitionX_end(), "y": this.get_possitionY_end()}
    }
  }
  return results
}
inherits(SquareWithTitle, BaseCanvasModel)



//TODO
//this class is a little special to need the context of canvas
//because need to calculate the point to start new line
//Textbox Square
var TextboxSquare = function(ctx, text){
  SquareWithTitle.call(this, text)
  this.lines = 0
  this.text_turned = [] //TextCanvas
  this.ctx = ctx
  this.text = this.title
  this.text_margin_left = 5
  this.text_margin_top = 3
  this.text_init_margin_top = 20
}

TextboxSquare.prototype.draw = function(ctx){
  var tmp_globalAlpha = ctx.globalAlpha
  var tmp_lineWidth = ctx.lineWidth
  var tmp_fillStyle = ctx.fillStyle
  ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
  ctx.fillStyle = this.color

  ctx.fillRect(this.possitionX, this.possitionY, this.width, this.height)
  ctx.strokeRect(this.possitionX, this.possitionY, this.width, this.height)

  ctx.globalAlpha = 1.0
  this.calculate()
  for(var i=0; i<this.text_turned.length; i++){
    this.text_turned[i].draw(ctx)
  }
  ctx.globalAlpha = tmp_globalAlpha
  ctx.lineWidth = tmp_lineWidth
  ctx.fillStyle = tmp_fillStyle
}

TextboxSquare.prototype.calculate = function(){
  this.text.possitionX = this.possitionX + this.text_margin_left
  this.text.possitionY = this.possitionY + this.text_init_margin_top
  this.text.z_index = this.z_index
  this.calculate_turned_text()
  var lines = 0
  var height = 0
  for(var i=1; i<this.text_turned.length; i++){
    if(this.text_turned[i-1].returned){
      this.text_turned[i].possitionY = this.text_turned[i].get_px_height() + this.text_turned[i-1].possitionY
    }else{
      this.text_turned[i].possitionY = this.text_turned[i-1].possitionY
      tmp_font = this.ctx.font
      this.ctx.font = this.text_turned[i].font
      str = ""
      for(var j=1;j<this.text_turned.length; j++){
        if(this.text_turned[i-j].returned){break}
        str += this.text_turned[i-j].content
      }
      this.text_turned[i].possitionX += this.ctx.measureText(str).width
      this.ctx.font = tmp_font
    }
  }
}

TextboxSquare.prototype.calculate_turned_text = function(){
  this.lines = 0
  this.text_turned = [this.create_copy_of(this.text, "")]

  var temp_font = this.ctx.font
  this.ctx.font = this.text.font
  var color_stack = [this.text_turned[0].color]
  var font_stack = [this.text_turned[0].font]
  var previous_not_returned_line = ""

  for(var i=0; i<this.text.content.length; i++){
    var chara = this.text.content.charAt(i)
    parsed = false
    if(chara == '<'){
      parsed = get_metacode(this.text.content, i)
      if(parsed.found){
        switch(parsed.value.name){
          case "color":
            if(parsed.value.eot){color_stack.pop()}
            else{color_stack.push(parsed.value.value)}
            break
          case "font":
            if(parsed.value.eot){font_stack.pop()}
            else{font_stack.push(parsed.value.value)}
            break
        }
        i = parsed.value.next_char - 1
      }
    }

    if(parsed && parsed.found){
      this.lines++
      this.text_turned[this.lines] = this.create_copy_of(this.text, "")
      this.text_turned[this.lines].color = color_stack[color_stack.length-1]
      this.text_turned[this.lines].font = font_stack[font_stack.length-1]
      continue
    }

    if(chara == '\n'){
      this.text_turned[this.lines].returned = true
      this.lines++
      this.text_turned[this.lines] = this.create_copy_of(this.text, "")
    }
    previous_not_returned_line = ""
    for(var j=1; j<this.lines.length; j++){
      if(this.lines==0){break}
      if(this.text_turned[this.lines-j].returned){break}
      previous_not_returned_line += this.text_turned[this.lines-j].content
    }

    if(this.ctx.measureText(previous_not_returned_line + this.text_turned[this.lines].content + chara).width > this.width - this.text_margin_left*2){
        this.text_turned[this.lines].returned = true
        this.lines++
        this.text_turned[this.lines] = this.create_copy_of(this.text, "")
    }

    this.text_turned[this.lines].content += chara
    this.text_turned[this.lines].color = color_stack[color_stack.length-1]
    this.text_turned[this.lines].font = font_stack[font_stack.length-1]
    this.ctx.font = this.text_turned[this.lines].font
  }
  this.ctx.font = temp_font
}

TextboxSquare.prototype.create_copy_of = function(textCanvas, text){
  var copied = new TextCanvasModel(text)
  copied.color = textCanvas.color
  copied.font = textCanvas.font
  copied.globalAlpha = textCanvas.globalAlpha
  copied.lineWidth = textCanvas.lineWidth
  copied.possitionX = textCanvas.possitionX
  copied.possitionY = textCanvas.possitionY
  copied.z_index = textCanvas.z_index
  copied.is_bold = textCanvas.is_bold
  return copied
}
inherits(TextboxSquare, SquareWithTitle)
;var TextCanvasModel = function(text){
  BaseCanvasModel.call(this)
  this.color = 'rgb(0, 0, 0)'
  this.font = "20px sans-serif"
  this.content = text
  this.globalAlpha = 1.0
  this.is_bold = true
  this.lineWidth = 2
}
TextCanvasModel.prototype.draw = function(ctx){
  var tmp_globalAlpha = ctx.globalAlpha
  var tmp_fillStyle = ctx.fillStyle
  var tmp_font = ctx.font
  var tmp_lineWidth = ctx.lineWidth
  var tmp_strokeStyle = ctx.strokeStyle

  ctx.globalAlpha = this.globalAlpha
  ctx.fillStyle = this.color
  ctx.font = this.font
  ctx.lineWidth = this.lineWidth
  ctx.strokeStyle = this.color

  if(this.is_bold){
    ctx.strokeText(this.content, this.possitionX, this.possitionY)
  }
  ctx.fillText(this.content, this.possitionX, this.possitionY)

  ctx.font = tmp_font
  ctx.globalAlpha = tmp_globalAlpha
  ctx.fillStyle = tmp_fillStyle
  ctx.lineWidth = tmp_lineWidth
  ctx.strokeStyle = tmp_strokeStyle
}
TextCanvasModel.prototype.get_px_width = function(){
  return (Number(this.font.match(/([0-9].)px/)[1])/1.7) * this.content.length
}
TextCanvasModel.prototype.get_px_height = function(){
  return Number(this.font.match(/([0-9].)px/)[1])
}

inherits(TextCanvasModel, BaseCanvasModel)
;function inherits(ctor, superCtor) {
  if (ctor === undefined || ctor === null)
    throw new TypeError('The constructor to `inherits` must not be ' +
                        'null or undefined.');

  if (superCtor === undefined || superCtor === null)
    throw new TypeError('The super constructor to `inherits` must not ' +
                        'be null or undefined.');

  if (superCtor.prototype === undefined)
    throw new TypeError('The super constructor to `inherits` must ' +
                        'have a prototype.');

  ctor.super_ = superCtor;
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
//  ctor.prototype = Object.create(superCtor.prototype, {
//    constructor: {
//      value: ctor,
//      enumerable: false,
//      writable: true,
//      configurable: true
//    }
//  });
}

function arrowPos(A,B,w,h,L,R){ //A,B,L,Rは[0]:x [1]:y
  var unitVector = getUniVector(A, B)
  Ux = unitVector[0]
  Uy = unitVector[1]
  L[0]= B[0] - Uy*w - Ux*h;
  L[1]= B[1] + Ux*w - Uy*h;
  R[0]= B[0] + Uy*w - Ux*h;
  R[1]= B[1] - Ux*w - Uy*h;
}

function getVector(start, end){
  var Vx = end[0] - start[0]
  var Vy = end[1] - start[1]
  return [Vx, Vy]
}

function getUniVector(start, end){
  var V = getVector(start, end)
  var Vx = V[0]
  var Vy = V[1]
  var v = Math.sqrt(Vx*Vx+Vy*Vy);
  var Ux= Vx/v;
  var Uy= Vy/v;
  var result = [Ux, Uy]
  return result
}

function vectorDividedBy(start, end, division){
  var result = []
  var V = getVector(start, end)
  var Vrx = V[0] / division
  var Vry = V[1] / division
  return [Vrx, Vry]
}

function addVector(org, add){
  var result = []
  result[0] = org[0] + add[0]
  result[1] = org[1] + add[1]
  return result
}

function extendVector(start, end, add, limit){
  var unitVector = getUniVector(start, end)
  var result = []
  result[0] = end[0] + unitVector[0] * add
  result[1] = end[1] + unitVector[1] * add
  Vlimit = getVector(start, limit)
  Vresult = getVector(start, result)
  if(comparedVector(Vlimit, Vresult, '<')){
    return limit
  }
  return result
}

function subtractedVector(start, end, sub, limit){
  var unitVector = getUniVector(start, end)
  var result = []
  result[0] = end[0] - unitVector[0] * sub
  result[1] = end[1]- unitVector[1] * sub
  Vsub = [unitVector[0] * sub, unitVector[1] * sub]
  Vorg = getVector(start, end)
  if(comparedVector(Vsub, Vorg, '>')){
    return limit
  }
  return result
}

function comparedVector(left, right, operator){
  var l = Math.sqrt(left[0]*left[0] + left[1]*left[1]);
  var r = Math.sqrt(right[0]*right[0] + right[1]*right[1]);
  if(operator == '>') {
    if(l>r){ return true }else{ return false }
  } else if (operator == '<') {
    if(l<r){ return true }else{ return false }
  } else {
    if(l==r){ return true }else{ return false }
  }
}

function randomNum(from, to){
  var range = to - from
  return from + Math.random() * range
}

/**

**/
function get_metacode(content, current_pointer){
  var color_info = null
  var font_info = null
  var color_metatag = "<color>"
  var end_color_metatg = "</color>"
  var font_metatag = "<font>"
  var end_font_metatg = "</font>"
  result = {"found": false, "value": {}}

  candidate = ''
  for(var j = current_pointer; j<content.length; j++){
    candidate += content.charAt(j)
    if(content.charAt(j)==">"){break}
    else if(j == j + 20){break}
  }
  switch(candidate){
    case color_metatag:
                        //     j j+1 j+2
      next_start = j+2 //<color>  (   #
      color_info = ""
      for(var j = next_start; j<content.length; j++){
        if(content.charAt(j) == ")"){break}
        color_info += content.charAt(j)
      }
      break
    case font_metatag:
                        //     j j+1 j+2
      next_start = j+2 //<font>   (  something
      font_info = ""
      for(var j = next_start; j<content.length; j++){
        if(content.charAt(j) == ")"){break}
        font_info += content.charAt(j)
      }
      break
    case end_color_metatg:
      result.found = true;
      result.value = {'name': 'color', 'next_char': j+1, 'eot': true}
      break
    case end_font_metatg:
      result.found = true;
      result.value = {'name': 'font', 'next_char': j+1, 'eot': true}
      break
  }

  if(color_info){
    result.found = true
    result.value = {'name': 'color', 'value': color_info, 'next_char': j+1,
                    'eot': false}
  }else if (font_info){
    result.found = true
    result.value = {'name': 'font', 'value': font_info, 'next_char': j+1,
                    'eot': false}
  }
  return result
}
;/** DrawConnectionObject Class

**/
var DrawConnectionObject = function(from, to, options){
  this.from = from
  this.to = to
  this.options = (typeof(options) == "object")? options: {}
  if(this.options.title){
    this.canvas = new ArrowConnectionWithTitle(this.options.title)
  }else{
    this.canvas = new ArrowConnection()
  }
  this.unHighlight()
}

DrawConnectionObject.prototype.calculate = function(){
      //[x, y] array
  this.canvas.begin_possition = this.from.get_connecting_point(this.to)
  this.canvas.end_possition = this.to.get_connecting_point(this.from)
  this.canvas.calculate()
}

DrawConnectionObject.prototype.highlight = function(options){
  this.canvas.strokeStyle = "black"
  this.canvas.globalAlpha = 1
  this.canvas.lineWidth = 3
  if(options["color"]){
    this.canvas.strokeStyle = options["color"]
  }
  if(options["globalAlpha"]){
    this.canvas.globalAlpha = options["globalAlpha"]
  }
  if(options["lineWidth"]){
    this.canvas.lineWidth = options["lineWidth"]
  }
}

DrawConnectionObject.prototype.unHighlight = function(){
  this.canvas.strokeStyle = "black"
  this.canvas.globalAlpha = 0.1
  this.canvas.lineWidth = 2
}
;/** DrawObject Class
  Args:
    name(str): this object name, this isn't identifier and unique      
    options({}):
**/
var DrawObject = function(id, canvasObj, options){
  // super object, we don't need to specify the x,y,width...
  this.super_draw_object = null
  this.super_draw_margin = 28
  this.children_draw_objects = []
  this.id = id
  this.options = (typeof(options) == 'object')? options:{}
  this.canvas = canvasObj

  /**
    {
      "top": {
        [x, y]: [],
        [x1, y]: []
      }
    }
  **/
  this.connecting_points = {
    "top":{},
    "down":{},
    "left":{},
    "right":{} 
  }
  this.connecting_points_space = 10 // point <10> point <10>
  this.connections = []
  this.event_functions = {
    "mousedown": null,
    "mousedown:clear": null,
    "mousemove": null,
    "mousemove:clear": null
  }
}

/** configure_super Method
Setting other draw object as super of this
  Args:
    super_object(DrawObejct obj)
**/
DrawObject.prototype.configure_super = function(super_object){
  super_object.children_draw_objects.push(this)
  this.super_draw_object = super_object  
}

/** calculate Method
Calculate and Clarify the possition/width/height and Set the result into 
canvas object and Initialise connecting points and call calculate method of
DrawConnectionObject as well.
**/
DrawObject.prototype.calculate = function(){
  if(this.is_super()){
    for(var i=0; i<this.children_draw_objects.length; i++){
      this.children_draw_objects[i].calculate()   
    }
    this.canvas.possitionX = this.get_mostleft() - this.super_draw_margin
    this.canvas.possitionY = this.get_mosttop() - this.super_draw_margin
    this.canvas.width = this.get_mostright() - this.get_mostleft() + this.super_draw_margin*2
    this.canvas.height = this.get_mostdown() - this.get_mosttop() + this.super_draw_margin*2
    //If this drawObject has child, the title of this should be shown on the top
    this.canvas.title_vertical_align = "top"
    this.canvas.lineFlag = true
  }
  if(!this.canvas.z_index_fixed){
    this.canvas.z_index = this.get_generation()
  }
  // SquareWithTitle is required to be called calculate Method
  // after attribute is updated like possitionX, Y and so on.
  this.canvas.calculate()
  this.init_connecting_points()
  for(var i=0; i<this.connections.length; i++){
    this.connections[i].calculate()
  }
}

/** init_connecting_points Method
using aspect map(*1) canvas returned, generate and set connecting point map(*2)
as attribute of this.

*1: aspect map
{
  "right":{
    "begin": {"x": <possitionX>, "y": possitionY}
    "end": {"x": <possitionX>, "y": possitionY}
  },
  <aspect name>: {
    "begin": {"x": <possitionX>, "y": possitionY}
    "end": {"x": <possitionX>, "y": possitionY}
  }
}

*2: connecting point map
{
  "right":{
    [0, 0]:[drawObject, drawObject],
  },
  <aspect name>:{
    [x, y]:[drawObject,]
  }
}
**/
DrawObject.prototype.init_connecting_points = function(){
  var aspects =  this.canvas.get_aspects()
  for(var aspect_name in aspects){
    var points = []  
    if(aspect_name === 'right' || aspect_name === 'left'){
      var y_begin = aspects[aspect_name]['begin']['y']
      var y_end = aspects[aspect_name]['end']['y']
      for(var temp_point=y_begin; temp_point<y_end; temp_point+=this.connecting_points_space){
        var point = [aspects[aspect_name]['begin']['x']]
        point.push(temp_point)
        points.push(point)
      }
    }else{
      var x_begin = aspects[aspect_name]['begin']['x']
      var x_end = aspects[aspect_name]['end']['x']
      for(var temp_point=x_begin; temp_point<x_end; temp_point+=this.connecting_points_space){
        var point = [aspects[aspect_name]['begin']['y']]
        point.unshift(temp_point)
        points.push(point)
      }
    }    
    this.connecting_points[aspect_name] = {}
    for(var i=0; i<points.length; i++){
      this.connecting_points[aspect_name][points[i]] = []
    }
  }    
}

/** is_super Method
judge if this have any draw object as child
  Return:
    is_super(Bool): True or False
**/
DrawObject.prototype.is_super = function(){
  return this.children_draw_objects.length > 0
}


/** get_mostleft Method
find most left possitionX amond children, this method **don't** investigate
grandchild and more. only do against children.

  Return:
    possitionX(int): most left x coordinate
**/
DrawObject.prototype.get_mostleft = function(){
  var mostleft = null
  for(var i=0; i<this.children_draw_objects.length; i++){
    var child = this.children_draw_objects[i]  
    if (mostleft == null) mostleft = child.canvas.possitionX
    if (child.canvas.possitionX < mostleft) {
      mostleft = child.canvas.possitionX
    }
  }
  return mostleft
}

/** get_mostright Method
find most right possitionX among children, this method **don't** investigate
grandchild and more, only do against children

  Return:
    possitionX(int): most right x coordinate
**/
DrawObject.prototype.get_mostright = function(){
  var mostright = null
  for(var i=0; i<this.children_draw_objects.length; i++){
    var child = this.children_draw_objects[i]  
    if (mostright == null) mostright = child.canvas.get_possitionX_end()
    if (child.canvas.get_possitionX_end() > mostright) {
      mostright = child.canvas.get_possitionX_end()
    }
  }
  return mostright
}

/** get_mosttop Method
find most top possitionY among children, this method **don't** investigate
grandchild and more, only do against children

  Return:
    possitionY(int): most top y coordinate
**/
DrawObject.prototype.get_mosttop = function(){
  var mosttop = null
  for(var i=0; i<this.children_draw_objects.length; i++){
    var child = this.children_draw_objects[i]  
    if (mosttop == null) mosttop = child.canvas.possitionY
    if (child.canvas.possitionY < mosttop) {
      mosttop = child.canvas.possitionY
    }
  }
  return mosttop
}

/** get_mostdown Method
find most down possitionY among children, this method **don't** investigate
grandchild and more, only do against children

  Return:
    possitionY(int): most down y coordinate
**/
DrawObject.prototype.get_mostdown = function(){
  var mostdown = null
  for(var i=0; i<this.children_draw_objects.length; i++){
    var child = this.children_draw_objects[i]  
    if (mostdown == null) mostdown = child.canvas.get_possitionY_end()
    if (child.canvas.get_possitionY_end() > mostdown) {
      mostdown = child.canvas.get_possitionY_end()
    }
  }
  return mostdown
}

/** get_generation Method
get a children number of me from the top parent
  Return:
    generation(int)
*/
DrawObject.prototype.get_generation = function(){
  if(this.super_draw_object == null){
    return 0
  }else{
    var super_gen = this.super_draw_object.get_generation()
    return super_gen + 1
  }
}

/** get_connecting_point Method
get the connecting point the other object should connect to, and
set the obejct into connecting maps as the status of connectiong

  Args:
    hintDrawObj(DrawObj): the drawObject to be wanted to connect to

  Retrun:
    connecting_point(Array[x, y])
**/
DrawObject.prototype.get_connecting_point = function(hintDrawObj){
  var aspect_name = this.which_aspect_is_closer(hintDrawObj)
  var current_connecting = this.connecting_points[aspect_name]
  var candidate_point = null
  var candidate_array  = []
  for(var point in current_connecting){
    // decode
    point = point.split(',')
    if (candidate_point == null) {
      candidate_point = point
      candidate_array = current_connecting[point]
    }
    if (candidate_array.length > current_connecting[point].length){
      candidate_point = point
      candidate_array = current_connecting[point]
    }
  }
  candidate_array.push(hintDrawObj)
  return candidate_point //[x, y] array
}

/** which_aspect_is_closer Method
find out the other obejct is classified into 4 aspects as closer
  Args:
    comparedObj(drawObject)

  Return:
    aspect(str): 'left' or 'right' or 'top' or 'down'
**/
DrawObject.prototype.which_aspect_is_closer = function(comparedObj){
  var LEFT = 'left'
  var RIGHT = 'right'
  var TOP = 'top'
  var DOWN = 'down'

  var source_pX_end = this.canvas.get_possitionX_end()
  var source_pY_end = this.canvas.get_possitionY_end()

  var vartical_distance = null
  var horizontal_distance = null  
  var X = null
  var Y = null
  if(comparedObj.canvas.possitionX>this.canvas.possitionX){
    X = RIGHT
    horizontal_distance = comparedObj.canvas.possitionX - source_pX_end
    //The vartical_distance is minus, which means this object is wrapping
  }else{
    X = LEFT
    horizontal_distance = this.canvas.possitionX - comparedObj.canvas.possitionX
  }
  if(comparedObj.canvas.possitionY>this.canvas.possitionY){
    Y = DOWN
    vartical_distance = comparedObj.canvas.possitionY - source_pY_end
    //The vartical_distance is minus, which means this object is wrapping
  }else{
    Y = TOP
    vartical_distance = this.canvas.possitionY - comparedObj.canvas.possitionY
  }
  if(vartical_distance > horizontal_distance){
    return Y
  }else{
    return X
  }  
}

DrawObject.prototype.add_connection = function(drawConObj){
  this.connections.push(drawConObj)
}

DrawObject.prototype.add_connection_to = function(drawObject, options){
  drawConObj = new DrawConnectionObject(this, drawObject, options)
  this.add_connection(drawConObj)
  drawObject.add_connection(drawConObj)
  return drawConObj
}

DrawObject.prototype.event_handler = function(eventName, event_info){
  if(this.event_functions[eventName]){
    this.event_functions[eventName](this, eventName, event_info)
  }else{
    //console.log(this.name)
    //console.log(this.event_functions)
  }
}

DrawObject.prototype.event_function_register = function(eventName, event_function){
  this.event_functions[eventName] = event_function
}
;var Pallet = function(ctx, canvas_dom, scale){
  this.canvas_dom = canvas_dom
  this.ctx = ctx
  this.draw_objects = []
  this.draw_objects_z_map = {}
  this.scale = scale
  this.event_object = {
    "mousedown": null, //selected object with highest z_index
    "mousemove": null, //selected object with highest z_index
    "dragging": null // keep the mousedown object until mouseup object is called
  }
}
Pallet.prototype.add_object = function(obj){
  this.draw_objects.push(obj)
}

Pallet.prototype.remove_object = function(obj){
  for(var i=0; i<this.draw_objects.length; i++){
    if(this.draw_objects[i] === obj){
      this.draw_objects.splice(i,1)
    }
  }
}

Pallet.prototype.find_object = function(key, value){
  for(var i=0; i<this.draw_objects.length; i++){
    if(this.draw_objects[i].options[key] == value){
      return this.draw_objects[i]
    }
  }
}

/**
  Private: re-calculate the possition and z-index for drawObject,
  and generate layer map as followings. after this method is executed,
  all draw object have enough information to draw something (like possition,
  width, z-index...)
  
  * layer map
  {
    <z-index>: [drawObejct, drawObejct]
  }
  
**/
Pallet.prototype._sort_object_by_z = function(){
  var startTime = Date.now()
  this.draw_objects_z_map = {}
  for(var i = 0;i<this.draw_objects.length; i++){
    this.draw_objects[i].calculate()
    var z = this.draw_objects[i].canvas.z_index 
    if(Object.prototype.toString.call(this.draw_objects_z_map[z]) == "[object Array]"){
      this.draw_objects_z_map[z].push(this.draw_objects[i])
    }else{
      this.draw_objects_z_map[z] = []
      this.draw_objects_z_map[z].push(this.draw_objects[i])
    }
  }
}


Pallet.prototype._get_sorted_zindex_list = function(){
  var z_list = Object.keys(this.draw_objects_z_map)
  z_list.sort(function(a,b){
    if(Number(a) < Number(b)) return -1;
    if(Number(a) > Number(b)) return 1;
    return 0;
  })
  return z_list
}

Pallet.prototype.render = function(){
  var startTime = Date.now()
  this.ctx.clearRect(0, 0, this.canvas_dom.width, this.canvas_dom.height)
  this._sort_object_by_z()
  var z_list = this._get_sorted_zindex_list()
  for(var i=0; i<z_list.length; i++){
    var z = z_list[i]
    for(var j=0; j<this.draw_objects_z_map[z].length; j++){
      this.draw_objects_z_map[z][j].canvas.draw(this.ctx)
    }
  }
  console.log('render', (Date.now()-startTime)/1000)
}

Pallet.prototype.setMouseEventToDocument = function(_document){
  var events = ['mousedown', 'mousemove']
  for(var i=0; i<events.length; i++){
    var callback = this.genMouseEventHandler(events[i])
    _document.addEventListener(events[i], callback)
  }
  _document.addEventListener('mouseup', this.getMouseUpEventHandler())
}

//original event dragging
Pallet.prototype.getMouseUpEventHandler = function(){
  var _this = this
  var callback = function(e){
    if(_this.event_object['dragging']){
      _this.event_object['dragging'].event_handler('dragging:clear')
      _this.event_object['dragging'] = null
    }
  }
  return callback
}

Pallet.prototype.genMouseEventHandler = function(eventName){
  var _this = this
  var callback = function(e){
    var startTime = Date.now()
    var rect = e.target.getBoundingClientRect(); 
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    x = x / this.scale
    y = y / this.scale
    var event_info = {'x': x, 'y': y}
    var deteced = {}
    if(eventName=='mousemove' && _this.event_object['dragging']){
      _this.event_object['dragging'].event_handler('dragging', event_info)
    }else{
      for(var i=0; i< _this.draw_objects.length; i++){
        var obj = _this.draw_objects[i]
        if(obj.canvas.collision_detect(x, y)){
          if(deteced[obj.canvas.z_index]){
            deteced[obj.canvas.z_index].push(obj)
          }else{
            deteced[obj.canvas.z_index] = [obj]
          }
        }
      }
      var z_list = Object.keys(deteced)
      if(z_list.length > 0){
        z_list.sort(function(a,b){ if(Number(a) < Number(b)) return 1; if(Number(a) > Number(b)) return -1; return 0; })
        var front_z_index = z_list.shift()
        var detected_objects = deteced[front_z_index]
        //TODO unsupport wrapped object
        //TODO consider event delivery
        var detected_object = detected_objects[0]
        if(_this.event_object[eventName] != detected_object){
          if(_this.event_object[eventName])
            _this.event_object[eventName].event_handler(eventName+':clear')
          _this.event_object[eventName] = detected_object
          detected_object.event_handler(eventName, event_info)
        }else{
          detected_object.event_handler(eventName, event_info)
        }
        if(eventName == 'mousedown'){
          _this.event_object['dragging'] = detected_object
        }
      }else{//If there is no selected obejct
        if(_this.event_object[eventName]){
          _this.event_object[eventName].event_handler(eventName+':clear')
          _this.event_object[eventName] = null
        }
      }
    }
    console.log('find.event', (Date.now()-startTime)/1000)
  }
  return callback
}
