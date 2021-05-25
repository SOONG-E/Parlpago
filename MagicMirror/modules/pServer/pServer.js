
Module.register("pServer",{
	defaults: {
        userMessage:null,
        EXITmsg : "bye, see you later"
    },
    start: function() {
    },
    notificationReceived: function (notification, payload) {
        if (notification === "toServer") {
            this.config.userMessage = payload.userMSG;
            console.log("Q : received from API:"+this.config.userMessage);
            this.sendToServer();
        }
    },
    sendToServer: function(){
        this.sendSocketNotification("sendToServer", {
            "userMSG":this.config.userMessage
        })
    },
    socketNotificationReceived: function (notification, payload) {
		if (notification === "responeMSG") {
            const resMSG = payload.resMSG;
            console.log("A : received from Server NodeHelper:" + resMSG);
            this.sendNotification("sendFromServer", {"userMSG" : resMSG});
        }
    },
});

