"use strict";

/*
 * Utility functions and classes for generating star polygons
 */

 /*
 * Uses the Euclidian algorithm to calculate the GCD of a pair of positive
 * integers.
 */
function gcd(a, b) {
	if (a == b || a == 0) {
		return b;
	}
	if (b == 0){
		return a;
	}
	let r1 = 0;
	let r2 = 0;
	
	if (a > b){
		r1 = a;
		r2 = b;
	} else {
		r1 = b;
		r2 = a;
	}
	let r3 = r1%r2;
	return gcd(r3, r2);
}

/*
* Frac class represents a fraction
*/
class Frac {
	constructor(n,d){
		this.n = n;
		this.d = d;
	}
	toString(){
		return "" +this.n + "/" + this.d;
	}
	isReduced(){
		return gcd(this.n,this.d) == 1;
	}
	value(){
		return this.n/this.d;
	}
	latex(){
		return "\\frac{" + this.n + "}{" + this.d + "}"; 
	}
}

class Vertex{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
	toString(){ 
		return "(" + this.x + ", " + this.y + ")";
	} 
	stretch(radius){
		this.x = this.x*radius;
		this.y = this.y*radius;
	}
}

class Edge{
	constructor(v1, v2){
		this.start = v1;
		this.end = v2;
	}
	
}

function allVertices(n){
	let vertices = [];
	for (let i = 0; i< n; i++){
		let angle = 2*i*Math.PI/n;
		vertices.push(new Vertex(Math.cos(angle), Math.sin(angle)));
	}
	return vertices;
}

class SVGWrapper{
	constructor(width, height, builder){
		let wrapper = new Bldr("svg");
		wrapper.att("version", "1.1").att("xmlns", "http://www.w3.org/2000/svg").att("xmlns:xlink", "http://www.w3.org/1999/xlink");
		wrapper.att("align", "center").att("width", width).att("height", height);	
		wrapper.elem(builder);
		this.svg = wrapper;
	}

	build(){
		return this.svg.build();
	}	
}

class Polygon {
	constructor(v,s){
		this.vertexCount = v;
		this.skipCount = s;
		this.vertices = [];
		this.edges = [];
	}

	init(){
		let total = this.vertexCount*this.skipCount;
		let allVerts = allVertices(total);
		for (let i=0; i< total; i = i + this.skipCount){
			this.vertices.push(allVerts[i]);
		}
		for (let i=0; i < this.vertexCount; i++){
			this.edges.push(new Edge(this.vertices[i],this.vertices[(i+this.skipCount)%(this.vertexCount)]));
		}
	}	
	
	svgComponent(radius){
		let g = new Bldr("g");
		
		for (let v in this.vertices){
			let vert = this.vertices[v];
			vert.stretch(radius);
		}

		/* //omit drawing vertices
		for (let v in this.vertices){
			let vert = this.vertices[v];
			vert.stretch(radius);
			let dot = new Bldr("circle")
				.att("cx", vert.x)
				.att("cy", vert.y)
				.att("r",0)
				.att("stroke-width",0)
				.att("fill",'black');
			g.elem(dot);
		}
		*/
		for (let e in this.edges){
			let edge = this.edges[e];
			let line = new Bldr("line")
				.att("x1", edge.start.x)
				.att("y1", edge.start.y)
				.att("x2", edge.end.x)
				.att("y2", edge.end.y)
				.att("stroke-width",1)
				.att("stroke",'black');
			g.elem(line);
		}
		return g;
	}
}

function triangularChart(limit){
	let radius = sizeRange(limit);
	let height = limit*radius*3;
	let width = height/2;

	let table = new Bldr("g");
	for(let j = 3; j < limit; j++){
		let vShift = radius +2.5*(j-3)*radius;
		let row = new Bldr("g");
		for (let i = 1; i <= Math.floor(j/2); i++){
			let p = new Polygon(j,i);
			p.init();
			let g = p.svgComponent(radius);
			let hShift = radius + 2.5*i*radius;
			g.att('transform','translate('+hShift+','+vShift+')');
			row.elem(g);	
		}
		table.elem(row)
	}
	return new SVGWrapper(width,height,table);
}

function doubleChart(limit){
	let radius = sizeRange(limit);
	let height = 2*limit*radius*3;
	let width = height/2;

	let table = new Bldr("g");
	for(let j = 3; j < limit; j++){
		let vShift = radius +2.5*(j-3)*radius;
		let row = new Bldr("g");
		for (let i = 1; i <= Math.floor(j/2); i++){
			let p = new Polygon(j,i);
			p.init();
			let g = p.svgComponent(radius);
			let hShift =  2.5*(i-1)*radius;
			g.att('transform','translate('+ (width/2 + hShift) +','+vShift+')');
			row.elem(g);
			
			let p2 = new Polygon(j,i);
			p2.init();
			let g2 = p2.svgComponent(radius);
			g2.att('transform','translate('+ (width/2 - hShift )+','+vShift+')');
			row.elem(g2);
				
		}
		table.elem(row)
	}
	return new SVGWrapper(width,height,table);
}

function diamondChart(limit){
	let radius = sizeRange(limit)/2;
	let height = 2*limit*radius*2.5;
	let width = height/1.5;

	let table = new Bldr("g");
	for(let j = 3; j < limit; j++){
		let vShift = 2.5*(limit-j-1)*radius;
		
		let row = new Bldr("g");
		for (let i = 1; i <= Math.floor(j/2); i++){
			//upper
			let p = new Polygon(j,i);
			p.init();
			let g = p.svgComponent(radius);
			let hShift =  2.5*(i-1)*radius;
			g.att('transform','translate('+ (width/2 + hShift) +','+ (height/2- vShift)+')');
			row.elem(g);
			
			if (i != 1){
				let p2 = new Polygon(j,i);
				p2.init();
				let g2 = p2.svgComponent(radius);
				g2.att('transform','translate('+ (width/2 - hShift )+',' + (height/2 - vShift) +')');
				row.elem(g2);
			}
			//lower
			if (j != limit -1){
				let p3 = new Polygon(j,i);
				p3.init();
				let g3 = p3.svgComponent(radius);
				g3.att('transform','translate('+ (width/2 + hShift) +','+ (height/2+ vShift)+')');
				row.elem(g3);
			}
			
			if (i != 1 && j != limit -1){
				let p4 = new Polygon(j,i);
				p4.init();
				let g4 = p4.svgComponent(radius);
				g4.att('transform','translate('+ (width/2 - hShift )+',' + (height/2 + vShift) +')');
				row.elem(g4);
			}
			
							
		}
		table.elem(row)
	}
	return new SVGWrapper(width,height,table);
}



function sizeRange(limit){
	if (limit <= 6) return 40;
	if (limit <= 12) return 30;
	if (limit <= 24) return 20;
	if (limit <= 48) return 10;	
	return 5;
}