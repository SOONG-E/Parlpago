'use strict';

Module.register("gcloudAPI",{
    defaults: {
        encoding : 'LINEAR16',
        sampleRateHertz : 16000,
        languageCode : 'en-US',
        text:null
    },
    start: function() {
        this.sendSocketNotification("start");
    },
    socketNotificationReceived: function (notification, payload) {
        console.log("received");
		if (notification === "userMessage") {
            console.log('Q : received from API-NodeHelper : '+payload.userMSG);
            this.sendNotification("toServer",{"userMSG":payload.userMSG});
        }
        if (notification === "SelectedNum"){
            this.sendNotification("SelectedNum",payload);
        }
        if (notification === "EXITsig"){
            console.log(payload);
            this.sendNotification("EXITsig",payload);
        }
        if (notification === "act"){
            this.sendNotification("act");
        }
    },
});

