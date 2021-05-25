Module.register("script",{

	defaults: {
		conv1 : "",
		conv2 : "",
		act : false
	},

	start: function() {
		var self = this;

		setTimeout(this.loadNewGif, 1000, this);

	},

    notificationReceived:function(notification, payload, sender){
		if(notification == "sendFromServer" && !this.config.act){
			this.config.conv1 = this.config.conv2;
			this.config.conv2 = payload.userMSG;
			this.updateDom();
		}
		if(notification == "toServer" && !this.config.act){
			this.config.conv1 = this.config.conv2;
			this.config.conv2 = payload.userMSG;
			this.updateDom();
		}
		if(notification == "EXITsig"){
			this.config.conv1 = '';
			this.config.conv2 = '';
			this.config.act = false;
			this.updateDom();
		}
		if(notification == "act"){
			this.config.act = true;
		}

	},
	
	getDom: function() {
		var wrapper = document.createElement("div");

		var convs = document.createElement("span");

		var convs1= document.createElement("span");
		convs1.innerHTML = this.config.conv1;
		convs1.style.fontSize = 30 + 'pt';
		convs1.style.color = 'gray';
		convs1.style.left = 1000 + 'px';

		var convs2= document.createElement("span");
		convs2.innerHTML = this.config.conv2;
		convs2.style.fontSize = 35 + 'pt';
		convs2.style.color = 'white';

		convs.appendChild(convs1);
		convs.appendChild(document.createElement("BR"));
		convs.appendChild(convs2);

		wrapper.appendChild(convs);
		return wrapper;
	}
});
