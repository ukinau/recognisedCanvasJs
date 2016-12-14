var SquareWithTitle = function(text, options){
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
  for(var i=0; i<this.text_turned.length; i++){
    this.text_turned[i].possitionY += this.text_turned[i].get_px_height() * i
  }
}

TextboxSquare.prototype.calculate_turned_text = function(){
  this.lines = 0
  this.text_turned = [this.create_copy_of(this.text, "")]

  var temp_font = this.ctx.font
  this.ctx.font = this.text.font
  var color_metatag = "<color>"
  var font_metatag = "<font>"
  var color_info = null
  var font_info = null
  for(var i=0; i<this.text.content.length; i++){
    var chara = this.text.content.charAt(i)
    if(chara == '<'){
      candidate = ''
      for(var j = i; j<this.text.content.length; j++){
        candidate += this.text.content.charAt(j)
        if(this.text.content.charAt(j)==">"){
          break
        }else if(j == j + color_metatag.length-1){
          break
        }
      }
      if(candidate == color_metatag){
        next_start = j+2 //<color>
        color_info = ""
        for(var j = next_start; j<this.text.content.length; j++){
          if(this.text.content.charAt(j) == ")"){break}
          color_info += this.text.content.charAt(j)
        }
      } else if (candidate == font_metatag){
        next_start = j+2 //<font>()
        font_info = ""
        for(var j = next_start; j<this.text.content.length; j++){
          if(this.text.content.charAt(j) == ")"){break}
          font_info += this.text.content.charAt(j)
        }
      }
      if(color_info || font_info){
        i = j + 1
        chara = this.text.content.charAt(i)
      }
    }

    if(chara == '\n'){
      this.lines++
      this.text_turned[this.lines] = this.create_copy_of(this.text, "")
    }
    if(this.ctx.measureText(this.text_turned[this.lines].content + chara).width > this.width - this.text_margin_left*2){
      this.lines++
      this.text_turned[this.lines] = this.create_copy_of(this.text, "")
    }
    this.text_turned[this.lines].content += chara
    if(color_info){
      this.text_turned[this.lines].color = color_info
      color_info = null
    }
    if(font_info){
      this.text_turned[this.lines].font = font_info
      font_info = null
    }
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
