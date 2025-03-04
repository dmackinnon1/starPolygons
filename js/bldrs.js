"use strict";
/**
* Builders to be used for HTML construction.
*
*/
class Bldr {
	constructor(name) {
		this.name = name;
		this.attributes = [];
		this.elements = [];
	}
	att(name, value) {
		let att = new Attribute(name, value);
		this.attributes.push(att);
		return this;
	}
	// add element allows you to add a builder to a builder
	elem(bldr) {
		this.elements.push(bldr);
		return this;
	}
	text(text) {
		this.elements.push (new RawHtml(text));
		return this;
	}
	build() {
		let s = "<" + this.name;
		for(let i = 0; i< this.attributes.length; i++) {
			s += " " + this.attributes[i].toString();
		}
		s += ">";
		for(let i = 0; i< this.elements.length; i++) {
			s += " " + this.elements[i].build();
		}
		s += "</" + this.name + ">";
		return s;
	}
};

class Attribute {
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}

	toString() {
		return "" + this.name + "='" + this.value + "'";
	}
};

class RawHtml {
	constructor(raw) {
		this.raw = raw;
	}
	build() {
		return this.raw;
	}
};


class LaTeXTabular{
	constructor(rows, columns, list ){
		this.rows = rows;
		this.columns = columns;
		this.list = list;
	}

	addElement(thing){
		this.list.push(thing);
	}

	build(){
		
		let result = "\\begin{tabular}{";
		for (let i= 0; i< this.columns; i++){
			result += "c";
		}
		result += "} \n";
		for(let i = 0 ; i < this.rows; i++){
			for(let j = 0 ; j < this.columns; j++){
				result += this.list.pop();
				if (j != this.columns -1){
					result += " & ";
				}
			}
			result += "\\\\ \n ";
		}
		result += "\\end{tabular} \n";
		return result;
	}
};

class TikZBuilder {

	constructor(){
		this.components = [];
		this.scale = 1;
	}

	reset(){
		this.components = [];
	}

	scale(value){
		this.scale = value;
	}

	build(){
		let s = this.buildOpen();

		for(let c in this.components) {
			s += " " + this.components[c].build();
		}

		s += this.buildClose();
		return s;
	}

	buildOpen(){
		let s = "";
		//s +=  "\\begin{figure}[!h] \n";
		//s += "\\centering \n";
		s+= "\\begin{tikzpicture}[scale="+this.scale +"]\n";
		return s;
	}

	buildClose(){
		let s = "";
		s += "\\end{tikzpicture} \n";
		//s +=  "\\end{figure} \n";		
		return s;
	}

	addComponent(comp){
		this.components.push(comp);
	}

	addLine(x1, y1, x2, y2){
		let start = new TikZPoint(x1, y1);
		let end = new TikZPoint(x2,y2);
		this.components.push(new TikZLine(start,end));
	}

	drawGrid(x1, y1, x2, y2, scale=1){
		let start = new TikZPoint(x1, y1);
		let end = new TikZPoint(x2,y2);
		this.components.push(new TikZGrid(start,end, scale));
	}
	
};

//\draw[opacity=0.5,fill=gray] (0,0)--(0,1)--(1,1)--(0,0);
class TikZRightTriangle{

constructor(topLeft, rotation=0, size=1,color="black"){
		this.color = color;
		this.size= size;
		this.topLeft = topLeft;
		this.rotation = rotation;
		}
	
	build(){
		let dash = "--";
		let topLeft = this.topLeft;
		let topRight = new TikZPoint(topLeft.x + this.size, topLeft.y);
		let bottomLeft = new TikZPoint(topLeft.x, topLeft.y - this.size);
		let bottomRight = new TikZPoint(topLeft.x + this.size, topLeft.y - this.size);
		let s = "";
		if (this.rotation==0){
			s = "\\draw[opacity=1,fill=black]" +  topLeft.build() + dash + topRight.build() + dash + bottomRight.build()+"; \n";
		}
		if (this.rotation==1){
			s = "\\draw[opacity=1,fill=black]" +  topRight.build() + dash + bottomRight.build() + dash + bottomLeft.build()+"; \n";
		}
		if (this.rotation==2){
			s = "\\draw[opacity=1,fill=black]" +  bottomRight.build() + dash + bottomLeft.build()+ dash + topLeft.build() +"; \n";
		}
		if (this.rotation==3){
			s = "\\draw[opacity=1,fill=black]" +  bottomLeft.build()+ dash + topLeft.build() + dash + topRight.build() +"; \n";
		}
		return s;

	}

};


class TikZGrid {

	constructor(start, end, step="1", color="gray", thickness = "very thin"){
		this.color = color;
		this.thikness = thickness;
		this.start = start;;
		this.end = end;
		this.step = "" + step + "cm";
		}

		build(){
			let s = "\\draw [step=" + this.step + "," + this.color + ","  + this.thikness + "]" + this.start.build() + " grid " + this.end.build() + "; \n";
			return s;
		}
};


class TikZLine {

	constructor(s, e){
		this.start = s;
		this.end = e;
	}

	build(){
		let s = "\\draw [ultra thick] " + this.start.build() + " -- " + this.end.build() + "; \n"
		return s;
	}
};

class TikZPoint {
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.label = null;
	}

	setLabel(l){
		this.label = l;
	}

	coordinateDef(){
		return "\\coordinate ("+this.label +") at " + this.buildBasic() +";\n";
	}

	coordinate(){
		return "(" + this.label + ")";
	}

	buildBasic(){
		return "(" + this.x + "," + this.y + ")";
	}

	build(){
		return this.coordinateDef();
	}

};

// \draw[opacity=0.5,fill=gray, thick] (p0) -- (p2) -- (p4) -- (p1) --(p3) --cycle;

class TikZCycle {
	constructor(coords){
		this.coordinates = coords;
	}

	build(){
		let result = "\\draw[thick]";
		for (let c = 0; c < this.coordinates.length; c++){
			let coord = this.coordinates[c];
			result += "(" + coord + ") -- ";
		}
		result += "cycle;\n";
		return result;
	}

};


try{
    module.exports.TikZPoint = TikZPoint; 
    module.exports.TikZBuilder = TikZBuilder; 
    module.exports.LaTeXTabular = LaTeXTabular; 
    module.exports.TikZLine = TikZLine; 
    module.exports.TikZCycle = TikZCycle;
} catch(err){
    console.log("non-node execution context");
}
