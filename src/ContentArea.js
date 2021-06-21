import React, {useState} from "react"

function ContentArea (props) {

    const display = () => {
        let result = [];
        for (let i = 0; i < props.myData.length; i++) {
            (props.myData[i].value) ? result.push(<p key={props.myData[i].id}>{props.myData[i].value}</p>) : console.log("empty")
        }

        return result;
    }

    return (
        <div className="ContentArea">
            {display()}
        </div>
    )
}

export default ContentArea;

