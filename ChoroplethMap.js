function ChoroplethMap() {
   // variables for svg (canvas)
   let width = 1000;
   let height = 700;
   let padding = 60;
   let svg = d3.select('body').append('svg');    // appends svg element to body
   // variables for tooltip
   let tooltip = d3.select('body').append('div')  // appends tootip element to body
   // variables for chart
   let legend = d3.select('svg').append('svg').attr('id', 'legend')  // appends svg#legend element to svg canvas
   // variables for chart legend
   let legendKeys = []
   // variables for JSON data
   let educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
   let countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
   let educationData = [];
   let countyData = [];

   // function to draw svg (canvas)
   let drawCanvas = () => {
      svg.attr('id', 'canvas')
         .attr('width', width)
         .attr('height', height);
   }

   let generateChartDescribtion = (titleLocationX, titleLocationY) => {
      d3.select('svg')
         .append('text')
         .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014). Source: USDA Economic Research Service")
         .attr('id', 'description')
         .attr('href', "https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx")
         .attr('x', padding)
         .attr('y', height - padding);
   }
// <p id="description" style="color: white"><a href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx">USDA Economic Research Service</a></p>

   // Drawcounties (map) function
   let drawCounties = () => {
      svg.selectAll('path')
         .data(countyData)
         .enter()
         .append('path')
         .attr('d', d3.geoPath())
         .attr('class', 'county')
         .attr('fill', (countyDataItem) => {
            let id = countyDataItem['id']
            let county = educationData.find((item) => item['fips'] === id)
            let percent = county['bachelorsOrHigher']
            return colorScale2(percent)
         })
         .attr('data-fips', (countyDataItem) => countyDataItem['id'])
         .attr('data-education', (countyDataItem) => {
            let id = countyDataItem['id']
            let county = educationData.find((item) => item['fips'] === id)
            return county['bachelorsOrHigher']
         })
         .on('mouseover', mouseover)
         .on('mousemove', mousemove)
         .on('mouseleave', mouseleave);
   }

   // Generate-Tooltip function (info @: https://d3-graph-gallery.com/graph/interactivity_tooltip.html)
   let generateTooltip = () => {
      tooltip
         .attr('class', 'tooltip')
         .attr('id', 'tooltip')
         .style('opacity', 0)
         .style('width', 'auto')
         .style('height', 'auto');
   }
   let mouseover = (event, countyDataItem) => {
      tooltip
         .style('opacity', 0.9)
         .attr('data-education', () => {
            let id = countyDataItem['id']
            let county = educationData.find((item) => item['fips'] === id)
            return county['bachelorsOrHigher']
         })
   }
   let mousemove = (event, countyDataItem) => {
      tooltip
         .html( () => {
            let id = countyDataItem['id']
            let county = educationData.find((item) => item['fips'] === id)
            return county['area_name'] + ', ' + county['state'] + ': ' + county['bachelorsOrHigher'] + '%'
         })
         .style('left', event.pageX + 20 + 'px')
         .style('top', event.pageY - 20 + 'px');
   }
   let mouseleave = () => {
      tooltip
         .style('opacity', 0);
   }

   let colorScale1 = d3.scaleOrdinal()
      .domain([3, 12, 21, 30, 40, 50, 60, 70])
      .range(['lightcyan', 'paleturquoise', 'aquamarine', 'turquoise', 'mediumturquoise', 'darkturquoise', 'cadetblue', 'steelblue']);

   let colorScale2 = (item) => {
      if(item <= 3) {
         return 'rgb(231, 244, 237 )'
      } else if(item <= 12) {
         return 'rgb(206, 232, 218)'
      } else if(item <= 21) {
         return 'rgb(180, 218, 198)'
      } else if(item <= 30) {
         return 'rgb(150, 202, 175)'
      } else if(item <= 40) {
         return 'rgb(115, 179, 145)'
      } else if(item <= 50) {
         return 'rgb(85, 156, 119)'
      } else if(item <= 60) {
         return 'rgb(52, 132, 90)'
      } else {
         return 'rgb(16, 82, 47)'
      }
   }

   // GENERATE LEGEND (info: https://d3-graph-gallery.com/graph/custom_legend.html)
   legendKeys = [3, 12, 21, 30, 40, 50, 60, 61]
   let generateLegend = () => {
      // // Add one bar in the legend for each legend item.
      let size = padding /2
      legend.selectAll('mybars')
         .data(legendKeys)
         .enter()
         .append('rect')
            .attr('class', 'legend')
            .attr('x', (d, i) => width /2 + i*(size + 3)) // size+3 is the distance between symbols
            .attr('y', height - (2 * padding)) 
            .attr('width', size)
            .attr('height', size)
            .attr("fill", (d) => colorScale2(d));
      // Add one label in the legend for each item.
      legend.selectAll("mylabels")
         .data(legendKeys)
         .enter()
         .append("text")
            .attr("x", (d, i) => width /2 + i*(size + 3))
            .attr("y", height - (2 * padding) - padding/5)
            .text((d) => {
               if(d === 3) {
                  return '<3%'
               } else if (d === 61) {
                  return '>60%'
               } else {
                  return d + '%'
               }
            })
            .attr("text-anchor", "right")
            .style("alignment-baseline", "middle")
            .style('font-size', '12px');
   }

   let getDataClickHandler = () => {
      d3.json(educationURL).then(
         (data, error) => {
            if(error){
               console.log(log)
            }else {
               educationData = data
               //console.log(educationData)

               d3.json(countyURL).then(
                  (data, error) => {
                     if(error) {
                        console.log(log)
                     }else {
                        countyData = topojson.feature(data, data.objects.counties).features   // convert the topology data into geoJSON format
                        //console.log(countyData)
                     }
                  }
               )
            }
         }
      ); 
   }

   let generateMapClickHandler = () => {
      drawCanvas();
      drawCounties();
      generateLegend();
      generateTooltip();
      generateChartDescribtion();
   }

   return (
      <div>
         <button className={"button"} onClick={getDataClickHandler}>Get Data</button>
         <button className={"button"} onClick={generateMapClickHandler}>Generate Map</button>
      </div>
   )

}