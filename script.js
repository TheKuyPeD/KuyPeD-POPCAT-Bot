const MESSAGES = {
  CHECK_TAB: "CHECK_TAB",
  SET_STATUS_TEXT: "SET_STATUS_TEXT",
  BOT_BUTTON_CLICK: "BOT_BUTTON_CLICK",
};

const BOT_STATUS_TYPE = {
  RUNNING: "RUNNING",
  STOPPED: "STOPPED",
  NO_POPCAT_TAB: "NO_POPCAT_TAB",
};

var port = chrome.runtime.connect({
  name: "PU Communication",
});

window.onload = function () {
  console.log("POPUP ONLOAD");
  port.postMessage({ msg: MESSAGES.CHECK_TAB });
};

port.onMessage.addListener(function (request) {
  console.log("POPUP MESSAGE RECEIVED", request);
  if (request.msg === MESSAGES.SET_STATUS_TEXT) {
    setStatusText(request.statusType);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var botButton = document.getElementById("botButton");
  botButton.addEventListener("click", function () {
    port.postMessage({ msg: MESSAGES.BOT_BUTTON_CLICK });
  });

  // FOR DEBUG
  // var refreshButton = document.getElementById("refreshButton");
  // refreshButton.addEventListener("click", function () {
  //   chrome.storage.sync.get(null, function (data) {
  //     var code = function () {
  //       window.location.reload();
  //     };
  //     const tabId = data.popCatTab.id;

  //     chrome.scripting.executeScript({
  //       target: { tabId },
  //       func: code,
  //     });
  //   });
  // });
});

function setStatusText(botStatusType) {
  switch (botStatusType) {
    case BOT_STATUS_TYPE.RUNNING: {
      document.getElementById("botStatus").innerHTML = "Running";
      document.getElementById("botStatus").classList.remove("stoppedText");
      document.getElementById("botStatus").classList.add("runningText");

      document.getElementById("botButton").disabled = false;
      document.getElementById("botButton").textContent = "Stop bot";
      document.getElementById("botButton").classList.remove("runningBg");
      document.getElementById("botButton").classList.add("stoppedBg");
      break;
    }
    case BOT_STATUS_TYPE.STOPPED: {
      document.getElementById("botStatus").innerHTML = "Stopped";
      document.getElementById("botStatus").classList.remove("runningText");
      document.getElementById("botStatus").classList.add("stoppedText");

      document.getElementById("botButton").disabled = false;
      document.getElementById("botButton").textContent = "Start bot";
      document.getElementById("botButton").classList.remove("stoppedBg");
      document.getElementById("botButton").classList.add("runningBg");
      break;
    }
    case BOT_STATUS_TYPE.NO_POPCAT_TAB: {
      document.getElementById("botStatus").innerHTML = "Can't detect POPCAT!";
      document.getElementById("botStatus").classList.remove("runningText");
      document.getElementById("botStatus").classList.add("stoppedText");

      document.getElementById("botButton").disabled = true;
      document.getElementById("botButton").textContent = "Can't start bot";
      document.getElementById("botButton").classList.remove("runningBg");
      document.getElementById("botButton").classList.add("stoppedBg");
      break;
    }
    default: {
      alert("Invalid BOT_STATUS_TYPE");
    }
  }
}
