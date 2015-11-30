var startParticles = function(){

	var width = window.innerWidth;
	var height = window.innerHeight;
	var size = 1024 * 2;

	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0x000000, 1 );
	renderer.setSize(width, height);

	//add DOM element
	var canvas = document.getElementById('canvas');
	canvas.appendChild( renderer.domElement );

	//create needed elements
	var renderManager = new THREE.renderPipeline(renderer);
	var perlin = new THREE.ShaderStep(size, size);
	var velocity = new THREE.ShaderStep(size, size);
	var position = new THREE.ShaderStep(size, size);
	var render = new THREE.ShaderStep(width, height);

	//setup scene
	var scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 400 );
	camera.position.set(20,20,35);

	// create controls
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.2;
	controls.rotateSpeed = 0.2;
	controls.autoRotate = true;
	controls.autoRotateSpeed = -0.1;
	controls.target.set(0,0,0);

	//create particles
	// var size = width;
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
		.setting('scale', 'f', 1 )
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
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('velocityFragment').textContent )

	//position
	position
		.link(velocity, 'texVelocity')
		.link(perlin, 'texPerlin')
		.import(function(x,y){
			return [(x/512) * 255, (y/512) * 255, 0, 255];
		})
		.setting('speed','f', 2.0)
		.shader('vertex', document.getElementById('simpleVertex').textContent )
		.shader('fragment', document.getElementById('positionFragment').textContent )

	//render particles to screen
	render
		.link(position, 'texPosition')
		.link(velocity, 'texVelocity')
		.geometry(geometry)
		.mesh(THREE.Points)
		.camera(camera)
		.shader('vertex', document.getElementById('renderVertex').textContent )
		.shader('fragment', document.getElementById('renderFragment').textContent )
		.renderToScreen();

	//init fn
	var init = new THREE.ProcessStep(function(){

		render.public.mesh.material.transparent = true;

	}, { runOnce: true });

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
		.pipe('init', init)
		.pipe('controls', controls.update.bind(controls))
		.pipe('perlinShader', perlin)
		.pipe('velocity', velocity)
		.pipe('position', position)
		.pipe('render', render)
		.start();

};

document.addEventListener("DOMContentLoaded", startParticles);
