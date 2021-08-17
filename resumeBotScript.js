botInterval = setInterval(startBot, 500);

function startBot() {
  var event = new KeyboardEvent("keydown", {
    key: "kuyteenarhooaisud5555",
    ctrlKey: true,
  });

  for (i = 0; i < 1000; i++) {
    document.dispatchEvent(event);
  }

  let cookie = document.cookie;
  if (cookie.includes("bot")) {
    document.cookie = "bot=false; Expires=Thu, 01 Jan 1970 00:00:01 GMT; secure";
    document.location.reload();
  }
}
