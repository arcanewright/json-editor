import React, {useState, useEffect} from "react"

function ContentArea (props) {
    const [current, setCurrent] = useState([])
    

    useEffect(()=> {
        if (props.loaded) {
            setCurrent(props.myData)
        }
    }, [props.loaded, props.myData, setCurrent])

    const displayElements = (topParent = "1") => {
        let result = []

        let topLevel = current.filter(el => {return el.parent === topParent})

        for (const el of topLevel) {
            let label = topLevel.find((e) => e.type === "label" && e.id === el.label)

            if (el.type === "object") {
                result.push(<ObjectDisplay key={el.id} label={label}>{displayElements(el.id)}</ObjectDisplay>)
            }
            if (el.type === "array") {
                result.push(<ArrayDisplay key={el.id} label={label}>{displayElements(el.id)}</ArrayDisplay>)
            }
            if (el.type === "number" || el.type === "string" || el.type === "boolean") {
                result.push(<ValueDisplay key={el.id} value={el.value} label={label}></ValueDisplay>)
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

const style = {display:"flex", flexDirection:"row", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}

function ObjectDisplay (props) {

    return (<div className="Object" style={style}>
        {props.label && <LabelDisplay key={props.label.id} value={props.label.value}></LabelDisplay>}
        <div className="ObjectContents" style={{display:"flex", flexDirection:"column", backgroundColor:"pink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem", border:"4px solid grey"}}>{props.children}</div>
        </div>)
}

function LabelDisplay (props) {


    return (<div className="Label" style={{backgroundColor:"salmon", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}}><p>{props.value}</p></div>)
}

function ValueDisplay (props) {


    return (<div className="Value" style={{display:"flex", alignItems:"center", backgroundColor:"lightpink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}}>
        {props.label && <LabelDisplay key={props.label.id} value={props.label.value}></LabelDisplay>}
        <p defaultValue={props.value}>{props.value}</p></div>)
}

function ArrayDisplay (props) {


    return (<div className="Array" style={{display:"flex", flexDirection:"row", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem"}}>
        {props.label && <LabelDisplay key={props.label.id} value={props.label.value}></LabelDisplay>}
        <div className="ArrayContents" style={{display:"flex", flexDirection:"row", backgroundColor:"pink", height:"content", width:"content", padding:".2rem 1rem", margin:".2rem 1rem", border:"4px solid brown"}}>{props.children}</div></div>)
}

export default ContentArea;

