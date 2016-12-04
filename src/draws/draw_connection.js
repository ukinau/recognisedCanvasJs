/** DrawConnectionObject Class

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
