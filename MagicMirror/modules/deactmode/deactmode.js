Module.register("deactmode",{

	getDom: function() {
		var wrapper = document.createElement("div");

		var title= document.createElement("img");
		title.src = 'modules/deactmode/main.png';

		wrapper.appendChild(title);	

		return wrapper
	},
	notificationReceived:function(notification, payload, sender){
        if (notification == "act"){
			this.hide(0);
			this.updateDom();
		}
		if (notification == "EXITsig"){
			this.show(0);
			this.updateDom();
		}
	}
});

