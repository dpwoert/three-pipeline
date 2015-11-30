THREE.ProcessStep = function(fn, options){

	this.process = {
		active: options.active || true,
		runOnce: options.runOnce || false
	};

	this.create = function(){};
	this.render = fn;

};
