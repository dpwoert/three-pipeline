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
	var copy = new THREE.ShaderStep(512, 512);

	//setup scene
	var scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );

	//perlin noise as force field
	perlin
		.setting('random', 'f', Math.random())
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('perlinFragment').textContent )
		.runOnce();

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
		.pipe('render', copy)
		.start();

};

document.addEventListener("DOMContentLoaded", startParticles);
