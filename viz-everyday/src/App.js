import './App.css';

import React, {useState, useMemo} from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';



const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 15,
  pitch: 30,
  bearing: 30
};

function App() {
 
  const layers = [
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
