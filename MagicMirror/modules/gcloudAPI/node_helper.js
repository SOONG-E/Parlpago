const NodeHelper = require("node_helper");
const recorder = require('node-record-lpcm16')
const speech = require('@google-cloud/speech').v1p1beta1;
const chalk = require('chalk');
const {Writable} = require('stream');
const path = require('path');
const { start } = require("repl");

process.env.GOOGLE_APPLICATION_CREDENTIALS ="/home/hellomirror/MagicMirror/APIKEY.json";

var act = false;

module.exports = NodeHelper.create({
    start: function(  encoding = 'LINEAR16',
        sampleRateHertz = 16000,
        languageCode = 'en-US',
        streamingLimit = 60000) 
        {
        var self=this;
 
        const client = new speech.SpeechClient();
        const config = {
            encoding: encoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: languageCode,
          };
        const request = {
            config,
            interimResults: false, //Get interim results from stream
          };

        let recognizeStream = null;
        let restartCounter = 0;
        let audioInput = [];
        let lastAudioInput = [];
        let resultEndTime = 0;
        let isFinalEndTime = 0;
        let finalRequestEndTime = 0;
        let newStream = true;
        let bridgingOffset = 0;
        let lastTranscriptWasFinal = false;

        function startStream() {
            // Clear current audioInput
            audioInput = [];
            // Initiate (Reinitiate) a recognize stream
            recognizeStream = client
            .streamingRecognize(request)
            .on('error',err => {
                if (err.code === 11) {
                  // restartStream();
                } else {
                  console.error('API request error ' + err);
                }
              })
            .on('data', speechCallback);

            // Restart stream when streamingLimit expires
            setTimeout(restartStream, streamingLimit);
        }
        const speechCallback = stream => {
            // Convert API result end time from seconds + nanoseconds to milliseconds
            var self=this;
            
            resultEndTime =
              stream.results[0].resultEndTime.seconds * 1000 +
              Math.round(stream.results[0].resultEndTime.nanos / 1000000);
            
            self.processSpeech(stream);

            // Calculate correct time based on offset from audio sent twice
            const correctedTime =
              resultEndTime - bridgingOffset + streamingLimit * restartCounter;
        
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            let stdoutText = '';
            if (stream.results[0] && stream.results[0].alternatives[0]) {
              stdoutText =
                correctedTime + ': ' + stream.results[0].alternatives[0].transcript;
            }
        
            if (stream.results[0].isFinal) {
              process.stdout.write(chalk.green(`${stdoutText}\n`));
        
              isFinalEndTime = resultEndTime;
              lastTranscriptWasFinal = true;
            } else {
              // Make sure transcript does not exceed console character length
              if (stdoutText.length > process.stdout.columns) {
                stdoutText =
                  stdoutText.substring(0, process.stdout.columns - 4) + '...';
              }
              process.stdout.write(chalk.red(`${stdoutText}`));
        
              lastTranscriptWasFinal = false;
            }
        };

        const audioInputStreamTransform = new Writable({
            write(chunk, encoding, next) {
            if (newStream && lastAudioInput.length !== 0) {
                // Approximate math to calculate time of chunks
                const chunkTime = streamingLimit / lastAudioInput.length;
                if (chunkTime !== 0) {
                if (bridgingOffset < 0) {
                    bridgingOffset = 0;
                }
                if (bridgingOffset > finalRequestEndTime) {
                    bridgingOffset = finalRequestEndTime;
                }
                const chunksFromMS = Math.floor(
                    (finalRequestEndTime - bridgingOffset) / chunkTime
                );
                bridgingOffset = Math.floor(
                    (lastAudioInput.length - chunksFromMS) * chunkTime
                );

                for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
                    recognizeStream.write(lastAudioInput[i]);
                }
                }
                newStream = false;
            }

            audioInput.push(chunk);

            if (recognizeStream) {
                recognizeStream.write(chunk);
            }

            next();
            },

            final() {
            if (recognizeStream) {
                recognizeStream.end();
            }
            },
        });

        function restartStream() {
            if (recognizeStream) {
            recognizeStream.end();
            recognizeStream.removeListener('data', speechCallback);
            recognizeStream = null;
            }
            if (resultEndTime > 0) {
            finalRequestEndTime = isFinalEndTime;
            }
            resultEndTime = 0;

            lastAudioInput = [];
            lastAudioInput = audioInput;

            restartCounter++;

            if (!lastTranscriptWasFinal) {
            process.stdout.write('\n');
            }
            process.stdout.write(
            chalk.yellow(`${streamingLimit * restartCounter}: RESTARTING REQUEST\n`)
            );

            newStream = true;

            startStream();
        }
        recorder
        .record({
            sampleRateHertz: 16000,
            threshold: 0, //silence threshold
            silence: 1000,
            keepsilence: true,
            recordProgram: 'rec', // Try also "arecord" or "sox"
        })
        .stream()
        .on('error', err => {
            console.error('Audio recording error ' + err);})
        .pipe(audioInputStreamTransform);
    
        console.log('Listening');

        startStream();
    },

    processSpeech: function (data) {
        const self = this;
        let command = null

        if (data.results[0] && data.results[0].alternatives[0]) {
        command = data.results[0].alternatives[0].transcript
        }

        console.log('Q')
        command = command.trim();

        if(command.includes('hi mirror')){
            flag = true;
            self.sendSocketNotification("act");
        }
        if(flag){
            if (command == '1' || command == '2' || command == '3' || command == '4'){
                self.sendSocketNotification("SelectedNum", command);
            }
            else if(command.includes('bye')){
                self.sendSocketNotification("EXITsig", command);
                flag = false;
            }
            else {
                self.sendSocketNotification("userMessage", {"userMSG":command});
            }
        }
    },
	socketNotificationReceived: function (notification, payload) {
		if (notification === "start") {
        }
    },
    handleError: function (error) {
        console.log("GOOGLE_CLOUD_SPEECH_ERROR");
    },
});