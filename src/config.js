var AWS = require("@aws-sdk/client-ivs");
var hell = ''
    let creds = {
        accessKeyId: process.env.REACT_APP_AccessKey,
        secretAccessKey: process.env.REACT_APP_SecretKey
    };

    var ivs = new AWS.Ivs({
        apiVersion: "2020-07-14",
        region: 'us-east-1',
        credentials: creds
    });

    var params = {
        maxResults: 1,
        nextToken: ''
    };


 ivs.listStreams(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else if (data['streams'][0] === undefined) {
            console.log("No stream", data)

            // alert("No live is streaming currently!")
        } else {
            console.log("everyhting's okay")
            var arn = {
                arn: data['streams'][0]['channelArn']
            };
            ivs.getChannel(arn, function (err, channeldata) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    // pbkurl = channeldata['channel']['playbackUrl'];
                    localStorage.setItem("playbackUrl", channeldata['channel']['playbackUrl']);

                }
                 hell = localStorage.getItem("playbackUrl")
            });
            console.log(hell)
        }
    });

console.log(localStorage.getItem("playbackUrl"))

export const PLAYBACK_URL = localStorage.getItem("playbackUrl");
// export const PLAYBACK_URL =  "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8";
// export const PLAYBACK_URL ="https://3d26876b73d7.us-west-2.playback.live-video.net/api/video/v1/us-west-2.913157848533.channel.rkCBS9iD1eyd.m3u8";
export const CHAT_WEBSOCKET = "wss://fhyd1y8nzl.execute-api.us-west-2.amazonaws.com/Prod";













