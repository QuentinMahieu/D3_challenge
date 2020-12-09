//chart set ups
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 20,
    bottom:90,
    left:100
}
var chartWidth = svgWidth - margin.right - margin.left;
var chartHeight = svgHeight - margin.top - margin.bottom;

//creates the svg wrapper and the chartgroup
var svg = d3.select('#scatter')
            .append('svg')
            .attr('width',svgWidth)
            .attr('height',svgHeight);

var chartGroup = svg.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

//Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
//create Scales function
function xScale(data,key){
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[key])-0.5,
        d3.max(data, d => d[key])+0.5])
    .range([0,chartWidth]);
    return xLinearScale;
};
function yScale(data,key){
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[key])-1,d3.max(data, d => d[key])+1.1])
    .range([chartHeight,0]);
    return yLinearScale;
};
//create Axis function
function xAxes(xScale,xAxis){
    var bottomAxis = d3.axisBottom(xScale).ticks(12);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
function yAxes(yScale,yAxis){
    var leftAxis = d3.axisLeft(yScale).ticks(12);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
//render circle and text function
function renderCircles(circles, xLinearScale, chosenXAxis,yLinearScale,chosenYAxis) {
    circles.transition()
      .duration(1000)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]));
    return circles;
  }
function renderTextCircles(textCirlces, xLinearScale, chosenXAxis,yLinearScale,chosenYAxis) {
    textCirlces.transition()
      .duration(1000)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]-0.2));
    return textCirlces;
  }
// update tooltip function
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;
    var ylabel;
    if (chosenXAxis === "poverty") {
      xlabel = "Poverty:";
      var percent = "%";
    }else if(chosenXAxis === "age") {
      xlabel = "Median Age:";
      var percent = '';
    }else{ 
      xlabel = "Median Income:";
      var percent = '';
    }
    if (chosenYAxis === 'healthcare'){
        ylabel = "Healthcare:";
    }else if(chosenYAxis === "smokes") {
        ylabel = "Smokes:";
    }else{ 
        ylabel = "Obesity:";
    }
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([40, 70])
        .html(function(d){
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}${percent}<br>${ylabel} ${d[chosenYAxis]}%`);
    });
    circlesGroup.call(tip);
    circlesGroup.on('mouseover', function(d) {
        tip.show(d, this);
    })
    .on('mouseout', function(d) {
        tip.hide(d);
    }); 
    return circlesGroup;
}
//import and bind the data
d3.csv('assets/data/data.csv').then((data,error)=>{
    if (error) throw error;
    //Format the data
    data.forEach((d)=>{
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        d.income = +d.income;
        d.age = +d.age;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
    });
///creates the initial chart/////////
    // creates scales
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis])-0.5,
        d3.max(data, d => d[chosenXAxis])+0.5])
    .range([0,chartWidth]);
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis])-1,
        d3.max(data, d => d[chosenYAxis])+1.1])
    .range([chartHeight,0]);
    //creates the axis
    var bottomAxis = d3.axisBottom(xLinearScale).ticks(12);
    var leftAxis = d3.axisLeft(yLinearScale).ticks(12);
    //append axes
    var xAxis = chartGroup.append('g')
        .attr("transform",`translate(0,${chartHeight})`)
        .call(bottomAxis);
    var yAxis = chartGroup.append("g")
    .call(leftAxis);  
    // append circles
    var circlesGroups = chartGroup.selectAll("g circle")
      .data(data)
      .enter()
      .append("g");

    var circles = circlesGroups.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "10")
      .attr("fill", "#69b3a2")
      .attr("opacity",0.7)
      .attr("stroke-width", "1")
      .attr("stroke", "black");
    // append text
    var textCirlces = circlesGroups.append('text')
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]-0.2))
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr('text-anchor',"middle")
      .attr("fill", "white");

    //labels
    var xlabelsGroup = chartGroup.append('g')
        .attr('transform',`translate(${chartWidth/2},${chartHeight+20})`);
    var ylabelsGroup = chartGroup.append('g')
        .attr('transform',`translate(${-35},${chartHeight/2})`)
    var poverty = xlabelsGroup.append('text')
        .attr("x",0)
        .attr("y",20)
        .attr("value","poverty")
        .classed('active',true)
        .text("In Poverty (%)"); 
    var age = xlabelsGroup.append('text')
        .attr("x",0)
        .attr("y",40)
        .attr("value","age")
        .classed('inactive',true)
        .text("Age (median)"); 
    var income = xlabelsGroup.append('text')
        .attr("x",0)
        .attr("y",60)
        .attr("value","income")
        .classed('inactive',true)
        .text("Household Income (median)");
    var healthcare = ylabelsGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y',0)
        .attr("value","healthcare")
        .classed("active",true)
        .text("Lacks Healthcare (%)")
    var smokes = ylabelsGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y',-25)
        .attr("value","smokes")
        .classed("inactive",true)
        .text("Smokers (%)")
    var obesity = ylabelsGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y',-50)
        .attr("value","obesity")
        .classed("inactive",true)
        .text("Obesity (%)")
    //initialise tooltip, call the tip and event usage
    updateToolTip(chosenXAxis,chosenYAxis,circlesGroups);
    //label event listener
    xlabelsGroup.selectAll('text')
        .on('click', function(){
        var value = d3.select(this).attr("value");   
        if (value !== chosenXAxis){
            chosenXAxis = value;
            xLinearScale = xScale(data, chosenXAxis);
            xAxis = xAxes(xLinearScale, xAxis);
            circles = renderCircles(circles,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
            textCirlces = renderTextCircles(textCirlces,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis)
            circlesGroups = updateToolTip(chosenXAxis,chosenYAxis,circlesGroups);
            if (chosenXAxis === "age") {
                age
                  .classed("active", true)
                  .classed("inactive", false);
                poverty
                  .classed("active", false)
                  .classed("inactive", true);
                income
                  .classed("active", false)
                  .classed("inactive", true);
            }else if (chosenXAxis === "income"){
                income
                  .classed("active", true)
                  .classed("inactive", false);
                poverty
                  .classed("active", false)
                  .classed("inactive", true);
                age
                  .classed("active", false)
                  .classed("inactive", true);
            }else {
                age
                  .classed("active", false)
                  .classed("inactive", true);
                poverty
                  .classed("active", true)
                  .classed("inactive", false);
                income
                  .classed("active", false)
                  .classed("inactive", true);
              }
        }
    });
    ylabelsGroup.selectAll('text')
        .on('click', function(){
        var value = d3.select(this).attr("value");   
        if (value !== chosenYAxis){
            chosenYAxis = value;
            yLinearScale = yScale(data, chosenYAxis);
            yAxis = yAxes(yLinearScale, yAxis);
            circles = renderCircles(circles,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
            textCirlces = renderTextCircles(textCirlces,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis)
            circlesGroups = updateToolTip(chosenXAxis,chosenYAxis,circlesGroups);
            if (chosenYAxis === "smokes") {
                smokes
                  .classed("active", true)
                  .classed("inactive", false);
                healthcare
                  .classed("active", false)
                  .classed("inactive", true);
                obesity
                  .classed("active", false)
                  .classed("inactive", true);
            }else if (chosenXAxis === "obesity"){
                obesity
                  .classed("active", true)
                  .classed("inactive", false);
                healtcare
                  .classed("active", false)
                  .classed("inactive", true);
                smokes
                  .classed("active", false)
                  .classed("inactive", true);
            }else {
                smokes
                  .classed("active", false)
                  .classed("inactive", true);
                healthcare
                  .classed("active", true)
                  .classed("inactive", false);
                obesity
                  .classed("active", false)
                  .classed("inactive", true);
              }
        }
        });
}).catch(function(error) {
    console.log(error);
  });
