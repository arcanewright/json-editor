import './App.css';
import ContentArea from "./ContentArea"
import {useEffect, useState} from "react"
import {v4 as uuidv4} from "uuid"

function App() {
  const [dataArray, setDataArray] = useState([]) //where the final data lives
  const [title, setTitle] = useState("") //the file's title
  const [dataLoaded, setDataLoaded] = useState(false) //checks if data was successfully read
  const [globError, setGlobError] = useState(false) //if there is a problem exporting
  const [showDownload, setShowDownload] = useState(false) //show the download box
  const [downloadURL, setDownloadURL] = useState("") //the download url

  //convert an uploaded file to ussable data
  const fileToJSON = (file) => {
    setTitle(file.name)
    let reader = new FileReader();
    reader.onloadend = (e) => continueToJSON(e.target.result)
    reader.readAsText(file)
  }

  useEffect(()=> {
    return function cleanUp() {
      URL.revokeObjectURL(downloadURL)
    }
  })

  const continueToJSON = (jstring) => {
    let object = JSON.parse(jstring)
    createDataFromJSON(object)
  }

  const createDataFromJSON = (jsonObj) => {
    let result = getDataFromEntry(jsonObj, "1")
    setDataArray(result)
    setDataLoaded(true)
  }

  //takes the json object and breaks it down recursively, based on type, into descriptive components

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

  //attempts to export data, and creates the blob and its url
  
  const exportData = () => {
    
    if (!(dataArray.find(e=> e.parent === "1"))) {
      alert("Cannot export an empty workspace!")
    }
    else {
      let obj = getEntriesFromData(dataArray.find(e=> e.parent === "1").id, "object")
      let str = JSON.stringify(obj, null, "\t")
      console.log(str)
      let blobby = new Blob([str], {type: 'application/json'})
      let bloburl = URL.createObjectURL(blobby)
      setShowDownload(true)
      setDownloadURL(bloburl)
      
    }
  }

  // this recursively pulls the entries in the data array, and turns them into their parents children (either an object or array)

  const getEntriesFromData = (parentID, parentType) => {
    let children = dataArray.filter((e)=> e.parent === parentID)
    let result
    if (parentType === "array") {
      result = []
      for (const child of children) {
        if (child.type === "array" || child.type === "object") {
          result.push(getEntriesFromData(child.id, child.type))
        }
        else {
          if (child.type === "string") {
            result.push(child.value)
          }
          else if (child.type === "number") {
            result.push(Number(child.value))
            if (isNaN(Number(child.value))) {
              alert("Number Type Error at " + child.value + " (not a number)")
              setGlobError(true)
            }
          }
          else if (child.type === "boolean") {
            if (child.value === "true") {
              result.push(true)
            }
            else if (child.value === "false") {
              result.push(false)
            }
            else {
              result.push(null)
              alert("Boolean Type Error at "+ child.value + " (not true or false)")
              setGlobError(true)
            }
          }
        }
      }
    }
    else if (parentType === "object") {
      result = {}
      let independents = children.filter((el) => el.type !== "label")
      for (const child of independents) {
        let label = children.find((e) => e.type === "label" && e.id === child.label)
        if (child.type === "array" || child.type === "object") {
          result[label.value] = getEntriesFromData(child.id, child.type)
        }
        else {
          if (child.type === "string") {
            result[label.value] = child.value
          }
          else if (child.type === "number") {
            result[label.value] = Number(child.value)
            if (isNaN(Number(child.value))) {
              alert("Number Type Error at "+ label.value + " : " + child.value + " (not a number)")
              setGlobError(true)
            }
          }
          else if (child.type === "boolean") {
            if (child.value === "true") {
              result[label.value] = true
            }
            else if (child.value === "false") {
              result[label.value] = false
            }
            else {
              result[label.value] = null
              alert("Boolean Type Error at "+ label.value + " : " + child.value + " (not true or false)")
              setGlobError(true)
            }
          }
        }
      }
    }

    return result;
  }

  return (
    <div className="App">
      <TopBar toSetTitle={setTitle} title={title} toSetFile={fileToJSON} toExport={exportData} toShowDownload={setShowDownload} boolDownload={showDownload} downurl={downloadURL} expError={globError} toChangeErr={setGlobError} newDoc={() => createDataFromJSON({})}></TopBar>
      <div className="topbuffer" style={{width:"100%", height:"10rem"}}></div>
      <ContentArea myData={dataArray} loaded={dataLoaded} updateData={(el)=> {setDataArray(el)}}></ContentArea>
      
    </div>
  );
}



//Menu/tool bar 

function TopBar (props) {

  const [showUploadAlert, setShowUploadAlert] = useState(false) //Display the upload alert or not
  const [showUploadError, setShowUploadError] = useState(false) //SHow an error after a failed upload
  const [showMenu, setShowMenu] = useState(false) // show the side menu (Info)

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

  const tryCreateNew = () => { // for the "Create New" button
    props.newDoc()
  }

  return (
    <div className="TopBar" style={{display:"flex", alignItems:"center", backgroundColor: 'ghostwhite', position:"fixed", width:"100vw"}}>
      <div className="title" style={{margin:"0 1rem", padding:"0 1rem"}}><h2>JSON Editor</h2></div>
      <div className="import" style={{margin:"0 1rem", padding:"0 1rem"}}><button onClick={(e) => setShowUploadAlert(true)}>Import JSON</button></div>
      <div className="export" style={{margin:"0 1rem", padding:"0 1rem"}}><button onClick={(e) => props.toExport()}>Export JSON</button></div>
      <div className="createNew" style={{margin:"0 1rem", padding:"0 1rem"}}><button onClick={() => tryCreateNew()}>Create New</button></div>
      <div className="toolset" style={{display:"flex", flexDirection:"row", width:"content"}}>
        <Tool type="object" tooltip="Object" icon="O"></Tool>
        <Tool type="array" tooltip="Array" icon="A"></Tool>
        <Tool type="string" tooltip="String" icon="S"></Tool>
        <Tool type="number" tooltip="Number" icon="N"></Tool>
        <Tool type="boolean" tooltip="Boolean" icon="B"></Tool>
      </div>
      <div className="docTitle" style={{margin:"0 1rem", padding:"0 1rem"}}><input type="text" onChange={(e) => props.toSetTitle(e.target.value)} style={{backgroundColor:"cornflowerblue", borderRadius:".5rem", padding:"0 .5rem"}} defaultValue={props.title}></input></div>
      
      {showUploadAlert ? <UploadAlert toClose={setShowUploadAlert} toSetFile={tryUploadFile} error={showUploadError}></UploadAlert> : null}
      {props.boolDownload ? <DownloadAlert expError={props.expError} title={props.title} toClose={e => {props.toShowDownload(e); props.toChangeErr(false)}} fileURL={props.downurl}></DownloadAlert> : null}
      {showMenu ? <Menu toClose={setShowMenu}></Menu> : null}
      <div className="openMenuButton" style={{userSelect:'none'}} onClick={(e) => setShowMenu(true)}><h3>Info</h3></div>
    </div>
  )
}

// Component for draggable tool, using HTML 5 Draggables

function Tool (props) {
  return (
    <div className={"tool-holder"}>
      <div className={"tooltip " + props.type + "-tip"}>
        {props.tooltip}
      </div>
      <div className={"tool " + props.type} draggable onDragStart={(e) => e.dataTransfer.setData("text", props.type)} style={{margin:"0 1rem", padding:".5rem 1rem", color:"blueviolet", border:"1px dotted blue", borderRadius:"1rem", backgroundColor:"skyblue"}}>{props.icon}</div>
    </div>
    
  )
}

// Side menu with website and description

function Menu (props) {
  return (
    <div className="menu">
      <div className="GrayedOut" style={{backgroundColor: 'rgba(128, 128, 128, 0.5)', height:"100vh", width:"100vw", position:"fixed", left:0, top:0}} onClick={() => props.toClose(false)}></div>
      <div className="menuarea" style={{backgroundColor: 'ghostwhite', height:"100vh", width:"20rem", position:"absolute", right:"0", top:"0", padding:"1rem"}}>
        <div className="aw"><a style={{textDecoration:"none"}} href="https://www.arcanewright.com/"><h3>ArcaneWright.com</h3></a></div>
        <p>This is a project started and completed in the week of 6/21/2021, completed 6/25/2021.</p>
        <p>This is a JSON Editor. One can import an exisitng json document, or create a new one. Different entries (objects, arrays, strings, numbers, and booleans) can be dragged from the toolbar, and onto the content area. The app builds that information, and allows one to build their own JSON from scratch. </p>
        <p>One can change labels and entires by clicking on them, and making the desired changes. The type system validates entries based on type, and throws a warning when the entry is not correctly typed. When exporting, mistyped entries become <code>null</code>.</p>
        <p>Possible improvements:</p>
        <p>Graphic design, Better click targets, Nicer dragging feel, More options for naming and exporting</p>
      </div>
    </div>
  )
}

// dialog for uploading a file, using both input and draggable files

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

// dialog for displaying the exported JSON file

function DownloadAlert (props) {

  return (
    <div className="DownloadAlert">
      <div className="GrayedOut" style={{backgroundColor: 'rgba(128, 128, 128, 0.5)', height:"100vh", width:"100vw", position:"fixed", left:0, top:0}}>
      </div>
      <div className="DownloadWindow" style={{backgroundColor: 'ghostwhite', height:"content", width:"20rem", position:"absolute", left:"calc(50vw - 10rem)", top:"25vh"}}>
        <div className="closeX" style={{color:"red", userSelect:"none", position:"absolute", right:0, top:0, padding:".5rem 1rem" }} onClick={()=> {URL.revokeObjectURL(props.fileURL); props.toClose(false)}}>X</div>
        {props.expError && <h3 style={{color:"red"}}>Warning: TypeError(s) detected</h3>}
        <div className="padding" style={{height:"2rem"}}></div>
        <a href={props.fileURL} download={props.title}>Download Here</a>
        <div className="padding" style={{height:"2rem"}}></div>
      </div>
    </div>
  )
}

export default App;
