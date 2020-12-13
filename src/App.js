import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.css';
import { CallClient} from "@azure/communication-calling";
import { AzureCommunicationUserCredential } from '@azure/communication-common';
import AppSettings from './appsettings.json';

const { CommunicationIdentityClient } = require('@azure/communication-administration');


class App extends React.Component {
    state = {
        newtoken: '',
        newuser: '',
        issuedtoken: ''
    }
    ////////////////////Issues User Token with scopes ////////////////////////////
    issueToken = async () => {
        console.log("Welcome to Azure Communication Services")
        // Place your connection string in the appsettings.json file
        const connectionString = AppSettings.ResourceConnectionString;

        //Uncomment the below console log line to check
        //if your connectionstring was read from the appsettings.json file
        //console.log(connectionString)

        // Instantiate the user token client
        const identityClient = new CommunicationIdentityClient(connectionString);
        //Use the below line to display the identityClient in the console
        // console.log(identityClient)

        //Note: userResponse is the identityResponse in the Quickstart here: https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/access-tokens?pivots=programming-language-javascript
        let userResponse = await identityClient.createUser();
        console.log(`\nCreated a user with ID: ${userResponse.communicationUserId}`);

        //Issue tokens 
        let  tokenResponse = await identityClient.issueToken(userResponse, ["voip", "chat", "pstn", "joinRoom"]);
        

        const { token, expiresOn } = tokenResponse;

        // console.log(`\nIssued a token that expires at ${expiresOn}:`);
        // console.log(token);

        /////This sets the state of each object that I want to show on the screen so I can refer to it later//////
        this.setState({
            newtoken: (`\nIssued a token that expires at ${expiresOn}`),
            newuser: (`\nCongrats! You've provisioned a new ACS user to use the ACS SDK.  The identity is: ${userResponse.communicationUserId}:`),
            issuedtoken: token
        }); 
        
        

    }
   
  

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

////////Creates a new Group ID ////////











    render() {
        return (


            <div className="App">
                 <header>
                    <h1 class="intro">
                   <h2 class="page-title">The example below shows how to use the Azure.Communication SDKs.</h2>         
                    </h1>
                </header> 

                <body>
                    <div class="jumbotron container">
                        <h1 class="display-4">Hello, ACS User!</h1>
                        <p class="lead">This is a simple application for user authentication, voice and video calling, chat, and SMS features utilizing the Azure Communication Services SDKs.</p>
                        <hr class="my-4"></hr>
                        <p>Click the button below to issue a user token.</p>
                        <p class="lead">
                        <Button onClick={this.issueToken} > Issue User Identity and Token</Button>
                        <div class="utokenModal container">{this.state.newtoken} <br></br> {this.state.newuser}</div>
                        </p>
                    </div>

                    <div class="jumbotron container">
                        <h2 class="display-4">Create a Call Client</h2> 
                    <p class="lead">The Call Client instantiates the Call Agent which is used to start a call.</p>
                    &nbsp;
                    <Button onClick={this.callClientInit}> Create a Call Client</Button>
                      </div>

                    <div class="jumbotron container">
                        <h2 class="display-4">Place a VOIP Call</h2>
                        <div class="panel-body lead"> Having provisioned an ACS user identity and initialized the SDK, you are now ready to place a call.
                         You can make an outbound VOIP call by creating a call client, providing a user ID in the text field and clicking the Place Call button. <br></br><br></br>Calling <b>8:echo123 </b>connects you with an echo bot, this is great for getting started and verifying your audio devices are working.</div>
                        <hr class="my-4"/>
                        <p>Input a destination user id, and place the call.</p>
                        
                            <input class="InputBox"
                                    id="callee-id-input"
                                    type="text"
                                    placeholder="Who would you like to call?"/>

                                <div>
                                    <button id="call-button" type="button" disabled="true">
                                        Place Call
                                      </button>
                                      &nbsp;
                                      <button id="hang-up-button" type="button" disabled="true">
                                       End Call &amp; Dispose Call Client
                                      </button>
                                      
                                </div>
                       
                        <script src="./bundle.js"></script>
                    </div>


                    <div class="jumbotron container">
                        <h2 class="display-4">Create a Group Call</h2>
                        <p class="lead">
                        <Button onClick={this.getGroupId} > Create a Group ID</Button>
                        </p>
                        <div class="panel-body lead"> After creating your Group ID, open another browser window and place the group id url into the address bar.  Have both windows join the same group ID.</div>
                        <hr class="my-4"/>
                        <p>Input the Group Id below and click 'Create A Group Call'.</p>                      
                            <input class="InputBox"
                                    id="Group-id-input"
                                    type="text"
                                    placeholder="What is the Group ID?"/>

                                <div>
                                    <button id="call-button" type="button" disabled="true">
                                        Create A Group Call
                                      </button>
                                      
                                </div>
                       
                    </div>

                            {/* <div class="panel panel-info">
                                <div class="panel-heading">Join a Teams Meeting</div>
                                <div class="panel-body"> Enter a Teams meeting link or a Teams meeting coordinates</div>
                                <Button onClick='' > Join Teams Meeting</Button>
                                <div class="panel-body"> Meeting Link</div>
                            </div>
                         */}

                </body>

            </div>
        );
    }

 

}






export default App;
