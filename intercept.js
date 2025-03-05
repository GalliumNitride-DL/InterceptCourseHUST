const matchURL = "mooc-ans/multimedia/log/a";
var originalPayload = "";
var clazzid = "";
var userid = "";
var jobid = "";
var objectId = "";
var playingTime = "";
var duration = "";
var clipTime = "";
var isdrag = "";
var epochmillis = "";
var requestProcessed = 0;

var md5original = "";

console.log("Intercepting...");

chrome.webRequest.onBeforeRequest.addListener(
    async function (details) {
        if (details.url.includes(matchURL)) {
            requestProcessed++;
            // if (requestProcessed >= 2) {
            //      return;
            // }
            originalPayload = details.url;
            loadPayload(originalPayload);

            console.log("clazzid: " + clazzid);
            console.log("userid: " + userid);
            console.log("jobid: " + jobid);
            console.log("objectId: " + objectId);
            console.log("playingTime: " + playingTime);
            console.log("duration: " + duration);
            console.log("clipTime: " + clipTime);

            var newIsdrag = "0";
            var newPayload = originalPayload.replace("playingTime=" + playingTime, "playingTime=" + duration);
            newPayload = newPayload.replace("isdrag=" + isdrag, "isdrag=" + newIsdrag);
            var newEpochMillis = parseInt(epochmillis) + 1000000000 * requestProcessed;
            newPayload = newPayload.replace("_t=" + epochmillis, "_t=" + newEpochMillis);

            var newHash = "";

            // Delay 1s
            await new Promise(r => setTimeout(r, 1000));

            chrome.tabs.executeScript({
                code: `
                navigator.clipboard.readText().then(
                    clipText => {
                        newHash = clipText;
                        //console.log("New Hash: " + newHash);

                        var regex = /enc=[a-f0-9]{32}/;
                        var newEnc = "enc=" + newHash;
                        var newPayload = "${newPayload}";
                        newPayload = newPayload.replace(regex, newEnc);

                        console.log("New Payload: " + newPayload);

                        navigator.clipboard.writeText(newPayload);

                        console.log("Payload copied to clipboard");

                        //fetch the new link
                        //fetch(newPayload).then(response => response.text()).then(data => {
                        //    console.log("Response: " + data);
                        //});
                    });
                `
            });
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);


chrome.webNavigation.onCompleted.addListener(function () {
    requestProcessed = 0;
});


// Loads the payload and saves the values of the parameters
function loadPayload(payload) {
    // Parameter starts with "?", and are separated by "&"
    var parameters = payload.split("?")[1].split("&");
    parameters.forEach(function (parameter) {
        var key = parameter.split("=")[0];
        var value = parameter.split("=")[1];
        switch (key) {
            case "clazzId":
                clazzid = value;
                break;
            case "userid":
                userid = value;
                break;
            case "jobid":
                jobid = value;
                break;
            case "objectId":
                objectId = value;
                break;
            case "playingTime":
                playingTime = value;
                break;
            case "duration":
                duration = value;
                break;
            case "clipTime":
                clipTime = value;
                break;
            case "isdrag":
                isdrag = value;
                break;
            case "_t":
                epochmillis = value;
                break;
        }
    });

}
