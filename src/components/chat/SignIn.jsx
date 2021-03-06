// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, {Component } from 'react';
import PropTypes from 'prop-types';
import $ from "jquery";
class SignIn extends Component {
  constructor() {
    super ();
    this.state = {
      username: ''
    }
    this.inputRef = React.createRef();
  }  

  componentDidMount() {
    this.inputRef.current.focus();
  }

  handleNameChange = e => {
    this.setState({ username: e.target.value })
  }

  handleStartChatting = e => {
    this.props.updateUsername(this.state.username);
  }
  cancelChat = e => {
    $(".namemodal").css('display', 'none');

  }


  render() {
    const { username } = this.state;
    return (
      <div className="modal pos-absolute top-0 bottom-0 namemodal">

        <div className="modal__el">

          <div className="modal-header">
            <button type="button" className="btn btn-default" data-dismiss="modal" style={{float:'right'}} onClick={this.cancelChat}>&times;</button>

          </div>
          <h1 className="mg-b-2">Enter your name</h1>
          <form>
            <fieldset>
              <input
                name="name"
                id="name"
                ref={this.inputRef}
                type="text"
                className="rounded"
                placeholder="Type here..."
                autoComplete="off"
                value={username}
                onChange={this.handleNameChange}
              />
              <button
                onClick={this.handleStartChatting}
                className="btn btn--primary rounded mg-t-1"
                disabled={!username}
              >Start chatting</button>
            </fieldset>
          </form>
        </div>
        <div className="modal__overlay">

        </div>
      </div>
    )
  }
}

SignIn.propTypes = {
  updateUsername: PropTypes.func,
};

export default SignIn;