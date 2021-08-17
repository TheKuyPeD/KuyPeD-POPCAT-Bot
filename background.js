const WEB = "popcat.click";

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

chrome.runtime.onInstalled.addListener(() => {
  const defaultData = {
    hasPopCatTab: false,
    popCatTab: null,
    isBotStart: false,
    autoRestart: false,
  };
  chrome.storage.sync.set(defaultData, function () {
    console.log("ON BOT INSTALLED AND INITIALIZED DATA");
  });
});

chrome.webNavigation.onCommitted.addListener((details) => {
  const targetTypes = ["reload", "link", "typed", "generated"];
  if (targetTypes.includes(details.transitionType) && details.url.includes(WEB)) {
    chrome.webNavigation.onCompleted.addListener(function onComplete() {
      chrome.storage.sync.get(null, function (data) {
        const tabId = data.popCatTab.id;

        if (data.autoRestart) {
          chrome.tabs.update(tabId, { muted: false });
          chrome.tabs.update(tabId, { muted: true });
          // isBotStart = true;
          chrome.scripting.executeScript({
            target: { tabId },
            files: ["resumeBotScript.js"],
          });
          chrome.storage.sync.set({ isBotStart: true });
        }

        console.log("KUY REFRESH hasPopCatTab: ", data.hasPopCatTab);
        console.log("KUY REFRESH popCatTab: ", data.popCatTab);
        console.log("KUY REFRESH isBotStart: ", data.isBotStart);
        console.log("KUY REFRESH autoRestart: ", data.autoRestart);

        chrome.webNavigation.onCompleted.removeListener(onComplete);
      });
    });
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  console.log("BG Connected .....");
  port.onMessage.addListener(function (request) {
    console.log("BG MESSAGE RECEIVED", request, port);
    if (request.msg === MESSAGES.CHECK_TAB) {
      checkTabs(port);
    } else if (request.msg === MESSAGES.BOT_BUTTON_CLICK) {
      handleBotButtonClick(port);
    }
  });
});

async function checkTabs(port) {
  let queryOptions = {};
  let tabs = await chrome.tabs.query(queryOptions);
  let hasPopCatTab = false;
  let popCatTab = null;

  tabs.forEach((tab) => {
    if (tab.url.includes(WEB)) {
      hasPopCatTab = true;
      popCatTab = tab;
    }
  });

  chrome.storage.sync.set({ hasPopCatTab, popCatTab });

  chrome.storage.sync.get(null, function (data) {
    console.log("BG CHECK TAB data", data);
    if (data.hasPopCatTab && data.isBotStart) {
      port.postMessage({ msg: MESSAGES.SET_STATUS_TEXT, statusType: BOT_STATUS_TYPE.RUNNING });
    } else if (data.hasPopCatTab && !data.isBotStart) {
      port.postMessage({ msg: MESSAGES.SET_STATUS_TEXT, statusType: BOT_STATUS_TYPE.STOPPED });
    } else if (!data.hasPopCatTab) {
      port.postMessage({ msg: MESSAGES.SET_STATUS_TEXT, statusType: BOT_STATUS_TYPE.NO_POPCAT_TAB });
    }
  });
}

async function handleBotButtonClick(port) {
  chrome.storage.sync.get(null, function (data) {
    let isBotStart = null;
    let autoRestart = null;
    const tabId = data.popCatTab.id;

    if (data.isBotStart) {
      // ----------------------------------------- stop bot case
      isBotStart = false;
      autoRestart = false;
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["stopBotScript.js"],
      });
      port.postMessage({ msg: MESSAGES.SET_STATUS_TEXT, statusType: BOT_STATUS_TYPE.STOPPED });
    } else {
      // ----------------------------------------- start bot case
      isBotStart = true;
      autoRestart = true;
      chrome.tabs.update(tabId, { muted: false });
      chrome.tabs.update(tabId, { muted: true });
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["startBotScript.js"],
      });
      port.postMessage({ msg: MESSAGES.SET_STATUS_TEXT, statusType: BOT_STATUS_TYPE.RUNNING });
    }

    chrome.storage.sync.set({ isBotStart, autoRestart });
  });
}
