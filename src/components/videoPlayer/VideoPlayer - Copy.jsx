import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as config from '../../config';
import $ from "jquery";
// Styles
import './VideoPlayer.css';

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


class VideoPlayer extends Component {
    constructor() {
        super();
        this.state = {
            maxMetaData: 10,
            metaData: [],
        }
    }

    handleNameChange = e => {
        this.setState({ username: e.target.value })
    }
    async componentDidMount() {
        const mediaPlayerScript = document.createElement("script");
        mediaPlayerScript.src = "https://player.live-video.net/1.2.0/amazon-ivs-player.min.js";
        mediaPlayerScript.async = true;
        mediaPlayerScript.onload = () => this.mediaPlayerScriptLoaded();
        document.body.appendChild(mediaPlayerScript);
    }


    mediaPlayerScriptLoaded = () => {
        //for reaction
        // const videoPlayer = document.getElementById("video-player");
        const emojiContainer = document.querySelector(".overlay");
        const clientId = `${Math.random()
            .toString()
            .slice(2)}${Math.random().toString().slice(2)}`;
        const ICON_REMOVE_TIME = 2000;
        const ICON_FADE_START_TIME = 1000;
        const iconTypeMap = {
            thumbsup: "👍",
            thumbsdown: "👎️",
            heart: "❤",
        };
        let selectedEmoji = "thumbsup";
        // let selectedEmoji = "";
        main();

        //for quiz
        const MediaPlayerPackage = window.IVSPlayer;
        const videoPlayer = document.getElementById("video-player");
        const quizEl = document.getElementById("quiz");
        const waitMessage = document.getElementById("waiting");
        const questionEl = document.getElementById("question");
        const answersEl = document.getElementById("answers");
        const cardInnerEl = document.getElementById("card-inner");

        if (!MediaPlayerPackage.isPlayerSupported) {
            console.warn("The current browser does not support the Amazon IVS player.");
            return;
        }

        const PlayerState = MediaPlayerPackage.PlayerState;
        const PlayerEventType = MediaPlayerPackage.PlayerEventType;

        // Initialize player
        const player = MediaPlayerPackage.create();
        player.attachHTMLVideoElement(document.getElementById("video-player"));

        // Attach event listeners
        player.addEventListener(PlayerState.PLAYING, () => {
            console.log("Player State - PLAYING");
        });
        player.addEventListener(PlayerState.ENDED, () => {
            console.log("Player State - ENDED");
        });
        player.addEventListener(PlayerState.READY, () => {
            console.log("Player State - READY");
        });
        player.addEventListener(PlayerEventType.ERROR, (err) => {
            console.warn("Player Event - ERROR:", err);
        });

        //for reaction
        function handleMetadata(metadata) {

            const jsonText = metadata.text;
            console.log(jsonText)
            let json;
            try {
                json = JSON.parse(jsonText);
            } catch (e) {
                console.error(`Failed to parse json error: ${e} input: ${jsonText}`);
                return;
            }

            if (json.type && json.x !== undefined && json.y !== undefined) {
                if (json.senderId !== clientId) {

                    renderIcon(json);
                }
            }
        }

        function handleAddEmoji(event) {
            console.log("After Clicking on Video")
            const bounds = emojiContainer.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;
            const icon = {x: x, y: y, type: selectedEmoji, senderId: clientId};
            // const icon = {x: x, y: y, type: handleEmojiToggle(event), senderId: clientId};

            renderIcon(icon);
            notifyStream(icon);
        }

        function handleEmojiToggle(event) {
            console.log("clicked")

            console.log(event.target.classList)
            // if(event.target.classList[1] == 'active'){
            //     console.log("this is active")
            //     clearActiveSelection();
            // }
            
            if ($.inArray( "active", event.target.classList ))
            {
                console.log("this is active")
                clearActiveSelection();
            }
            else{
                const id = event.target.getAttribute("data-id");
                if (!id) {
                    return;
                }

                selectedEmoji = id;
                updateEmojiSelection();
            }
            console.log(event.target.classList)
            // }
            // console.log("Emoji Clicked!")

        }

        function renderIcon(icon) {
            const iconEl = document.createElement("div");
            iconEl.classList.add("icon");
            iconEl.innerText = iconTypeMap[icon.type];
            // console.log(iconEl.innerText)
            if (iconTypeMap[icon.type] == "❤") {
                iconEl.style.color = 'red';

            }
            iconEl.style.top = `calc(${icon.y * 100}% - 18px)`;
            iconEl.style.left = `calc(${icon.x * 100}% - 18px)`;
            emojiContainer.append(iconEl);

            setTimeout(() => {
                iconEl.classList.add("fade");
            }, ICON_FADE_START_TIME);
            setTimeout(() => {
                iconEl.remove();
            }, ICON_REMOVE_TIME);
        }


        // Configuration
        //our IVS channel arn
        const channelArn = "arn:aws:ivs:us-east-1:671606321211:channel/dKHcJpR5S9Ut";

        //demo channel arn
        // const channelArn = "arn:aws:ivs:us-west-2:913157848533:channel/rkCBS9iD1eyd";

        const endpoints = {
            metadata: `https://h1r3ebcb0g.execute-api.us-west-2.amazonaws.com/metadata?channelArn=${channelArn}`
        };

        function notifyStream(icon) {
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
                    console.log(putdata);           // successful response
                // successful response
            });

            // const url = endpoints.metadata;
            // fetch(url, {method: "POST", body: JSON.stringify(icon)});
        }

        function updateEmojiSelection() {

            clearActiveSelection();
            const el = document.querySelector(`[data-id="${selectedEmoji}"].emoji-btn`);
            if (!el) {
                console.error(`Invalid emoji ${selectedEmoji} not found`);
            } else {
                el.classList.add("active");
            }
        }

        function clearActiveSelection() {
            [].forEach.call(document.getElementsByClassName("emoji-btn"), function (el) {
                el.classList.remove("active");
            });
        }


        // function changeEmojis(e) {
        //     console.log("clicked")
        //     const id = e.target.getAttribute("data-id");
        //     if (!id) {
        //         return;
        //     }
        //
        //     selectedEmoji = id;
        //     updateEmojiSelection();
        //     handleAddEmoji(e);
        //     // renderIcon(icon);
        // }
        function main() {
            // console.log("Main")
            emojiContainer.addEventListener("click", handleAddEmoji);
            document.querySelector(".emoji-picker").addEventListener("click", handleEmojiToggle);
            updateEmojiSelection();
        }

        player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, handleMetadata);

        //for quiz
        player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, function (cue) {
            // console.log(cue)
            const metadataText = cue.text;
            console.log(JSON.parse(metadataText))
            // console.log(JSON.parse(metadataText)['type'])
            const position = player.getPosition().toFixed(2);
            if (JSON.parse(metadataText)['type']) {
                console.log("reaction-added")

                // handleMetadata(JSON.parse(metadataText))
                // handleMetadata()
            } else {
                console.log("quiz")
                triggerQuiz(metadataText);
            }
            // console.log(
            //     `Player Event - TEXT_METADATA_CUE: "${metadataText}". Observed ${position}s after playback started.`
            // );
            // triggerQuiz(metadataText);
        });

        function removeCard() {
            console.log("re")

            quizEl.classList.toggle("drop");
        }

        // Setup stream and play
        player.setAutoplay(true);
        player.load(config.PLAYBACK_URL);
        player.setVolume(0.5);

        // Trigger quiz
        function triggerQuiz(metadataText) {
            let obj = JSON.parse(metadataText);
            console.log(obj)

            quizEl.style.display = "";
            quizEl.classList.remove("drop");
            waitMessage.style.display = "none";
            cardInnerEl.style.display = "none";
            cardInnerEl.style.pointerEvents = "auto";

            while (answersEl.firstChild) answersEl.removeChild(answersEl.firstChild);
            questionEl.textContent = obj.question;

            let createAnswers = function (obj, i) {
                let q = document.createElement("a");
                console.log(q.textContent)
                let qText = document.createTextNode(obj.answers[i]);
                answersEl.appendChild(q);
                q.classList.add("answer");
                q.appendChild(qText);

                q.addEventListener("click", (event) => {
                    cardInnerEl.style.pointerEvents = "none";
                    if (q.textContent === obj.answers[obj.correctIndex]) {
                        q.classList.toggle("correct");
                    } else {
                        q.classList.toggle("wrong");
                    }
                    setTimeout(function () {
                        if (q.textContent === obj.answers[obj.correctIndex]) {
                            alert("Correct!")
                        }
                    }, 8000);
                    return false;
                });
                setTimeout(function () {
                    cardInnerEl.style.pointerEvents = "none";
                    if (q.textContent === obj.answers[obj.correctIndex]) {

                        q.classList.add("correct");
                    }
                    removeCard();

                }, 8000);
            };

            for (var i = 0; i < obj.answers.length; i++) {
                createAnswers(obj, i);
            }
            cardInnerEl.style.display = "";
        }

        waitMessage.style.display = "";
    }

    render() {
        return (
                <div className="inner">

                    {/*<div className="video-wrapper">*/}
                    <div className="player-wrapper">
                        <div className="overlay">
                        </div>
                        <div className="aspect-169 pos-relative full-width full-height">
                            <video id="video-player" className="video-elem pos-absolute full-width" controls autoPlay
                                   playsInline></video>
                            {/*<video id="video-player" className="video-elem pos-absolute full-width" playsInline></video>*/}
                            <div>
                                <div id="waiting">
                                    {/*    /!*<span className="waiting-text float">Waiting for the next question</span>*!/*/}
                                </div>
                                <div id="quiz" className="card drop">
                                    <div id="card-inner">
                                        <h2 id="question"></h2>
                                        <div id="answers"></div>
                                    </div>
                                </div>

                            </div>
                            <div className="emoji-picker">
                                <ul className="emojis">
                                    <li>
                                        <button className="emoji-btn" data-id="thumbsup" > 👍</button>
                                    </li>
                                    <li>
                                        <button className="emoji-btn" data-id="thumbsdown"> 👎️</button>
                                    </li>
                                    <li>
                                        <button className="emoji-btn heart" data-id="heart"> ❤</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
        )
    }
}

VideoPlayer.propTypes = {
    setMetadataId: PropTypes.func,
    videoStream: PropTypes.string,
};

export default VideoPlayer;
