import React, { useEffect, useReducer, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from "@arcgis/core/layers/MapImageLayer"
import { mapReducer, initialState } from './mapReducer';
import SearchPanel from './SearchPanel';

function MapComponent() {
  const [state, dispatch]=useReducer(mapReducer, initialState)  
  const mapref=useRef(null)
  const [mapView, setMapView] = useState(null); 
  useEffect(()=>{
     if(mapref.current){
        /*
        const layer = new FeatureLayer({
          // autocasts as new PortalItem()
          portalItem: {
            id: "234d2e3f6f554e0e84757662469c26d3"
          },
          outFields: ["*"]
        });
        */
       const layer = new MapImageLayer({
        url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer"
        });
        const map = new Map({
          basemap: "gray-vector",
          layers: [layer]
        });

        const view = new MapView({
          container: mapref.current,
          map: map,
          //popupEnabled: true,
           ui: {
            components: ["attribution"] // Only show attribution, exclude "zoom"
          }         
        });
        setMapView(view)
         layer.load().then(() => {
          // Set the view extent to the data extent
          view.extent = layer.fullExtent;
          layer.findSublayerById(0).visible = false;         
        });      
         
           dispatch({ type: 'SET_MAP', payload: map });
            dispatch({ type: 'SET_VIEW', payload: view });
            dispatch({ type: 'SET_LAYER', payload: layer });
        // Clean up the view on component unmount
          return () => {
            if (view) {
              view.destroy();
            }
          };
     }
  }, [mapref])
  return (
    <>
     <div ref={mapref} className='mapView'></div>    
     {mapView && <SearchPanel mapView={mapView} />}     
     </>
  )
}
export default MapComponent