const NodeHelper = require("node_helper");
const axios = require('axios');


module.exports = NodeHelper.create({
	start: function () {
        console.log("Start pServer node helper");
        this.fetchers = [];
        this.sendSentence();
	},
	socketNotificationReceived: function (notification, payload) {
		if (notification === "sendToServer") {
            const userMSG = payload.userMSG;
            console.log("received from Server:"+payload.userMSG);
            this.sendSentence(userMSG);
        }
    },
    sendSentence: function(sentence='hello'){
        console.log("sendSentence in server NodeHelper:"+sentence);
        const self = this;
        axios({
            method: 'post',
            url: `http://192.168.0.183:5000/chatbot`,
            data: {
                'sentence': sentence,
                'user' : 1
            },
            headers: {'Content-Type': 'application/json' }
            })
            .then(function (response) {
                // Successful send
                console.log("successful send, return MSG:"+response.data);
                self.sendSocketNotification("responeMSG",{"resMSG":response.data});
            })
            .catch(function (response) {
                // Error send
                console.log(response);
            });
    }
});
