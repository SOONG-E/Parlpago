const NodeHelper = require("node_helper");
const axios = require('axios');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


module.exports = NodeHelper.create({
	start: function () {
        console.log("Start test module");
        this.fetchers = [];
	},
	socketNotificationReceived: function (notification, payload) {
		if (notification === "LOAD_NEW_GIF") {
            console.log('R: '+notification)
            const gifURL = payload.gifURL;
            this.doesFileExist(gifURL);
        }
    },

    doesFileExist: function(urlToFile){
        console.log("doesFileExist start"); 
        const xhr = new XMLHttpRequest();
        const self = this;

        xhr.open('HEAD', urlToFile, true);
        xhr.onload = function(e) {
            if (xhr.status != "404") {
                console.log(urlToFile);
                self.sendSocketNotification("SUCCESS_CHECK_GIF",{
                    "gifURL": urlToFile     
                })
            }else{
                self.sendSocketNotification("FAILED_CHECK_GIF",{
                    "gifURL": urlToFile
                }); 
            }
        }
        xhr.onerror = function(e) {
            console.log(e);
            self.sendSocketNotification("ERROR_CHECK_GIF",{
                "gifURL": urlToFile
            }); 
        };
        xhr.send();
    },
});
