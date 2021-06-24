import React, {useState, useEffect} from "react"
import {v4 as uuidv4} from "uuid"

function ContentArea (props) {
    const [current, setCurrent] = useState([])
    

    useEffect(()=> {
        if (props.loaded) {
            setCurrent(props.myData)
        }
    }, [props.loaded, props.myData, setCurrent])


    const changeElement =  (id, newValue, delElement = false) => {

        console.log(id + newValue)
        let myPos = current.findIndex((e) => e.id === id)
        let myElement = current[myPos]
        console.log(myPos)
        console.log(myElement)
        myElement.value = newValue

        let firstHalf = current.slice(0, myPos)
        let secondHalf = current.slice(myPos + 1)
        if (delElement) {
            if (myElement.label) {
                firstHalf.pop()
            }
            setCurrent(firstHalf.concat(secondHalf))
        }
        else {
            setCurrent(firstHalf.concat([myElement], secondHalf))
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

    return (<div className="Object" style={{display:"flex", flexDirection:"row", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}}>
        {props.label && <LabelDisplay change={props.change} key={props.label.id} id={props.label.id} value={props.label.value}></LabelDisplay>}
        <div className="ObjectContents" style={{display:"flex", flexDirection:"column", backgroundColor:"pink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem", border:"4px solid grey", borderRadius:"1rem"}}>{props.children}</div>
        </div>)
}

function LabelDisplay (props) {

    const [editing, setEditing] = useState(false)
    const [myValue, setMyValue] = useState(props.value)

    if (editing) {
        return (<div className="Label" style={{backgroundColor:"salmon", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}} onBlur={() => {setEditing(false); props.change(props.id, myValue)}} ><input type="text" defaultValue={myValue} onChange={(e) => setMyValue(e.target.value)}></input></div>)
    }
    else {
        return (<div className="Label" style={{backgroundColor:"salmon", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}} onClick={() => setEditing(true)}><p>{myValue}</p></div>)
    }

}

function ValueDisplay (props) {
    const [editing, setEditing] = useState(false)
    const [myValue, setMyValue] = useState(props.value)

    if (editing) {
        return (<div className="Value" style={{display:"flex", alignItems:"center", backgroundColor:"lightpink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}} onBlur={() => {setEditing(false); props.change(props.id, myValue)}} >
            {props.label && <LabelDisplay key={props.label.id} id={props.label.id} value={props.label.value} change={props.change}></LabelDisplay>}
            <input type="text" defaultValue={myValue} onChange={(e) => setMyValue(e.target.value)}></input><p style={{color:"rgb(0,0,255,.5)", margin:"0 1rem"}}>{props.type}</p><div onClick={() => props.change(props.id, myValue, true)}><p style={{color:"crimson"}} >Delete Entry</p></div></div>)
    }
    else {
        return (<div className="Value" style={{display:"flex", alignItems:"center", backgroundColor:"lightpink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}} onClick={() => setEditing(true)} >
            {props.label && <LabelDisplay key={props.label.id} id={props.label.id} value={props.label.value} change={props.change}></LabelDisplay>}
            <p>{myValue}</p><p style={{color:"rgb(0,0,255,.5)", margin:"0 1rem"}}>{props.type}</p></div>)
    }
}

function ArrayDisplay (props) {


    return (<div className="Array" style={{display:"flex", flexDirection:"row", flexWrap:"wrap", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}}>
        {props.label && <LabelDisplay key={props.label.id} id={props.label.id} value={props.label.value} change={props.change}></LabelDisplay>}
        <div className="ArrayContents" style={{display:"flex", flexDirection:"row", backgroundColor:"pink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem", border:"4px solid brown"}}>{props.children}</div></div>)
}

function LineBetween (props) {
    const defaultStyle = {minHeight:"1rem", minWidth:"1rem", transition:"min-height .3s, min-width .3s"}
    const hoverStyle = {minHeight:"2rem", minWidth:"2rem", backgroundColor:"rgb(255,255,255,.3)", transition:"min-height .3s, min-width .3s"}

    const [myStyle, setMyStyle] = useState(defaultStyle)

    return (
        <div onDragOver={(e) => {e.preventDefault(); setMyStyle(hoverStyle)}} onDragLeave={(e) => setMyStyle(defaultStyle)} onDrop={(e) => {console.log(e.dataTransfer.getData("text")); props.insert(e.dataTransfer.getData("text"), props.myBefore, props.first); setMyStyle(defaultStyle)}} className="line" style={myStyle}></div>
    )

}

export default ContentArea;

