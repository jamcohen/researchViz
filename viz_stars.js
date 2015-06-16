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
	this.barLength = this.c.width*0.9; //max size
	this.start = (this.c.width-this.total)/2;

	var sick = falseNeg + truePos;
	this.dividerPos = this.barLength*sick;
	this.yScale = 30;
	this.barHeight = (this.c.height-this.yScale)/2;
	this.falseNeg = falseNeg;
	this.trueNeg = trueNeg;
	this.truePos = truePos;
	this.falsePos = falsePos;
	//Set the size equal to the overlap/total * length of bar
	this.size = (truePos+falsePos)*this.barLength;
	this.overlapPos = this.start + falseNeg*this.barLength + this.size/2;
	controls.push(this);
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
	//this.c.width = this.c.width;
	var ctx = this.ctx;
    ctx.save();
    ctx.strokeSyle = "black";
    ctx.lineWidth = 0;
	/*ctx.fillStyle = 'rgba(0,0,255,0.5)';
	ctx.fillRect(overlapPos-intersectBar/2, this.barHeight-4, intersectBar, this.yScale+8);
	ctx.strokeStyle = 'rgba(0,0,0,0.65)'
	ctx.lineWidth = 3;
	ctx.strokeRect(overlapPos-intersectBar/2, this.barHeight-4, intersectBar, this.yScale+8);
	ctx.strokeStyle = 'black'
	ctx.lineWidth = 2;*/
	//ctx.strokeRect(this.start, this.barHeight, sickBar, this.yScale)
	//ctx.strokeRect(this.start+sickBar, this.barHeight, healthyBar, this.yScale)
    var rowHeight = 75;
    //draw clipping shapes
    ctx.beginPath()
    this.drawStarRow(175, 0, 5, 450,100);
    this.drawStarRow(175, rowHeight, 5, 450, 100);
    ctx.closePath();
    ctx.clip();
    
    //draw fill
    var width = 450-175;
    var size = width/5;
    ctx.fillStyle = "rgb(255, 204, 1)";
    var fillStartPos = 175-size/2;
    var fillWidth = width*this.truePos*2;
    console.log("trueneg "+this.trueNeg);
    ctx.fillRect(fillStartPos, rowHeight, fillWidth, 100);
    
    ctx.fillStyle = "rgb(102, 108, 196)";
    fillWidth = width*this.trueNeg*2;
    ctx.fillRect(fillStartPos, 0, fillWidth, 100);
    
    ctx.restore();
    
    //Draw outlines
    ctx.lineWidth = 2;
    ctx.beginPath()
    this.drawStarRow(175, 0, 5, 450,100);
    this.drawStarRow(175, rowHeight, 5, 450, 100);
    ctx.closePath();
    
    console.log("drew a star");
    
	ctx.fillStyle = 'black';
	ctx.font = "24px Arial";
    ctx.fillText("Avoids false", 5, 50);
    ctx.fillText("alarm", 5, 75);
    ctx.fillText("Avoids false", 5, 50+rowHeight);
    ctx.fillText("reassurance", 5, 75+rowHeight);
	ctx.restore();
}

StarViz.prototype.drawStarRow = function(x, y, numStars, width, height){
    var ctx = this.ctx;
    width -= x;
    var size = width/numStars; //the height of the row also specifies the size of the star
    for(var i=0; i<numStars; ++i){
        this.drawStar(x+i*size, y+height/2, 5, size/2, size/5);
    }
    ctx.stroke();
}

//Found at http://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5
StarViz.prototype.drawStar = function(cx,cy,spikes,outerRadius,innerRadius){
      var ctx = this.ctx;
      var rot=Math.PI/2*3;
      var x=cx;
      var y=cy;
      var step=Math.PI/spikes;

      ctx.strokeSyle="#000";
      ctx.moveTo(cx,cy-outerRadius)
      for(i=0;i<spikes;i++){
        x=cx+Math.cos(rot)*outerRadius;
        y=cy+Math.sin(rot)*outerRadius;
        ctx.lineTo(x,y)
        rot+=step

        x=cx+Math.cos(rot)*innerRadius;
        y=cy+Math.sin(rot)*innerRadius;
        ctx.lineTo(x,y)
        rot+=step
      }
      ctx.lineTo(cx,cy-outerRadius)
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
