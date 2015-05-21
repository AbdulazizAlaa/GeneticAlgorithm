var object = {};
//Individual class
//this represents a chromosome
var Individual = function(data){
    data = (typeof data === 'undefined')? {} : data;
    if(data.value) {
        this.value = data.value;
    }else {
        this.value = [];
        this.random(10);
    }
    this.cost = 0;
    this.probability = 0;
    this.cumulativeProbability = 0;
};

//generates a random individual
Individual.prototype.random = function(length){
    while(length--){
        this.value.push((Math.random() >= .5) ? 1 : 0);
    }
}

//returns two components of the chromosome s1 , s2 as binary strings
Individual.prototype.getStrComponents = function(){
    var strValue = this.value.join("");
    var s1 = strValue.substring(0, 5);
    var s2 = strValue.substring(5, 10);
    return [s1, s2];  
};

//returns two components of the chromosome s1 , s2 as integers
Individual.prototype.getComponents = function(){
    var strValue = this.value.join("");
    var s1 = strValue.substring(0, 5);
    var s2 = strValue.substring(5, 10);
    return [parseInt(s1, 2), parseInt(s2, 2)];  
};

//calculates the fittness of the chromosome at hand
Individual.prototype.calCost = function(s1, s2){
    this.cost = Math.pow(10, 6)-(625-Math.pow((s1-25),2)) * (1600-Math.pow((s2-10),2)) * Math.sin((s1) * Math.PI/10) * Math.sin((s2)*Math.PI/10);
    return this.cost;
};

Individual.prototype.mutate = function(mRatio){
    for(var i=0 ; i<this.value.length ; i++){
        if(Math.random() <= mRatio){
            this.value[i] = (this.value[i] === 1)? 0 : 1;
        }
    }
};

Individual.prototype.mate = function(pivot, individual){
    
    var child1 = this.value.slice(0, pivot).concat(individual.value.slice(pivot, individual.value.length));
    var child2 = individual.value.slice(0, pivot).concat(this.value.slice(pivot, this.value.length));
    
    return [new Individual({value:child1}), new Individual({value:child2})];
};

//population
var Population = function (data){
  
    data = (data === 'undefined')? {} : data;
    
    this.individuals = [];
    for(var i=0; i<5 ; i++)
        this.individuals.push(new Individual());
    
    if(data.mRatio && data.cRatio && data.pivot){
        this.mutationRatio = data.mRatio;
        this.crossoverRatio = data.cRatio;    
        this.crossoverPivot = data.pivot;    
    }else{
        this.mutationRatio = .15;
        this.crossoverRatio = .20;
        this.crossoverPivot = 5;
    }
    
    
};

Population.prototype.selection = function(){
    var totalCost = 0;
    var temp = [];
    
    for(var i=0 ; i<this.individuals.length ; i++){
        var comp = this.individuals[i].getComponents();
        totalCost += this.individuals[i].calCost(comp[0], comp[1]);
    }
    for(var i=0 ; i<this.individuals.length ; i++){
        this.individuals[i].probability = this.individuals[i].cost / totalCost;
        if(i===0){
            this.individuals[i].cumulativeProbability = this.individuals[i].probability;
        }else{
            this.individuals[i].cumulativeProbability += this.individuals[i].probability + this.individuals[i-1].cumulativeProbability;
        }
    }
    for(var i=0 ; i<this.individuals.length ; i++){
        var p = Math.random();
        for(var j=0 ; j < this.individuals.length ; j++){
            if(p <= this.individuals[j].cumulativeProbability){
                temp.push(this.individuals[j]);
                break;
            }
        }
    }
    
    this.individuals = temp;
    
};

Population.prototype.mutation = function(){
    for(var i=0 ; i<this.individuals.length ; i++){
        this.individuals[i].mutate(this.mutationRatio);
    }
};

Population.prototype.crossover = function(){
    var candidates = [];
    var indexs = [];
    var mated = false;
    
    for(var i = 0, j=0 ; i<this.individuals.length ; i++){
        if(Math.random() <= this.crossoverRatio){
            candidates.push(this.individuals[i]);
            indexs.push(i+j);
            j++;
        }
    }
    for(var i=0 ; i<candidates.length ; i++){
        for(var j=i+1 ; j<candidates.length && this.individuals.length < 200; j++){
            var temp = candidates[i].mate(this.crossoverPivot, candidates[j]);
            var comp = temp[0].getComponents();
            temp[0].calCost(comp[0], comp[1]);
            comp = temp[1].getComponents();
            temp[1].calCost(comp[0], comp[1]);
            
            this.individuals.push(temp[0]);
            this.individuals.push(temp[1]);
            mated = true;
        }
        if(mated) this.individuals.splice(indexs[i], 1);
    }
};

Population.prototype.getFittest = function(){
    var fittest = this.individuals[0];
    for(var i=1 ; i<this.individuals.length ; i++){
        if(fittest.cost < this.individuals[i].cost){
            fittest = this.individuals[i];
        }
    }
    return fittest;
};

Population.prototype.advance = function(numGenerations){
    var fittest = this.individuals[0];
    var temp = {};
    var comp = [];
    var fittestList = [];
    
    for(var i=0 ; i<numGenerations ; i++){
        $("#list").append("<hr/>");
        $("#list").append("<h3>Generation: "+i+"</h3>");
        $("#list").append("<hr/>");
        this.selection();
        this.crossover();
        this.mutation();
        for(var j=0 ; j<this.individuals.length ; j++){
            $("#list").append("<li>");
            $("#list").append("<p>Chromosome "+j+": "+this.individuals[j].value.join("")+"</p>");
            comp = this.individuals[j].getComponents();
            $("#list").append("<p>s1: "+comp[0]+", s2: "+comp[1]+"</p>");
            $("#list").append("<p>cost: "+this.individuals[j].cost+"</p>");
            $("#list").append("</li>");
        }
        temp = this.getFittest();
        if(fittest.cost < temp.cost){
            fittest = temp;
        }
        $("#list").append("<li>");
        $("#list").append("<p>Fittest Chromosome : "+fittest.value.join("")+"</p>");
        comp = fittest.getComponents();
        $("#list").append("<p>s1: "+comp[0]+", s2: "+comp[1]+"</p>");
        $("#list").append("<p>cost: "+fittest.cost+"</p>");
        $("#list").append("</li>"); 
        fittestList.push(fittest);
    }
    
    return fittestList;
};

function timing(i, population, fittest, generation, chart){
    console.log("outside"+i);
    setTimeout(function(k, p, f, g, c){
        $("#list").append("<h2>RUN "+k+"</h2>");
        g = p.advance(10);
        console.log("inside"+k);
        for(var j=0 ; j<g.length ; j++){
            f[j] += g[j].cost;
        }
        if(k < 30){
            timing(k+1, p, f, g, c);
        }else{
            for(var j=0 ; j<f.length ; j++){
                f[j] = f[j]/30;
            }
            object = {population: p, fittest: f, generation: g};
                
    
            var data = 
                {
                    labels: ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"],
                    datasets: [
                        {
                            label: "My Second dataset",
                            fillColor: "rgba(151,187,205,0.2)",
                            strokeColor: "rgba(151,187,205,1)",
                            pointColor: "rgba(151,187,205,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(151,187,205,1)",
                            data: f
                        }
                    ]
                };

            var options = 
                {

                    ///Boolean - Whether grid lines are shown across the chart
                    scaleShowGridLines : true,

                    //String - Colour of the grid lines
                    scaleGridLineColor : "rgba(0,0,0,.05)",

                    //Number - Width of the grid lines
                    scaleGridLineWidth : 1,

                    //Boolean - Whether to show horizontal lines (except X axis)
                    scaleShowHorizontalLines: true,

                    //Boolean - Whether to show vertical lines (except Y axis)
                    scaleShowVerticalLines: true,

                    //Boolean - Whether the line is curved between points
                    bezierCurve : true,

                    //Number - Tension of the bezier curve between points
                    bezierCurveTension : 0.4,

                    //Boolean - Whether to show a dot for each point
                    pointDot : true,

                    //Number - Radius of each point dot in pixels
                    pointDotRadius : 4,

                    //Number - Pixel width of point dot stroke
                    pointDotStrokeWidth : 1,

                    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
                    pointHitDetectionRadius : 20,

                    //Boolean - Whether to show a stroke for datasets
                    datasetStroke : true,

                    //Number - Pixel width of dataset stroke
                    datasetStrokeWidth : 2,

                    //Boolean - Whether to fill the dataset with a colour
                    datasetFill : true,

                    //String - A legend template
                    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

                };

                $("#loader").remove();
                var myLineChart = chart.Line(data, options);    

        }
    }, 500, i, population, fittest, generation, chart);
}

$(document).ready(function(){    
    
    var p = new Population({mRatio:.25, cRatio:.15, pivot: 5});
    //console.log(p);
    //p.advance(10);
    var fittest = [0,0,0,0,0,0,0,0,0,0];
    var generation = [];
    
    
    
    //chart
    var canvas = $("#chart").get(0);
    var context = canvas.getContext('2d');
    var chart = new Chart(context);
    Chart.defaults.global = {
        // Boolean - Whether to animate the chart hwa dah el code?? ya zozyyyyyy :D
        animation: true,

        // Number - Number of animation steps
        animationSteps: 60,

        // String - Animation easing effect
        // Possible effects are:
        // [easeInOutQuart, linear, easeOutBounce, easeInBack, easeInOutQuad,
        //  easeOutQuart, easeOutQuad, easeInOutBounce, easeOutSine, easeInOutCubic,
        //  easeInExpo, easeInOutBack, easeInCirc, easeInOutElastic, easeOutBack,
        //  easeInQuad, easeInOutExpo, easeInQuart, easeOutQuint, easeInOutCirc,
        //  easeInSine, easeOutExpo, easeOutCirc, easeOutCubic, easeInQuint,
        //  easeInElastic, easeInOutSine, easeInOutQuint, easeInBounce,
        //  easeOutElastic, easeInCubic]
        animationEasing: "easeOutQuart",

        // Boolean - If we should show the scale at all
        showScale: true,

        // Boolean - If we want to override with a hard coded scale
        scaleOverride: false,

        // ** Required if scaleOverride is true **
        // Number - The number of steps in a hard coded scale
        scaleSteps: null,
        // Number - The value jump in the hard coded scale
        scaleStepWidth: null,
        // Number - The scale starting value
        scaleStartValue: null,

        // String - Colour of the scale line
        scaleLineColor: "rgba(0,0,0,.1)",

        // Number - Pixel width of the scale line
        scaleLineWidth: 1,

        // Boolean - Whether to show labels on the scale
        scaleShowLabels: true,

        // Interpolated JS string - can access value
        scaleLabel: "<%=value%>",

        // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
        scaleIntegersOnly: true,

        // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero: false,

        // String - Scale label font declaration for the scale label
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Scale label font size in pixels
        scaleFontSize: 12,

        // String - Scale label font weight style
        scaleFontStyle: "normal",

        // String - Scale label font colour
        scaleFontColor: "#666",

        // Boolean - whether or not the chart should be responsive and resize when the browser does.
        responsive: false,

        // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio: true,

        // Boolean - Determines whether to draw tooltips on the canvas or not
        showTooltips: true,

        // Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-custom-tooltips))
        customTooltips: false,

        // Array - Array of string names to attach tooltip events
        tooltipEvents: ["mousemove", "touchstart", "touchmove"],

        // String - Tooltip background colour
        tooltipFillColor: "rgba(0,0,0,0.8)",

        // String - Tooltip label font declaration for the scale label
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Tooltip label font size in pixels
        tooltipFontSize: 14,

        // String - Tooltip font weight style
        tooltipFontStyle: "normal",

        // String - Tooltip label font colour
        tooltipFontColor: "#fff",

        // String - Tooltip title font declaration for the scale label
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Tooltip title font size in pixels
        tooltipTitleFontSize: 14,

        // String - Tooltip title font weight style
        tooltipTitleFontStyle: "bold",

        // String - Tooltip title font colour
        tooltipTitleFontColor: "#fff",

        // Number - pixel width of padding around tooltip text
        tooltipYPadding: 6,

        // Number - pixel width of padding around tooltip text
        tooltipXPadding: 6,

        // Number - Size of the caret on the tooltip
        tooltipCaretSize: 8,

        // Number - Pixel radius of the tooltip border
        tooltipCornerRadius: 6,

        // Number - Pixel offset from point x to tooltip edge
        tooltipXOffset: 10,

        // String - Template string for single tooltips
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

        // String - Template string for multiple tooltips
        multiTooltipTemplate: "<%= value %>",

        // Function - Will fire on animation progression.
        onAnimationProgress: function(){},

        // Function - Will fire on animation completion.
        onAnimationComplete: function(){}
    }
    
    timing(0, p, fittest, generation, chart);
    
});

/*hhnjjnbkuhvgyctydr
 history.back.
apply.yagaousaaa= new HTMLTableHeaderCellElement (toz feek, w fe balaweek);


wait
efta7 text balash 8aab2!*/
