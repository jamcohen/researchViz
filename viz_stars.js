window.addEventListener('mousemove', detectMousePosition,true);
window.addEventListener('keydown',doKeyDown,true);
window.addEventListener('keyup',doKeyUp,true);
var mouseX = 0;
var mouseY = 0;
var left,right,up,down = false;
if(!controls){
	var controls = [];
}
//falsePos, truePos etc. must be floats less than one whose sum is one
function StarViz(falseNeg, truePos, falsePos, trueNeg, canvasId){
	this.c = document.getElementById(canvasId);
	this.ctx = this.c.getContext("2d");
	this.total = this.c.width*0.9; //max size
	this.start = (this.c.width-this.total)/2;
	this.barLength = this.total;
     this.isAlternate = isAlternate; //If true text will change to "Diagnosed correctly" and trueneg will switch will falsePos
  if(isAlternate){
      var tmp = falsePos;
      falsePos = trueNeg;
      trueNeg = tmp;
    console.log("trueNeg: "+trueNeg);
  }
	var sick = falseNeg + truePos;
	this.dividerPos = this.barLength*sick;
	this.yScale = 30;
	this.barHeight = (this.c.height-this.yScale)/2;
	this.falseNeg = falseNeg;
	this.trueNeg = trueNeg;
	this.truePos = truePos;
	this.falsePos = falsePos;
	this.drawNumbers = drawNumbers;
	//Set the size equal to the overlap/total * length of bar
	this.size = (truePos+falsePos)*this.barLength;
	this.overlapPos = this.start + falseNeg*this.barLength + this.size/2;
	controls.push(this);
	//console.log(controls);
	if(interactable){
		setInterval(update, 60);
	}
	this.showTopBrackets = showTopBrackets;
	this.showBottomBrackets = showBottomBrackets;
	this.draw();
}

StarViz.prototype.update = function(){
	var inc = 5;
	if(this.left){
		this.dividerPos-=inc;
	}else if(this.right){
		this.dividerPos+=inc;
	}
	
	if(this.dividerPos<0){
		this.dividerPos = 0;
	}else if(this.dividerPos>this.total){
		this.dividerPos = this.total;
	}
	
	if(this.up){
		this.size+=inc;
	}else if(this.down){
		this.size-=inc;	
	}
	
	if(this.size<0) this.size = 0;
	if(this.size>this.barLength) this.size = this.barLength;
	
	this.overlapPos = mouseX;
	if(this.overlapPos-this.size/2<this.start){
		this.overlapPos = this.start+this.size/2;
	}else if(this.overlapPos+this.size/2>this.barLength+this.start){
		this.overlapPos = this.barLength+this.start-this.size/2;
	}
	
	var leftOverlapPos = this.overlapPos-this.size/2;
	var rightOverlapPos = this.overlapPos+this.size/2;
	var dp = this.dividerPos+this.start; //divider converted into actual position ie where it is on screen
	
	if(dp-this.leftOverlapPos > this.size){
		this.overlapPos = dp-this.size/2
		this.leftOverlapPos = this.overlapPos-this.size/2;
		rightOverlapPos = this.overlapPos+this.size/2;
	}
	
	if(rightOverlapPos-dp > this.size){
		this.overlapPos = dp+this.size/2;
		this.leftOverlapPos = this.overlapPos-this.size/2;
		rightOverlapPos = this.overlapPos+this.size/2;
	}
}

StarViz.prototype.draw = function(){
	this.c.width = this.c.width;
	var ctx = this.ctx;
	var sickBar = this.dividerPos/this.total*this.barLength
	var healthyBar = (1-this.dividerPos/this.total)*this.barLength;
	var overlapPos = this.overlapPos/this.total*this.barLength;
	var intersectBar = this.size/this.total*this.barLength;
	var leftSide = (this.overlapPos-this.size/2)/this.total*this.barLength;
	var rightSide = (this.overlapPos+this.size/2)/this.total*this.barLength;
	var fnBar = sickBar - this.leftSide;
	var fbBar = rightSide - healthyBar
	ctx.fillStyle = "red";
	ctx.fillRect(this.start, this.barHeight, sickBar, this.yScale);
	ctx.fillStyle = 'rgba(0,0,255,0.5)';
	ctx.fillRect(overlapPos-intersectBar/2, this.barHeight-4, intersectBar, this.yScale+8);
	ctx.strokeStyle = 'rgba(0,0,0,0.65)'
	ctx.lineWidth = 3;
	ctx.strokeRect(overlapPos-intersectBar/2, this.barHeight-4, intersectBar, this.yScale+8);
	ctx.strokeStyle = 'black'
	ctx.lineWidth = 2;
	ctx.strokeRect(this.start, this.barHeight, sickBar, this.yScale)
	ctx.strokeRect(this.start+sickBar, this.barHeight, healthyBar, this.yScale)
	
	ctx.fillStyle = 'black';
	ctx.font = "14px Arial";
	if(this.showBottomBrackets){
		this.drawBracket("Sick People", this.start, this.start+sickBar-2, false, this.barHeight, 10);
		this.drawBracket("Healthy People", this.start+sickBar+2, healthyBar+this.start+sickBar, false, this.barHeight, 10);
	}
	if(this.showTopBrackets){
    var topLabel = this.isAlternate ? "Diagnosed Correctly" : "Tested Sick"
		this.drawBracket(topLabel, leftSide+2, rightSide-2, true, this.barHeight-7, 15);
		//this.drawBracket("Tested Healthy", this.start, leftSide-2, true, this.barHeight, 10);
		//this.drawBracket("Tested Healthy", rightSide+2, this.barLength+this.start, true, this.barHeight, 10);
	}
	
	if(this.drawNumbers){
		textHeight = this.barHeight+20;
    
    if(this.falseNeg > 0 && this.falseNeg <= 0.5){
        ctx.fillText(Math.round(this.falseNeg*200)+"%", leftSide/2, textHeight);
    }
		this.ctx.save()
		this.ctx.fillStyle = 'white';
    if(this.truePos > 0 && this.truePos <= 0.5){
        ctx.fillText(Math.round(this.truePos*200)+"%", leftSide + (sickBar-leftSide-this.start)/2, textHeight);
    }
		this.ctx.restore();
    if(this.falsePos > 0 && this.falsePos <= 0.5){
        ctx.fillText(Math.round(this.falsePos*200)+"%", sickBar+fbBar/2, textHeight);
    }
    if(this.trueNeg > 0 && this.trueNeg <= 0.5){
        ctx.fillText(Math.round(this.trueNeg*200)+"%", sickBar+(healthyBar+fbBar)/2, textHeight);
    }
	}
	
	ctx.restore();
}

//legLength is the lenght of the brackets "legs" (the two line the come out the sides)
StarViz.prototype.drawBracket = function(name, start, end, isOnTop, barHeight, legLength){
	if(end-start < 1) return;
	var ctx = this.ctx;
	//draw intersection bracket
	midPoint = start+(end-start)/2;
	minHeight = isOnTop ? barHeight-15+legLength: barHeight+this.yScale+15-legLength
	maxHeight = isOnTop ? barHeight-15 : barHeight+this.yScale+15
	notchHeight = isOnTop ? barHeight-25 : barHeight+this.yScale+25
	textHeight = isOnTop ? barHeight-27 : barHeight+this.yScale+40
	ctx.moveTo(start, minHeight);
	ctx.lineTo(start, maxHeight);
	ctx.lineTo(end, maxHeight);
	ctx.lineTo(end, minHeight);
	ctx.moveTo(midPoint, maxHeight)
	ctx.lineTo(midPoint, notchHeight)
	ctx.fillText(name, midPoint-(name.length)*(3.4), textHeight) //sub 25 to center the text
	ctx.stroke();
	ctx.restore();
}


function update(){
	for(i in controls){
		controls[i].update();
		controls[i].draw();
	}
}

function detectMousePosition(evt){
	if (evt.offsetX) {
        mouseX = evt.offsetX;
        mouseY = evt.offsetY;
    }
    else if (evt.layerX) {
        mouseX = evt.layerX;
        mouseY = evt.layerY;
    }
}

function doKeyDown(evt){
	switch (evt.keyCode) {
		case 87:  /* Up arrow was pressed */
			up = true;
		break;
		case 83:  /* Down arrow was pressed */
			down = true;
		break;
		case 65:  /* this.left arrow was pressed */
			this.left = true;
		break;
		case 68:  /* Right arrow was pressed */
			right = true;
		break;
	}
}

function doKeyUp(evt){
	switch (evt.keyCode) {
		case 87:  /* Up arrow was pressed */
			up = false;
		break;
		case 83:  /* Down arrow was pressed */
			down = false;
		break;
		case 65:  /* this.left arrow was pressed */
			left = false;
		break;
		case 68:  /* Right arrow was pressed */
			right = false;
		break;
	}
}
