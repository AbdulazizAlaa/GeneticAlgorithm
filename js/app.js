var Individual = function(value){
    if(value) {
        this.value = value;
    }else {
        this.value = [];
        this.random(10);
    }
    this.cost = 0;
    this.probability = 0;
    this.s1 = 0;
    this.s2 = 0;
};

Individual.prototype.random = function(length){
    while(length--){
        this.value.push((Math.random() >= .5) ? 1 : 0);
    }
}

Individual.prototype.getStrComponents = function(){
    var strValue = this.value.join("");
    var s1 = strValue.substring(0, 5);
    var s2 = strValue.substring(5, 10);
    return [s1, s2];  
};

Individual.prototype.getComponents = function(){
    var strValue = this.value.join("");
    var s1 = strValue.substring(0, 5);
    var s2 = strValue.substring(5, 10);
    return [parseInt(s1, 2), parseInt(s2, 2)];  
};

Individual.prototype.calCost = function(s1, s2){
    this.cost = Math.pow(10, 6)-(625-Math.pow((s1-25),2)) * (1600-Math.pow((s2-10),2)) * Math.sin((s1) * Math.PI/10) * Math.sin((s2)*Math.PI/10);
};


var x1 = new Individual([0,0,0,0,0,0,0,0,0,0]);
var x2 = new Individual();
var x3 = new Individual();
var x4 = new Individual();
var x5 = new Individual();

console.log(x1.value.join("").substring(0, 5)+":"+x1.value.join("").substring(5, 10));
console.log(x1.value.join(""));
/*
console.log(x2.value.join(""));
console.log(x3.value.join(""));
console.log(x4.value.join(""));
console.log(x5.value.join(""));
*/

var comp = x1.getComponents();
x1.calCost(25, 16)
console.log(comp[0],x1.cost);
console.log(comp[1]);