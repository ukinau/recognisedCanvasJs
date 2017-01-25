function inherits(ctor, superCtor) {
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
