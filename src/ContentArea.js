import React, {useState, useEffect} from "react"
import {v4 as uuidv4} from "uuid"
import "./ContentArea.css"

function ContentArea (props) {
    const [current, setCurrent] = useState([])

    useEffect(()=> {
        setCurrent(props.myData)
    }, [props.loaded, props.myData, setCurrent])


    const changeElement =  (id, newValue, delElement = false, type = "") => {

        console.log(id + newValue)
        let myPos = current.findIndex((e) => e.id === id)
        let myElement = current[myPos]
        console.log(myPos)
        console.log(myElement)
        myElement.value = newValue
        if (type) {
            myElement.type = type
        }
        let firstHalf = current.slice(0, myPos)
        let secondHalf = current.slice(myPos + 1)
        if (delElement) {
            if (myElement.label) {
                firstHalf.pop()
            }
            setCurrent(firstHalf.concat(secondHalf))
            props.updateData(firstHalf.concat(secondHalf))
        }
        else {
            setCurrent(firstHalf.concat([myElement], secondHalf))
            props.updateData(firstHalf.concat([myElement], secondHalf))
        }

    }

    const insertElement = (type, elBefore, first) => {

        let resultArray = []
        let position
        let parent
        if (first) {
            parent = elBefore
            position = 0
        }
        else {
            parent = current.find((e) => e.id === elBefore).parent
            position = current.findIndex((e) => e.id === elBefore)
        }
        let myuuid = uuidv4()
        let resultingObj
        if (parent === "1") {
            let labeluuid = uuidv4()
            let label = {type:"label", id:labeluuid, value:"", parent:parent}
            resultArray.push(label)
            resultingObj = {type:type, parent:parent, id:myuuid, value:"", label:labeluuid}
        }
        else if (current.find((e)=> e.id === parent).type === "object") {
            let labeluuid = uuidv4()
            let label = {type:"label", id:labeluuid, value:"", parent:parent}
            resultArray.push(label)
            resultingObj = {type:type, parent:parent, id:myuuid, value:"", label:labeluuid}
        }
        else {
            resultingObj = {type:type, parent:parent, id:myuuid, value:"", label:""}
        }
        resultArray.push(resultingObj)
        console.log(resultArray)
        let firstHalf = current.slice(0, position + 1)
        let secondHalf = current.slice(position + 1)
        let result = firstHalf.concat(resultArray, secondHalf)

        setCurrent(result)
        props.updateData(result)
    }

    const displayElements = (topParent = "1") => {
        let result = []

        let topLevel = current.filter(el => {return el.parent === topParent})
        
        result.push(<LineBetween insert={insertElement} key={topParent + "line at beginning"} myBefore={topParent} first></LineBetween>)

        for (const el of topLevel) {
            let label = topLevel.find((e) => e.type === "label" && e.id === el.label)

            if (el.type === "object") {
                result.push(<ObjectDisplay key={el.id} id={el.id} label={label} change={changeElement}>{displayElements(el.id)}</ObjectDisplay>)
                if (topParent !== "1") {
                    result.push(<LineBetween insert={insertElement} myBefore={el.id} key={el.id + "line after"}></LineBetween>)
                }
            }
            if (el.type === "array") {
                result.push(<ArrayDisplay key={el.id} id={el.id} label={label} change={changeElement}>{displayElements(el.id)}</ArrayDisplay>)
                result.push(<LineBetween insert={insertElement} myBefore={el.id} key={el.id + "line after"}></LineBetween>)
            }
            if (el.type === "number" || el.type === "string" || el.type === "boolean") {
                result.push(<ValueDisplay type={el.type} key={el.id} id={el.id} value={el.value} label={label} change={changeElement}></ValueDisplay>)
                result.push(<LineBetween insert={insertElement} myBefore={el.id} key={el.id + "line after"}></LineBetween>)
            }
        }

        return result;
    }

    return (
        <div className="ContentArea" style={{display:"flex"}}>
            {displayElements()}
        </div>
    )
}

function ObjectDisplay (props) {
    const [deleting, setDeleting] = useState(false)
    let deleteMe
    if (deleting) {
        deleteMe = <div className="deleter" onClick={() => props.change(props.id, "", true, "object")}><button autoFocus style={{color:"crimson", userSelect:"none"}} onBlur={() => setDeleting(false)}>Delete Object</button></div>
    }
    else {
        deleteMe = <div className="deleter" onClick={() => setDeleting(true)} style={{padding:"0 .5rem"}}><p>X</p></div>
    }
    return (<div className="Object" style={{display:"flex", flexDirection:"row", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}}>
        {props.label && <LabelDisplay change={props.change} key={props.label.id} id={props.label.id} value={props.label.value}></LabelDisplay>}
        <div className="ObjectContents" style={{display:"flex", flexDirection:"column", backgroundColor:"pink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem", border:"4px solid grey", borderRadius:"1rem"}}>{props.children}</div>
        {deleteMe}
        </div>)
}

function LabelDisplay (props) {

    const [editing, setEditing] = useState(false)
    const [myValue, setMyValue] = useState(props.value)

    if (editing) {
        return (<div className="Label" style={{backgroundColor:"salmon", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}} onBlur={() => {setEditing(false); props.change(props.id, myValue)}} ><input autoFocus type="text" defaultValue={myValue} onChange={(e) => setMyValue(e.target.value)}></input></div>)
    }
    else {
        return (<div className="Label" style={{backgroundColor:"salmon", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}} onClick={() => setEditing(true)}><p>{myValue}</p></div>)
    }

}

function ValueDisplay (props) {
    const [myValue, setMyValue] = useState(props.value)
    const [editingValue, setEditingValue] = useState(false)
    const [myType, setMyType] = useState(props.type)
    const [editingType, setEditingType] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState(false)
    const checkValueToType = () => {
        if (myType === "number") {
            return !isNaN(Number(myValue))
        }
        else if (myType === "boolean") {
            if (myValue === "true" || myValue === "false") {
                return true
            }
            else {
                return false
            }
        }
        else if (myType === "string") {
            if (typeof myValue === "string") {
                return true
            }
            else {
                return false
            }
        }
        else {
            return false
        }
    }

    const trySet = () => {
        if (checkValueToType(myValue)) {
            props.change(props.id, myValue, false, myType)
            setError(false)
        }
        else {
            props.change(props.id, myValue, false, myType)
            setEditingValue(true)
            setError(true)
        }
    }

    let label
    if (props.label) {
        label = <LabelDisplay key={props.label.id} id={props.label.id} value={props.label.value} change={props.change}></LabelDisplay>
    }
    else {
        label = null
    }

    let content
    if (editingValue) {

        content = <input type="text" defaultValue={myValue} onChange={(e) => setMyValue(e.target.value)} autoFocus onBlur={() => setEditingValue(false)}></input>
    }
    else if (!myValue) {
        content = <p onClick={() => setEditingValue(true)} style={{color:"grey"}}>blank</p>
    }
    else {
        content = <p onClick={() => setEditingValue(true)}>{myValue}</p>
    }

    let errorDisplay
    if (error) {
        errorDisplay = <div className="error"><p>Type Error</p></div>
    }
    else {
        errorDisplay = null
    }

    let deleteMe
    if (deleting) {
        deleteMe = <div className="deleter" onClick={() => props.change(props.id, myValue, true)}><button autoFocus style={{color:"crimson", userSelect:"none"}} onBlur={() => setDeleting(false)}>Delete Entry</button></div>
    }
    else {
        deleteMe = <div className="deleter" onClick={() => setDeleting(true)} style={{padding:"0 .5rem"}}><p>X</p></div>
    }

    let typeInfo
    if (editingType) {
        typeInfo = <select style={{color:"rgb(0,0,255,.5)", margin:"0 1rem"}} value={myType} onChange={(e) => setMyType(e.target.value)} autoFocus onBlur={() => setEditingType(false)}>
            <option value="string">string</option>
            <option value="boolean">boolean</option>
            <option value="number">number</option>
        </select>
    }
    else {
        typeInfo = <p style={{color:"rgb(0,0,255,.5)", margin:"0 1rem"}} onClick={() => setEditingType(true)}>{myType}</p>
    }


    return (<div className="Value" style={{display:"flex", alignItems:"center", backgroundColor:"lightpink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem", userSelect:"initial"}} onBlur={() => {trySet()}} >
        {label} {content} {typeInfo} {errorDisplay} {deleteMe}</div>)
}

function ArrayDisplay (props) {
    
    const [deleting, setDeleting] = useState(false)
    let deleteMe
    if (deleting) {
        deleteMe = <div className="deleter" onClick={() => props.change(props.id, "", true, "array")}><button autoFocus style={{color:"crimson", userSelect:"none"}} onBlur={() => setDeleting(false)}>Delete Array</button></div>
    }
    else {
        deleteMe = <div className="deleter" onClick={() => setDeleting(true)} style={{padding:"0 .5rem"}}><p>X</p></div>
    }

    return (<div className="Array" style={{display:"flex", flexDirection:"row", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem", alignItems:"center", justifyContent:"center"}}>
        {props.label && <LabelDisplay key={props.label.id} id={props.label.id} value={props.label.value} change={props.change}></LabelDisplay>}
        <div className="ArrayContents" style={{display:"flex", flexDirection:"row", flexWrap:"wrap", backgroundColor:"pink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem", border:"4px solid brown"}}>{props.children}</div>
        {deleteMe}
        </div>)
}

function LineBetween (props) {
    const defaultStyle = {minHeight:"1rem", minWidth:"2rem", transition:"min-height .3s, min-width .3s"}
    const hoverStyle = {minHeight:"2rem", minWidth:"2rem", backgroundColor:"rgb(255,255,255,.3)", transition:"min-height .3s, min-width .3s"}

    const [myStyle, setMyStyle] = useState(defaultStyle)

    return (
        <div onDragStart={(e)=> setMyStyle(hoverStyle)} onDragOver={(e) => {e.preventDefault(); setMyStyle(hoverStyle)}} onDragLeave={(e) => setMyStyle(defaultStyle)} onDrop={(e) => {console.log(e.dataTransfer.getData("text")); props.insert(e.dataTransfer.getData("text"), props.myBefore, props.first); setMyStyle(defaultStyle)}} className="line" style={myStyle}></div>
    )

}

export default ContentArea;

