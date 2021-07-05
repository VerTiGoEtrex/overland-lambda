import { useMemo } from "react";
import MapWithTable from "./Map";
import { predicate } from "apache-arrow";

const col = predicate.col


function Preproc({ data, haccFilter }) {
    const filtered = useMemo(() => {
        if (!data) return null;
        console.log("N before filter: ", data.count());
        // Filter out the worst data points
        const ret = data.filter(col('hacc').lt(haccFilter));
        const N = ret.count();
        console.log("N after filter: ", N);
        return ret;
      }, [data, haccFilter]);
    
      const arrayified = useMemo(() => {
        if (!filtered) return;
        function tableToArr(table) {
          console.log("Arrayifying " + table.count() + " data points")
          const fields = table.schema.fields.map(d => d.name);
          // const columns = fields.map(d => table.getColumn(d));
          let batchColumns = []
          const m = fields.length;
          const ret = [];
          table.scan(
            (index) => {
              const obj = {}
              for (let i = 0; i < m; ++i) {
                obj[fields[i]] = batchColumns[i](index);
              }
              ret.push(obj);
            },
            (batch) => {
              batchColumns = fields.map(name => col(name).bind(batch));
            }
          )
          return ret;
        }
        return tableToArr(filtered);
      }, [filtered])

      return (
          <MapWithTable filtered={filtered} arrayified={arrayified}/>
      )
}

export default Preproc;