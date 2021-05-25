Module.register("talkr",{

	defaults: {
		talkValue: "choose one",
		responeMGS: null,
		flag: false,
		act : false,
		playHref:"javascript:playsyncronized()",
		front_img:['modules/talkr/images/1.png', 'modules/talkr/images/2.png', 'modules/talkr/images/3.png', 'modules/talkr/images/4.png'],
		images : ['https://i.imgur.com/ork8hoP.gif', 'https://i.imgur.com/RLMkj1P.gif', 'https://i.imgur.com/ork8hoP.gif', 'https://i.imgur.com/lLHEQ3F.gif'],
		voices : [1, 1, 2, 5],
		voice : 0,
		imageSource:"https://i.imgur.com/ork8hoP.gif",
		animated_src:"https://i.imgur.com/ork8hoP.gif",
		auto_play:"0",
		giferrormessage:"no error",
		sup1: null,
	},

	start: function() {
		var self = this;
		console.log("이미지: "+this.config.imageSource);

		this.sendSocketNotification("start");

		// enter -> playSyncronized()
		document.addEventListener("keypress", function(e) {
			if (e.which == 13) {
				self.playsyncronized(self);
			}
		});

		//setTimeout(this.loadNewGif, 100, this);

	},

    notificationReceived:function(notification, payload, sender){
        if (notification == "test"){
			Log.info("received text from:"+notification);
			this.config.talkValue=payload.any;
			this.updateDom();
		}
		if(notification == "sendFromServer"){
			this.config.talkValue=payload.userMSG;
			console.log("A : received from pServer:" + this.config.talkValue);
			this.playsyncronized(this);
		}
		if(notification == "SelectedNum"){
			this.config.imageSource = this.config.images[parseInt(payload)-1];
			setTimeout(this.loadNewGif, 10, this);
			this.config.voice = this.config.voices[parseInt(payload)-1];
			this.config.flag = true;
			this.updateDom();
		}
		if(notification == "EXITsig"){
			this.config.talkValue='bye, see you later';
			this.updateDom();
			this.playsyncronized(this);
			this.hide(0);
			this.config.flag = false;
			this.config.act = false ;
		}
		if(notification == "act"){
			this.show(0);
			this.config.act = true ;
			this.updateDom();
		}
	},
	
	getDom: function() {

		if (!this.config.act){
			this.hide(0);
		}

		if (!this.config.flag){
			var wrapper = document.createElement("div");

			var title= document.createElement("img");
			title.src = 'modules/talkr/images/title.png';

			var imageContainer = document.createElement("div");
			
			for(var i = 0 ; i < 4; i++){
				var imgElement = document.createElement('img');
				imgElement.src = this.config.front_img[i];
				imgElement.style.width = "300px";
				imgElement.style.height = "300px";

				var num= document.createElement("span");
				num.innerHTML = '\t';
				
				imageContainer.appendChild(num);
				imageContainer.appendChild(imgElement);
			}
			wrapper.appendChild(title);	
			wrapper.appendChild(imageContainer);

			return wrapper
		}
		var wrapper = document.createElement("div");
		
		var testSpeakInput = document.createElement("div");
		var errormsg=document.createElement("div");
		errormsg.setAttribute('id','giferrormessage');
		
		var imageContainer = document.createElement("div");
		imageContainer.setAttribute("id", "imageContainer");

		var newlink=document.createElement("a");
		
		newlink.setAttribute('href','javascript:playsyncronized()')
		testSpeakInput.innerHTML = this.config.talkValue;
		errormsg.innerHTML=this.config.giferrormessage;

		var txt= document.createElement("img");
		txt.src = 'modules/talkr/images/bottom.png';
		
		wrapper.appendChild(newlink);	
		wrapper.appendChild(imageContainer);
		wrapper.appendChild(txt);

		return wrapper;
	},


	getScripts: function() {
		return [
			this.file('libgif.js')		
		]
	},

	loadNewGif: function(self){
		console.log("LoadNewGif: start");
		self.sendSocketNotification("LOAD_NEW_GIF", {
			"gifURL": self.config.imageSource}
		);
	},

	socketNotificationReceived: function (notification, payload) {
		switch(notification){
			case "SUCCESS_CHECK_GIF":
				console.log("SUCCESS_CHECK_GIF");
				const gifURL = payload.gifURL;
				this.loadSuperGif(gifURL);
				break;
			case "FAILED_CHECK_GIF":
				console.log("Failed Check gif");
				break;
			case "ERROR_CHECK_GIF":
				console.log("ERROR_CHECK_GIF");
				break;
		}
	},

	loadSuperGif: function(gifURL){
		console.log("load super gif!!!!!!!1");
		imagecontainer = document.getElementById("imageContainer");
		imgElement = document.createElement('img');
		imgElement.src = gifURL;
		imgElement.animatedSrc = gifURL;
		imgElement.setAttribute('rel:animated_src',gifURL);
		imgElement.setAttribute('rel:auto_play', 0);
		imagecontainer.appendChild(imgElement);

		if(this.config.sup1){
			this.config.sup1.destroy()
		}
		
		this.config.sup1 = new SuperGif({ gif: imgElement });
		this.config.sup1.load(function(){
			console.log('Success super gif load!');
		});
		document.getElementById('giferrormessage').innerHTML = "";
	},

	playsyncronized: function(self){
		console.log("playsyncronized");
		if(speechSynthesis.speaking){
			return;
		}
		var text=self.config.talkValue;

		// voice list
		//"Maged","Zuzana","Sara","Anna","Melina","Karen","Serena","Moira","Tessa",
		// "Samantha","Monica","Paulina","Satu","Amelie","Thomas","Carmit","Lekha","Mariska",
		// "Damayanti","Alice","Kyoko","Yuna","Ellen","Xander","Nora","Zosia","Luciana",
		// "Joana","Ioana","Milena","Laura","Alva","Kanya","Yelda","Ting-Ting","Sin-Ji","Mei-Jia"
		var voice = speechSynthesis.getVoices()[this.config.voice];
			// Splitting each utterance up using punctuation is important.  Intra-utterance
			// punctuation will add silence to the tts which looks bad unless the mouth stops moving
			// correctly. Better to split it into separate utterances so play_for_duration will move when
			// talking, and be on frame 0 when not. 
	
			// split everything betwen deliminators [.?,!], but include the deliminator.
		 var substrings = text.match(/[^.?,!]+[.?,!]?/g);
		for (var i = 0, l = substrings.length; i < l; ++i) {
			var str = substrings[i].trim();
	
				// Make sure there is something to say other than the deliminator
			var numpunc = (str.match(/[.?,!]/g) || []).length;
			if (str.length - numpunc > 0) {
					// suprisingly decent approximation for multiple languages.
	
					   // if you change the rate, you would have to adjust
				var speakingDurationEstimate = str.length * 50;
					// Chinese needs a different calculation.  Haven't tried other Asian languages.
				if (str.match(/[\u3400-\u9FBF]/)) {
					speakingDurationEstimate = str.length * 200;
				}

				var msg = new SpeechSynthesisUtterance();
	
				(function(dur){
					msg.addEventListener('start', function(){         
						console.log("start !! play for duration");                
						self.config.sup1.play_for_duration(dur);
					})
				})(speakingDurationEstimate);
	
					// The end event is too inacurate to use for animation,
					// but perhaps it could be used elsewhere.  You might need to push 
					// the msg to an array or aggressive garbage collection fill prevent the callback
					// from firing.
					//msg.addEventListener('end', function (){console.log("too late")}			                
					
				msg.text = str;
					//change voice here
				msg.voice = voice;
				window.speechSynthesis.speak(msg);
			}
		}
    }
});
