import React, { useState , Component} from 'react';
import Picker from 'emoji-picker-react';
// Styles
import './VideoPlayer.css';
class Reaction extends Component {
// const Reaction = () => {

    constructor(props) {
        super(props);
        this.state = {
            selectedEmoji: 'thumbsup'
        };
        // var selectedEmoji = "thumbsup";
    }

      changeEmoji = (e) => {

        const id = e.target.getAttribute("data-id");

        if (!id) {
            return;
        }

        this.state.selectedEmoji = id;
        this.updateEmojiSelection();
        this.handleAddEmoji(e);

    };
     handleAddEmoji(event) {
         console.log("Clicked")
    // function handleAddEmoji(event) {
        const videoPlayer = document.getElementById("video-player");
        const emojiContainer = document.querySelector(".overlay");
        const clientId = `${Math.random()
            .toString()
            .slice(2)}${Math.random().toString().slice(2)}`;

        const bounds = emojiContainer.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        const icon = { x: x, y: y, type: this.state.selectedEmoji, senderId: clientId };

        renderIcon(icon);
        this.notifyStream(icon);
    }

     handleEmojiToggle(event) {
        const id = event.target.getAttribute("data-id");
        if (!id) {
            return;
        }

        this.state.selectedEmoji = id;
         this.updateEmojiSelection();
    }


     notifyStream(icon) {
         const channelArn = "arn:aws:ivs:us-east-1:671606321211:channel/dKHcJpR5S9Ut";
         // const channelArn = "arn:aws:ivs:us-west-2:913157848533:channel/rkCBS9iD1eyd";
         // const endpoints = {
         //     metadata: `https://h1r3ebcb0g.execute-api.us-west-2.amazonaws.com/metadata?channelArn=${channelArn}`
         // };

         var AWS = require("@aws-sdk/client-ivs");

         let creds = {
             accessKeyId: process.env.REACT_APP_AccessKey,
             secretAccessKey: process.env.REACT_APP_SecretKey
         };

         var ivs = new AWS.Ivs({
             apiVersion: "2020-07-14",
             region: 'us-east-1',
             credentials: creds
         });

        var paramdata = {
                    channelArn: channelArn,
                    metadata: JSON.stringify(icon) /* required */
                };

                //for pushing  metadata in live channel
                ivs.putMetadata(paramdata, function (err, putdata) {
                    if (err)
                        // console.log(err, err.stack); // an error occurred
                        console.log("error");
                    else
                        console.log(putdata);
                    console.log("success")
                    // successful response
                    // successful response
                });
    }

     updateEmojiSelection() {
        this.clearActiveSelection();
        const el = document.querySelector(`[data-id="${this.state.selectedEmoji}"].emoji-btn`);
        if (!el) {
            console.error(`Invalid emoji ${this.state.selectedEmoji} not found`);
        } else {
            el.classList.add("active");
        }
    }

     clearActiveSelection() {

        [].forEach.call(document.getElementsByClassName("emoji-btn"), function (el) {
            el.classList.remove("active");
        });
    }

    render() {
        return (
        <div>
            <div className="overlay">
            </div>
            <div className="emoji-picker">
                <ul className="emojis">
                    <li>
                        <button className="emoji-btn" onClick={this.changeEmoji} data-id="thumbsup">👍</button>
                    </li>
                    <li>
                        <button className="emoji-btn" onClick={this.changeEmoji} data-id="thumbsdown"> 👎️</button>
                    </li>
                    <li>
                        <button className="emoji-btn heart" onClick={this.changeEmoji} data-id="heart">  ❤ </button>
                    </li>

                </ul>
            </div>
        </div>
        );
    }
}

export function renderIcon(icon) {
    const emojiContainer = document.querySelector(".overlay");
    var ICON_REMOVE_TIME = 2000;
    const ICON_FADE_START_TIME = 1000;
    const iconTypeMap = {
        thumbsup: "👍",
        thumbsdown: "👎️",
        heart: "❤",
    };
    const iconEl = document.createElement("div");
    iconEl.classList.add("icon");
    iconEl.innerText =iconTypeMap[icon.type];
    if (iconTypeMap[icon.type] == "❤") {
        iconEl.style.color = 'red';
    }
    // iconEl.style.top = `calc(${icon.y * 100}% - 18px)`;
    // iconEl.style.left = `calc(${icon.x * 100}% - 18px)`;

    iconEl.style.top = `calc(${icon.y * 100}% - 200px)`;
    iconEl.style.left = `calc(${icon.x * 100}% - 18px)`;
    emojiContainer.append(iconEl);

    setTimeout(() => {
        iconEl.classList.add("fade");
    }, ICON_FADE_START_TIME);
    setTimeout(() => {
        iconEl.remove();
    }, ICON_REMOVE_TIME);
}
export default Reaction;
