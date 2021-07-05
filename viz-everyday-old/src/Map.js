import React, { useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';
import { BASEMAP } from '@deck.gl/carto';
import GL from '@luma.gl/constants';
import RangeInput from './range-input';
import _ from 'lodash'

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const INITIAL_VIEW_STATE = {
  longitude: -83.46865309156851,
  latitude: 42.358306398648466,
  zoom: 9.9,
  // maxZoom: 15,
  pitch: 60,
  bearing: 20
};

function MapWithTable({ filtered, arrayified }) {
  const [isZoomedClose, setIsZoomedClose] = useState(true);
  const [currOffset, setCurrOffset] = useState(0);

  const grouped = useMemo(() => {
    if (!arrayified) return null;
    console.log("duping array");
    // const arr = filtered;
    const arr = _.cloneDeep(arrayified);
    console.log("grouping");
    const grouped = arr.reduce((acc, row) => {
      const bucket = Math.floor(row.ts / MS_IN_DAY);
      if (!acc[bucket]) {
        acc[bucket] = [];
      }
      row.tod = row.ts % MS_IN_DAY;
      acc[bucket].push(row);
      return acc;
    }, {});
    console.log("Grouped keys ", Object.keys(grouped).length);
    return grouped;
  }, [arrayified])

  const asArr = useMemo(() => {
    if (!grouped) return null;
    return Object.keys(grouped).map(key => grouped[key]);
  }, [grouped]);

  const tods = useMemo(() => {
    if (!asArr) return null;
    return asArr.map(x => x.map(y => y.tod));
  }, [asArr]);

  const mapped = useMemo(() => {
    if (!tods) return null;
    const b = new Date()
    const ret = tods.map(elts => {
      const idx = _.sortedIndex(elts, currOffset*1000*10)-1;
      return idx < elts.length && idx > 0 && currOffset*1000*10 - elts[idx] < 1000*60*10 ? idx : null;
    }).map((val, idx) => asArr[idx][val]).filter(x => !!x);
    // console.log("computed offsets in: ", new Date() - b);
    return ret;
  }, [tods, asArr, currOffset]);

  const layers = [
    // (!!filtered && new ScatterplotLayer({
    //   id: 'scatter',
    //   data: filtered,
    //   getPosition: x => [x["lon"], x["lat"]],
    //   radiusMinPixels: 1,
    //   getRadius: 2,
    //   getFillColor: [60, 220, 255],
    //   parameters: {
    //     // prevent flicker from z-fighting
    //     // [GL.DEPTH_TEST]: false,

    //     // // // turn on additive blending to make them look more glowy
    //     // [GL.BLEND]: true,
    //     // // [GL.BLEND_SRC_RGB]: GL.ONE,
    //     // [GL.BLEND_DST_RGB]: GL.ONE,
    //     // [GL.BLEND_EQUATION]: GL.FUNC_ADD,
    //   },
    //   visible: isZoomedClose,
    // })),
    (!!mapped && new ScatterplotLayer({
      id: 'scatter',
      data: mapped,
      getPosition: x => [x["lon"], x["lat"]],
      radiusMinPixels: 2,
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
        console.log(update.viewState);
        // setIsZoomedClose(update.viewState.zoom > 9)
      }}
    >
      <RangeInput min={0} max={MS_IN_DAY/1000/10 - 1} value={currOffset} 
        onChange={setCurrOffset} animationSpeed={1} formatLabel={x=>new Date(1000 * 10 * x).toString().substr(16, 8)}/>
      <StaticMap reuseMaps mapStyle={BASEMAP.DARK_MATTER} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export default MapWithTable;