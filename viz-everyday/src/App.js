import './App.css';

import React, {useState, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import GL from '@luma.gl/constants';

import { Table } from "apache-arrow";




const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  // maxZoom: 15,
  pitch: 30,
  // bearing: 30
};

function App() {
  const [data, setData] = useState();
  useEffect(() => {
    const fn = async () => {
      console.log("fetching out.arrow")
      const table = await Table.from(fetch("out.arrow"));
      console.log(table);
      setData(table);
    }
    fn();
    
    // days = {}

    // setData(result.data);
  }, []);
 
  const layers = [
    (!!data && new ScatterplotLayer({
      id: 'scatter',
      data: data,
      getPosition: x => [x["lon"], x["lat"]],
      // radiusMinPixels: 1,
      getRadius: 1,
      getFillColor: [60, 220, 255],
      parameters: {
        // prevent flicker from z-fighting
        [GL.DEPTH_TEST]: false,

        // // turn on additive blending to make them look more glowy
        [GL.BLEND]: true,
        // [GL.BLEND_SRC_RGB]: GL.ONE,
        [GL.BLEND_DST_RGB]: GL.ONE,
        [GL.BLEND_EQUATION]: GL.FUNC_ADD,
      },
    })),
    // new GeoJsonLayer({
    //   id: 'geojson',
    //   data,
    //   stroked: false,
    //   filled: true,
    //   getFillColor: [0, 0, 0, 0],
    //   onClick: ({object}) => selectCounty(object),
    //   pickable: true
    // }),
    // new ArcLayer({
    //   id: 'arc',
    //   data: arcs,
    //   getSourcePosition: d => d.source,
    //   getTargetPosition: d => d.target,
    //   getSourceColor: d => (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
    //   getTargetColor: d => (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
    //   getWidth: strokeWidth
    // })
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <StaticMap reuseMaps mapStyle={BASEMAP.DARK_MATTER} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export default App;
