import './App.css';

import React, {useState, useEffect} from 'react';

import { Table } from "apache-arrow";
import MapWithTable from './Map';
import Preproc from './Preproc';


function App() {
  const [data, setData] = useState();
  
  useEffect(() => {
    const fn = async () => {
      console.log("fetching out.arrow")
      var table = await Table.from(fetch("out.arrow"));
      console.log(table);
      
      setData(table);
      // const dat = [];
      // for (var i = 0; i < N; ++i) {
      //   dat.push(table.get(i).toJSON());
      // }

      // console.log(dat[0]);
    }
    fn();
  }, []);

  return (
    <Preproc 
      data={data}
      haccFilter={65}
    />
  );
}

export default App;
