// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { Component, useState } from 'react';
import * as config from '../../config';


// Components
import VideoPlayer from '../videoPlayer/VideoPlayer';
import SignIn from './SignIn';
import Emoji from './emojis';

// Styles
import './Chat.css';
import $ from "jquery";
class Chat extends Component {
  constructor() {
    super ();
    this.state = {
      metadataId: null,
      showSignIn: false,
      username: '',
      message: '',
      messages: [],
      connection: null,
    }
    this.chatRef = React.createRef();
    this.messagesEndRef = React.createRef();
  }


    componentDidMount() {
    // console.log( config.PLAYBACK_URL)
    const connection =   new WebSocket(config.CHAT_WEBSOCKET);
    connection.onopen = (event) => {
      console.log("WebSocket is now open.");
    };

    connection.onclose = (event) => {
      console.log("WebSocket is now closed.");
    };

    connection.onerror = (event) => {
      console.error("WebSocket error observed:", event);
    };

    connection.onmessage = (event) => {
      // append received message from the server to the DOM element 
      const messages = this.state.messages;
      const data = event.data.split('::');
      const username = data[0];
      const message = data.slice(1).join('::'); // in case the message contains the separator '::'

      messages.push({
        timestamp: Date.now(),
        username,
        message
      });

      this.setState({ messages });
    };

    this.setState({ connection });
  }

  async  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  updateUsername = username => {
    this.setState({ username, showSignIn: false }, () => this.chatRef.current.focus());
  }

  handleOnClick = () => {
    $(".namemodal").css('display', '');
    const { username } = this.state;
    if (!username) {
      this.setState({ showSignIn: true });
    }
  }

  handleChange = e => {
    this.setState({ message: e.target.value })
  }

  handleKeyDown = (e) => {
    // if (e.keyCode === 13) { // keyCode 13 is carriage return
      const { username, message, connection } = this.state;
      if (message) {
        const data = `{
          "action": "sendmessage",
          "data": "${username}::${message.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
        }`;
        connection.send(data);
        
        this.setState({ message: '' });
      }

  }
  onKeyUpValue(event) {
    // console.log(event.keyCode)
    // console.log(event.target.value)
    if (event.keyCode === 13) { // keyCode 13 is carriage return
      console.log("enter")
    const { username, message, connection } = this.state;
    if (message) {
      const data = `{
          "action": "sendmessage",
          "data": "${username}::${message.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
        }`;
      connection.send(data);

      this.setState({ message: '' });
    }
    }
  }
  parseUrls = (userInput) => {
    var urlRegExp = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g;
    let formattedMessage = userInput.replace(urlRegExp, (match) => {
      let formattedMatch = match;
      if (!match.startsWith('http')) {
        formattedMatch = `http://${match}`;
      }
      return `<a href=${formattedMatch} class="chat-line__link" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });
    return formattedMessage;
  }
  
  renderMessages = () => {
    const { messages } = this.state;
    return (
      messages.map(message => {
        let formattedMessage = this.parseUrls(message.message);
        return (
          <div className="chat-line" key={message.timestamp}>
            <p><span className="username">{message.username}</span><span className="cmsg" dangerouslySetInnerHTML={{__html: formattedMessage}} /></p>
          </div>
        )
      })
    )
  }

  setMetadataId = (metadataId) => {
    this.setState({ metadataId });
  }

  render() {
    const { username, message, showSignIn } = this.state;
    return (
      <React.Fragment>
        <header>
          <h1>Uptech Live</h1>
        </header>
        <div className="main full-width full-height chat-container">
          <div className="content-wrapper mg-2">

          <VideoPlayer setMetadataId={this.setMetadataId} videoStream={config.PLAYBACK_URL} />
            <div className="col-wrapper">
              <div className="chat-wrapper pos-absolute pd-t-1 top-0 bottom-0">
                <div className="messages">
                  {this.renderMessages()}
                  <div ref={this.messagesEndRef} />
                </div>
                <div className="composer">
                  <input
                    // ref={this.chatRef}
                    className={`rounded ${!username ? 'hidden' : ''}`}
                    type="text"
                    placeholder="Say something"
                    value={message}
                    maxLength={510}
                    onChange={this.handleChange}
                    onKeyDown={this.onKeyUpValue.bind(this)}
                    id="enter"/>
                    <div className="send">
                    <i aria-hidden="true" ref={this.chatRef}
                                   className={`rounded ${!username ? 'hidden' :  'fa fa-paper-plane'}`}  value={message} onClick={this.handleKeyDown}></i>
                    </div>

                   {/*<button ref={this.chatRef}*/}
                   {/*   className={`rounded ${!username ? 'hidden' : 'btn btn--primary rounded mg-t-1'}`}  style={{width : '100%'}} value={message} onClick={this.handleKeyDown} >Send</button>*/}
                  {!username && (
                    <fieldset>
                      <button onClick={this.handleOnClick} className="btn btn--primary full-width rounded">Click to send messages</button>
                    </fieldset>
                  )}

                </div>
              </div>
            </div>
          </div>
          {showSignIn &&
            <SignIn updateUsername={this.updateUsername} />
          }
        </div>
      </React.Fragment>
    )
  }
}

export default Chat;