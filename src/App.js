import './App.css';
import ContentArea from "./ContentArea"
import {useState} from "react"
import {v4 as uuidv4} from "uuid"

function App() {
  const [dataArray, setDataArray] = useState([])
  const [rawFile, setRawFile] = useState("")
  const [rawJSONObj, setRawJSONObj] = useState({abc:"xyz", def:{g:"h", i:"j"}, klm:["n","o","p", "q"]})
  const [dataLoaded, setDataLoaded] = useState(false)

  const fileToJSON = (file) => {
    setRawFile(file)
    let reader = new FileReader();
    reader.onloadend = (e) => continueToJSON(e.target.result)
    reader.readAsText(file)
  }

  const continueToJSON = (jstring) => {
    let object = JSON.parse(jstring)
    setRawJSONObj(object)
    createDataFromJSON(object)
  }

  const createDataFromJSON = (jsonObj) => {
    let result = getDataFromEntry(jsonObj, "1")


    setDataArray(result)
    setDataLoaded(true)
  }

  const getDataFromEntry = (entry, parent, label = "") => {
    let newArray = []
    let myuuid = uuidv4()
    if (Array.isArray(entry)) {
      newArray.push({type:"array", id:myuuid, parent:parent, label:label})
      for (let i = 0; i < entry.length; i++) {
        newArray = newArray.concat(getDataFromEntry(entry[i], myuuid))
      }
    }
    else if (typeof entry === "object") {
      newArray.push({type:"object", id:myuuid, parent:parent, label:label})
      for (const [key, value] of Object.entries(entry)) {
        let labelID = uuidv4()
        newArray.push({type:"label", id:labelID, value:key, parent:myuuid})
        newArray = newArray.concat(getDataFromEntry(value, myuuid, labelID))
      }
    }
    else if (typeof entry === "boolean") {
      newArray.push({type:"boolean", id:myuuid, value: entry.toString(), parent:parent, label:label})
    }
    else if (typeof entry === "number") {
      newArray.push({type:"number", id:myuuid, value: entry.toString(), parent:parent, label:label})
    }
    else if (typeof entry === "string") {
      newArray.push({type:"string", id:myuuid, value: entry, parent:parent, label:label})
    }

    return newArray

  }

  return (
    <div className="App">
      <TopBar toSetFile={fileToJSON}></TopBar>
      <ContentArea myData={dataArray} loaded={dataLoaded}></ContentArea>
      
    </div>
  );
}

function TopBar (props) {

  const [showUploadAlert, setShowUploadAlert] = useState(false)
  const [showUploadError, setShowUploadError] = useState(false)
  const tryUploadFile = (file) => {
    if (file.type.includes("json")) {
      props.toSetFile(file)
      setShowUploadAlert(false)
      setShowUploadError(false)
    }
    else {
      setShowUploadError(true)
    }
  }

  return (
    <div className="TopBar" style={{display:"flex", alignItems:"center", backgroundColor: 'ghostwhite'}}>
      <div className="title" style={{margin:"0 1rem", padding:"0 1rem"}}><h2>JSON Editor</h2></div>
      <div className="import" style={{margin:"0 1rem", padding:"0 1rem"}}><button onClick={(e) => setShowUploadAlert(true)}>Import JSON</button></div>
      <div className="export" style={{margin:"0 1rem", padding:"0 1rem"}}><button>Export JSON</button></div>
      {showUploadAlert ? <UploadAlert toClose={setShowUploadAlert} toSetFile={tryUploadFile} error={showUploadError}></UploadAlert> : null}
    </div>
  )
}
function UploadAlert (props) {

  return (
    <div className="UploadAlert">
      <div className="GrayedOut" style={{backgroundColor: 'rgba(128, 128, 128, 0.5)', height:"100vh", width:"100vw", position:"fixed", left:0, top:0}}>
      </div>
      <div className="UploadWindow" style={{backgroundColor: 'ghostwhite', height:"content", width:"20rem", position:"absolute", left:"calc(50vw - 10rem)", top:"25vh"}}>
        <div className="closeX" style={{color:"red", userSelect:"none", position:"absolute", right:0, top:0, padding:".5rem 1rem" }} onClick={()=> props.toClose(false)}>X</div>
        <input type="file" style={{margin:"1rem"}} onChange={(e) => props.toSetFile(e.target.files[0])}></input>
        {props.error? <h3 style={{color:"red"}}>This is not a JSON file. Please try again.</h3> : null}
        <div className="dragHere" onDrop={(e) => { e.preventDefault(); props.toSetFile(e.dataTransfer.files[0])}} style={{margin:"1rem", height:"4rem", border:"dashed .25rem grey", backgroundColor:"lightgrey"}}>Drag File Here</div>
      </div>
    </div>
  )
}

export default App;
