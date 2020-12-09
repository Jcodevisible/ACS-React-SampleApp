import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.css';
import { CallClient, CallAgent} from "@azure/communication-calling";
import { AzureCommunicationUserCredential } from '@azure/communication-common';


const { CommunicationIdentityClient } = require('@azure/communication-administration');


class App extends React.Component {
    state = {
        newtoken: '',
        newuser: '',
        issuedtoken: ''
    }
    ////////////////////Issues User Token with scopes ////////////////////////////
    issueToken = async () => {
        console.log("Azure Communication Services - User Access Tokens Quickstart")
        // This code demonstrates how to fetch your connection string
        // from an environment variable.
        const connectionString = 'endpoint=https://jameelaesaacs.communication.azure.com/;accesskey=UBTzySbTNPSSAuy57xLsHeeeVrhQh+fS7Jh7IW5UoKIB1hmVMW4rBXzTZTzubbGsmfmtDW2pcsu/bZuvnPy1TA==';
        console.log(connectionString)

        // Instantiate the user token client
        const identityClient = new CommunicationIdentityClient(connectionString);
        console.log(identityClient)

        let userResponse = await identityClient.createUser();
        console.log(`\nCreated a user with ID: ${userResponse.communicationUserId}`);

        // Issue an access token with multiple scopes for a new user
        let tokenResponse = await identityClient.issueToken(userResponse, ["voip", "chat", "pstn", "joinRoom"]);


        const { token, expiresOn } = tokenResponse;

        console.log(`\nIssued a token that expires at ${expiresOn}:`);
        console.log(token);

        this.setState({
            newtoken: (`\nIssued a token that expires at ${expiresOn}`),
            newuser: (`\nCongrats! You've provisioned a new ACS user to use the ACS SDK.  The identity is: ${userResponse.communicationUserId}:`),
            issuedtoken: token
        });

        this.callClientInit();

    };

    ////////////////////Initializes the Azure Calling SDK ////////////////////////////
    callClientInit = async () => {
        //code to import the calling client and get references to the DOM elements so we can attach our application logic.
        let call;
        const calleeInput = document.getElementById("callee-id-input");
        const callButton = document.getElementById("call-button");
        const hangUpButton = document.getElementById("hang-up-button");

        // Authenticate the client
        const callClient = new CallClient();
        const tokenCredential = new AzureCommunicationUserCredential(this.state.issuedtoken);  
        let callAgent;
      

        // CallClient is the entrypoint for the SDK. Use it to
        // to instantiate a CallClient and to access the DeviceManager
        callClient.createCallAgent(tokenCredential).then(agent => {
            callAgent = agent;
            callButton.disabled = false;
        });

        //An event handler to initiate a call when the callButton is clicked
        callButton.addEventListener("click", () => {
            // start a call
            const userToCall = calleeInput.value;
            call = callAgent.call(
                [{ communicationUserId: userToCall }],
                {}
            );
            // toggle button states
            hangUpButton.disabled = false;
            callButton.disabled = true;
        });

        //An event listener to end the current call when the hangupButton is clicked
        //The forEveryone property ends the call for all call participants.
        hangUpButton.addEventListener("click", () => {
            // end the current call
            call.hangUp({ forEveryone: true });

            // toggle button states
            hangUpButton.disabled = true;
            callButton.disabled = false;
        });


    };



    render() {
        return (
            <div className="App">
                <header className="header sticky-top sticky navbar navbar-default ">
                    <div class="container ">
                        <div class="row">
                            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                <div class="page-caption">
                                    <h2 class="page-title">The example below shows how to use the Azure.Communication SDKs.</h2>
                                </div>

                            </div>
                        </div>
                    </div>
                </header>

                <body>
                    <Container>
                        <Jumbotron>

                            <p >  Click the button below to issue a user token.</p>
                            {/*  <div class="utokenModal container">{this.state.tokencode}</div>
                            <Button color="primary" className="px-4" onClick={this.showCode}>Show Code </Button> <span className="px-4"></span> */}
                            <Button onClick={this.issueToken} > Provision new user and Initialize SDK</Button>
                            <div class="utokenModal container">{this.state.newtoken} <br></br> {this.state.newuser}</div>

                        </Jumbotron>
                    </Container>

                    <div class="container">
                        <h3>Call, Chat, and Send a SMS Below</h3>
                        <div class="panel-group">
                            <div class="panel panel-default">
                                <div class="panel-heading"><label>Placing and receiving calls</label> </div>
                                <div class="panel-body"> Having provisioned an ACS user identity and initialized the SDK, you are now ready to place a call.<br></br>
                                    You can make an outbound VOIP call by providing a user ID in the text field and clicking the Start Call button. <br></br>Calling <label>8:echo123</label> 
                                     connects you with an echo bot, this is great for getting started and verifying your audio devices are working.</div>
                                <div class="panel-body"> Input a destination user id, and place the call.</div>
                                <input class="InputBox"
                                    id="callee-id-input"
                                    type="text"
                                    placeholder="Who would you like to call?"/> 
                                
                                <div>
                                    <button id="call-button" type="button" disabled="true">
                                        Start Call
                                      </button>
                                      &nbsp;
                                      <button id="hang-up-button" type="button" disabled="true">
                                       Hang Up
                                      </button>
                                </div>
                                <script src="./bundle.js"></script>

                                 </div>


                            
                            <div class="panel panel-default">
                                <div class="panel-heading">Join a Group Call</div>
                                <div class="panel-body"> Open another browser window and for both windows join the same group ID.</div>
                                <Button onClick='' > Join  Group </Button>
                                <div class="panel-body">
                                    <label for="GroupId">Group Id:</label>

                                </div>
                            </div>
                         
                            
                            <div class="panel panel-info">
                                <div class="panel-heading">Join a Teams Meeting</div>
                                <div class="panel-body"> Enter a Teams meeting link or a Teams meeting coordinates</div>
                                <Button onClick='' > Join Teams Meeting</Button>
                                <div class="panel-body"> Meeting Link</div>
                            </div>
                {/*
                            <div class="panel panel-default">
                                <div class="panel-heading">Start A Chat</div>
                                <div class="panel-body"> Content</div>
                                <Button onClick='' > Start A Chat</Button>
                                <div class="panel-body"> Content</div>
                            </div>

                            <div class="panel panel-default">
                                <div class="panel-heading">Send a SMS Message</div>
                                <div class="panel-body"> Content</div>
                                <Button onClick='' > Send SMS Message</Button>
                                <div class="panel-body"> Content</div>
                            </div>
                */}

                        </div>
                    </div>

                </body>

            </div>
        );
    }

    //issueToken().catch((error) => {

    //    console.log("Encountered and error");
    //    console.log(error);
    //});
}




export default App;
