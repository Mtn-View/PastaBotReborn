var methods = {
	rolldx : function(x) {
		return Math.ceil(Math.random()*x);
	},
	rollxdy : function(x,y) { //will return array of rolls and sum in an object
		let rolls = new Array();
		let sum = 0;
		for(let i = 0; i < x; i++){
			rolls[i] = this.rolldx(y);
			sum += rolls[i];
		}
		let obj = {
			rolls: rolls,
			sum: sum
		};
		return obj;
	},
	rollxdydropz : function(x,y,z) {
		let rolls = this.rollxdy(x,y).rolls; // Syntax?
		let dropped = new Array();
		let sum = 0;
		
		rolls.sort(); // sort ascending order
		let allRolls = Array.from(rolls);
		for(let i = 0; i < z; i++){
			dropped[i] = rolls.shift(); // moves dropped rolls from 'rolls' to 'dropped'
		}
		//let sum = rolls => rolls.reduce((a,b) => a + b, 0); // how is this supposed to work?
		for(i = 0; i < x-z; i++){
			sum += rolls[i];
		}
		let ret = {
			allRolls: allRolls,
			rolls: rolls,
			dropped: dropped,
			sum: sum
		};
		//console.log(ret);
		return ret;
	},
	rollArray : function(x){ 
		let stats = new Array();
		for(let i = 0; i < x; i++){
			stats[i] = this.rollxdydropz(4,x,1);
		}
		stats.sort((a,b) => (a.sum > b.sum) ? 1 : -1);
		return stats;
	},
};
module.exports = methods;