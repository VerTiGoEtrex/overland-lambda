import './App.css';

import React, {useState, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import GL from '@luma.gl/constants';

import { Table, predicate } from "apache-arrow";




const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  // maxZoom: 15,
  pitch: 30,
  // bearing: 30
};

function MapWithTable({data}) {
  const [isZoomedClose, setIsZoomedClose] = useState(true);
  const layers = [
    (!!data && new ScatterplotLayer({
      id: 'scatter',
      data: data,
      getPosition: x => [x["lon"], x["lat"]],
      radiusMinPixels: 1,
      getRadius: 2,
      getFillColor: [60, 220, 255],
      parameters: {
        // prevent flicker from z-fighting
        // [GL.DEPTH_TEST]: false,

        // // // turn on additive blending to make them look more glowy
        // [GL.BLEND]: true,
        // // [GL.BLEND_SRC_RGB]: GL.ONE,
        // [GL.BLEND_DST_RGB]: GL.ONE,
        // [GL.BLEND_EQUATION]: GL.FUNC_ADD,
      },
      visible: isZoomedClose,
    })),
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      onViewStateChange={(update) => {
        // setIsZoomedClose(update.viewState.zoom > 9)
      }}
    >
      <StaticMap reuseMaps mapStyle={BASEMAP.DARK_MATTER} preventStyleDiffing={true} />
    </DeckGL>
  );
}

function App() {
  const [data, setData] = useState();
  
  useEffect(() => {
    const fn = async () => {
      console.log("fetching out.arrow")
      var table = await Table.from(fetch("out.arrow"));
      console.log(table);
      const col = predicate.col
      console.log("N before filter: ", table.count());
      // Filter out the worst data points
      table = table.filter(col('hacc').lt(65))
      const dat = [];
      const N = table.count();
      console.log("N after filter: ", N);
      setData(table);
      // for (var i = 0; i < N; ++i) {
      //   dat.push(table.get(i).toJSON());
      // }
      // console.log(dat[0]);
      // setData(dat);
    }
    fn();
  }, []);
 
  

  return (
    <MapWithTable data={data}/>
  );
}

export default App;
