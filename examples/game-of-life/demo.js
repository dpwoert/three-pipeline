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
	var game = new THREE.ShaderStep(512, 512);
	var copy = new THREE.ShaderStep(512, 512);

	//setup scene
	var scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );

	//game of life shader
	game
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('gameFragment').textContent )
		.import(function(x,y){
			return Math.random() > 0.5 ? [0,0,0] : [255,255,255];
		});

	copy
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('copyFragment').textContent )
		.pipe()
		.renderToScreen();

	//track mouse
	var cursor = new THREE.Vector2(250,250);
	document.onmousemove = function(e){
		cursor = cursor.set(e.pageX, e.pageY);
	};

	//space bar to reset
	document.body.onkeyup = function(e){

	    if(e.keyCode == 32){

			game.import(function(x,y){
				return Math.random() > 0.5 ? [0,0,0] : [255,255,255];
			});

	    }

	};

	//make pipeline
	renderManager
		.pipe('mouse', function(){
			game.setting('mouse','v2', cursor );
		})
		.pipe('gameShader', game)
		.pipe('render', copy)
		.start();

};

document.addEventListener("DOMContentLoaded", startParticles);
