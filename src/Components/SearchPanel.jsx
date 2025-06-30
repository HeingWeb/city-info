import {useEffect, useState} from 'react'
import * as find from "@arcgis/core/rest/find";
import FindParameters from '@arcgis/core/rest/support/FindParameters'
//import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import Graphic from '@arcgis/core/Graphic'


function SearchPanel(props) {  
  const {mapView}=props
  const findUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer";
 
  useEffect(()=>{
     if(mapView){
        mapView.ui.add("searchPanel", "top-left")
     }
  }, [mapView])    

    // Set parameters to only query the Counties layer by name
    const params = new FindParameters({
        layerIds: [0],
        searchFields: ["areaname"],
        returnGeometry: true
    });
  
  const getCities =(e)=>{
      const inputText=document.getElementById("inputTxt");
      let text =inputText.value;
      if(text.trim().length<3)
      {
        alert("Please input at lease 3 letters")
        return;
      }
      params.searchText =text; 
      calciteLoader.hidden = false;
      find.find(findUrl, params).then(showResults).catch(rejectedPromise);
  }
  // Executes each time the promise from find.execute() is rejected.
  const rejectedPromise=(error)=>{
          console.error("Promise didn't resolve: ", error.message);
  }

  const showResults=(response)=>{
          const results = response.results;

          // Clear the cells and rows of the table to make room for new results
          const resultsTable = document.getElementById("tbl");
          resultsTable.innerHTML = "";

          // If no results are returned from the find, notify the user
          if (results.length === 0) {
            resultsTable.innerHTML = "<i>No results found</i>";
            calciteLoader.hidden = true;
            return;
          }
          mapView.graphics.removeAll()
          let graphics=[]

          // Set up row for descriptive headers to display results
          let topRow = resultsTable.insertRow(0);
          let cell1 = topRow.insertCell(0);
          let cell2 = topRow.insertCell(1);
          let cell3 = topRow.insertCell(2);
          let cell4 = topRow.insertCell(3);
          cell1.innerHTML = "<b>City Name</b>";
          cell2.innerHTML = "<b>State Abbreviation</b>";
          cell3.innerHTML = "<b>Population (2000)</b>";
          cell4.innerHTML = "<b>Is state capital?</b>";

          // Loop through each result in the response and add as a row in the table
          results.forEach(function (findResult, i) {
            // Get each value of the desired attributes
            const city = findResult.feature.attributes["AREANAME"];
            const state = findResult.feature.attributes["ST"];
            const pop2000 = findResult.feature.attributes["POP2000"];
            const capital = findResult.feature.attributes["CAPITAL"];

            // Add each resulting value to the table as a row
            const row = resultsTable.insertRow(i + 1);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            let cell4 = row.insertCell(3);
            cell1.innerHTML = city;
            cell2.innerHTML = state;
            cell3.innerHTML = pop2000;
            cell4.innerHTML = capital;       
          
            // add a graphic
            let cityGraphic = new Graphic({
                symbol: {
                    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                    color: [0, 0, 139],
                    outline: {
                        color: [255, 255, 255],
                        width: 1.5
                    }
                }, 
                geometry: {
                    type: "point", // autocasts as new Point()
                    longitude: findResult.feature.geometry.longitude,
                    latitude: findResult.feature.geometry.latitude,
                    spatialReference: mapView.spatialReference
                },
                attributes: findResult.feature.attributes,
                /*
                attributes: {
                    "City Name": findResult.feature.attributes["AREANAME"],
                    "State Abbreviation": findResult.feature.attributes["ST"],
                    "Population (2000)": findResult.feature.attributes["POP2000"],
                    "Is state capital?": findResult.feature.attributes["CAPITAL"]
                },*/
                popupTemplate: {
                    title: "{AREANAME}",
                    content: [
                        {
                            type: "fields",
                            fieldInfos: [
                            {
                                fieldName: "AREANAME",
                                label: "City:"
                            }, 
                            {
                                fieldName: "ST",
                                label: "State:"
                            },
                            {
                                fieldName: "POP2000",
                                label: "Population (2000):",
                                format: {
                                    digitSeparator: true
                                }
                            },
                            {
                                fieldName: "CAPITAL",
                                label: "Is state capital?:"
                            }
                        ]
                        }
                    ]
                }
             });
             graphics.push(cityGraphic);
             mapView.graphics.add(cityGraphic);
          });
          
          mapView.goTo(graphics)
          calciteLoader.hidden = true;
        }
  return (
    <>
    <div className="esri-widget" id="searchPanel">
      Use find on a Map Service to view the population and other information by city name. <br />
      <br />
      Find by City Name:
      <input type="text" id="inputTxt" size="30"/>
      <input type="button" value="Find" onClick={getCities} id="findBtn" />
      <calcite-loader id="calciteLoader" label="loading" type="indeterminate" hidden="true"></calcite-loader>
      <table id="tbl"></table>
    </div>
    </>
   
  )
}

export default SearchPanel