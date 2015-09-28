var BASE = 256;
var encode = function(value, scale) {
    var b = BASE;
    value = value * scale + b * b / 2;
    var pair = [
        Math.floor((value % b) / b * 255),
        Math.floor(Math.floor(value / b) / b * 255)
    ];
    return pair;
}

var decode = function(pair, scale) {
    var b = BASE;
    return (((pair[0] / 255) * b +
             (pair[1] / 255) * b * b) - b * b / 2) / scale;
}

var startParticles = function(){

	var width = window.innerWidth;
	var height = window.innerHeight;

	width = 512;
	height = 512;

	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0x000000, 1 );
	renderer.setSize(width, height);

	//add DOM element
	var canvas = document.getElementById('canvas');
	canvas.appendChild( renderer.domElement );

	//create needed elements
	var renderManager = new THREE.renderPipeline(renderer);
	var perlin = new THREE.ShaderStep(512, 512);
	var velocity = new THREE.ShaderStep(512, 512);
	var position = new THREE.ShaderStep(512, 512);
	var render = new THREE.ShaderStep(512, 512);
	var copy = new THREE.ShaderStep(512, 512);

	//setup scene
	var scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );

	//create particles
	var size = width;
	var geometry = new THREE.BufferGeometry();
	var pos = new Float32Array(size * size * 3);
	for (var x=0; x<size; x++){
		for (var y=0; y<size; y++) {
			var idx = x + y * size;
			pos[3 * idx]   = (x+0.5)/size;       // +0.5 to be at center of texel
			pos[3 * idx+1] = (y+0.5)/size;
			pos[3 * idx+2] = idx/(size*size);    // extra: normalized id
		}
	}
	geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));

	//perlin noise as force field
	perlin
		.setting('random', 'f', Math.random())
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('perlinFragment').textContent )
		.runOnce();

	//velocity
	velocity
		.link(perlin, 'texPerlin')
		.link(position, 'texPos')
		.import(function(){
			return [127.5, 127.5, 0, 255];
		})
		.setting('initial', 'f', 1.0)
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('velocityFragment').textContent )

	//position
	position
		.link(velocity, 'texVelocity')
		.import(function(x,y){
			// var x = encode(x, 512);
			// var y = encode(y, 512);
			// return [x[0], x[1], y[0], y[1]];
			return [(x/512) * 255, (y/512) * 255, 0, 255];
		})
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('positionFragment').textContent )

	render
		.link(position, 'texPosition')
		.link(velocity, 'texVelocity')
		.geometry(geometry)
		.mesh(THREE.PointCloud)
		.shader('vertex', document.getElementById('renderVertex').textContent )
		.shader('fragment', document.getElementById('renderFragment').textContent )

	copy
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('copyFragment').textContent )
		.pipe()
		.renderToScreen();

	//space bar to reset
	document.body.onkeyup = function(e){

		if(e.keyCode == 32){

			perlin
				.setting('random', 'f', Math.random())
				.runOnce();

		}

	};

	//make pipeline
	renderManager
		.pipe('perlinShader', perlin)
		.pipe('velocity', velocity)
		.pipe('position', position)
		.pipe('render', render)
		.pipe('save', copy)
		.start();

	window.setTimeout(function(){
		velocity.setting('initial', 'f', 0.0);
	})

};

document.addEventListener("DOMContentLoaded", startParticles);
