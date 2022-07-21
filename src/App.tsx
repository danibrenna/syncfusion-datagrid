import './App.css';
import {GridComponent, ColumnsDirective, ColumnDirective, Page, Inject, Filter, Group, Toolbar, ColumnChooser, PageSettingsModel, ToolbarItems} from "@syncfusion/ej2-react-grids";
import { useEffect, useRef, useState } from 'react';

const API_URL = 'https://services.odata.org/TripPinRESTierService/(S(hespbvdrrmhquk5vqlzcpbro))/People';
const MALE_ICON = <span>&#9794;</span>
const FEMALE_ICON = <span>&#9792;</span>

const cellTemplate = (props:any) => {
  let result:any;
  let currentColumn = props.column.field;
  let currentValue:string[] | string | number = props[currentColumn];
  switch (currentColumn) {
    case "Gender": 
      if (currentValue === "Male") {
        result = MALE_ICON;
      } else {
        result = FEMALE_ICON;
      }
      break;
    case "Emails":
      if (Array.isArray(currentValue) && currentValue.length === 0) {
        result = '--';
      } else if (currentValue instanceof Array){
        result = (<ul>
          {currentValue.map(r=>{
            return <li>{r}</li>
          })}
        </ul>)
      }
      break;
    default:
      if (Array.isArray(currentValue) && currentValue.length === 0) {
        result = '--';
      } else if (currentValue && currentValue !== "") {
        result = currentValue;
      } else {
        result = '--';
      }
      break;
  }
  return result;
}

function App() {
  const [loading, isLoading] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);
  const [list, setList] = useState(null);
  const [error, setError] = useState<string|null>(null);
  const pageSettings:PageSettingsModel =  { pageSize: 5 };
  const grid = useRef({} as GridComponent | null);
  const toolbarOptions: ToolbarItems[] = ['ColumnChooser'];

  useEffect( () => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `This is an HTTP error: The status is ${response.status}`
          );
        }
        return response.json();
      })
      .then((result) => {
        setList(result.value);
      })
      .catch(err=>{
        setError("There is a problem fetching the data, try refresh page")
      })
      .finally(()=>{
        isLoading(false)
      })
  }, [])

  const toggleGrid = () => {
    setGridVisible(!gridVisible);
  }

  const genderFilterTemplate = () => {
    return (
      <div key="genderFilter" style={{display: "flex"}}>
        <button key="male-filter" style={{marginRight: 10}} onClick={()=>onChangeGender("Male")}>{MALE_ICON}</button>
        <button key="female-filter" onClick={()=>onChangeGender("Female")}>{FEMALE_ICON}</button>
      </div>
    )
  }

  const onChangeGender = (value: string) => {
    if (grid) {
      grid.current?.filterByColumn('Gender', 'equal', value);
    }
  }

  return (
    <div>
      {loading ?
        <span>Caricamento in corso</span>
        :
        error ?
          <div>{`There is a problem fetching the data - ${error}`}</div>
          :
          <div style={{alignItems: "center", alignContent: "center", display: "flex", flexDirection: "column", marginTop: 100}}>
            <button onClick={toggleGrid}>{gridVisible ? "HIDE TABLE" : "SHOW TABLE"}</button>
            {gridVisible &&
              <GridComponent 
                ref={g => grid.current = g}
                dataSource={list || []} 
                toolbar={toolbarOptions}
                allowPaging 
                allowFiltering 
                pageSettings={pageSettings} 
                showColumnChooser 
                style={{marginTop: 20}}
                >
                <ColumnsDirective> 
                  <ColumnDirective field="FirstName" textAlign='Left' template={cellTemplate} width={100} /> 
                  <ColumnDirective field="LastName" template={cellTemplate} width={100} /> 
                  <ColumnDirective field="Gender" template={cellTemplate} filterTemplate={genderFilterTemplate} width={100} /> 
                  <ColumnDirective field="Age" template={cellTemplate} width={100} /> 
                  <ColumnDirective field="Emails" template={cellTemplate} width={100} /> 
                </ColumnsDirective> 
                <Inject services={[Page, Filter, Group, Toolbar, ColumnChooser]}/>
              </GridComponent>
            }
            
          </div>
          
      } 
    </div>
  );
}

export default App;
