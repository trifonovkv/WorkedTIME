const ON_ICON_PATH = { path: "icons/ic_alarm_on_green_48pt.png" }
const OFF_ICON_PATH = { path: "icons/ic_alarm_off_red_48dp.png" }
const MATCH_ALL_URLS_PATTERN = "*://*/*"  // Match all HTTP, HTTPS and WebSocket URLs
const TITLE_OF_NOTIFICATION = "WorkedTIME"
const KEY_IN_STORAGE = "timePeriods" // A key to identify the item to be retrieved from storage

var isBlocking = false
var timePeriod

browser.webRequest.onBeforeRequest.addListener(
    function () { return { cancel: isBlocking } },
    { urls: [MATCH_ALL_URLS_PATTERN] },
    ["blocking"] // make the request synchronous, so you can cancel the request
);

browser.webNavigation.onBeforeNavigate.addListener(function () {
    if (isBlocking) {
        showNotification(timePeriod)
    }
    switchIconTo(!isBlocking)
})

function showNotification(timeRangeString) {
    var times = timeRangeString.split("-")
    browser.notifications.create({
        "type": "basic",
        "title": TITLE_OF_NOTIFICATION,
        "message": `Offline from ${times[0]} to ${times[1]}`
    });
}

// fired when options changed
browser.runtime.onMessage.addListener(function () {
    browser.storage.local.get([KEY_IN_STORAGE]).then(
        function (result) {
            timePeriod = getTimePeriodByNowTime(result.timePeriods)
            if (timePeriod === undefined) {
                isBlocking = false
            }
            else {
                isBlocking = true
            }
            switchIconTo(!isBlocking)
        },
        function (e) {
            console.log(e)
        }
    )
})

function switchIconTo(isOn) {
    browser.browserAction.setIcon(isOn ? ON_ICON_PATH : OFF_ICON_PATH)
}

function getTimePeriodByNowTime(timePeriods) {
    var range
    timePeriods.forEach(function (item) {
        if (isNowInTimePeriod(item) === true) {
            range = item
        }
    })
    return range
}

function isNowInTimePeriod(timePeriod) {
    var timesStrings = timePeriod.split("-")
    var startTime = parseTime(timesStrings[0])
    var endTime = parseTime(timesStrings[1])
    var nowTime = new Date()
    return (startTime < nowTime && nowTime < endTime)
}

// ex. 12:30
function parseTime(string) {
    var parts = string.split(":")
    var date = new Date()
    date.setHours(parts[0])
    date.setMinutes(parts[1])
    return date
}

// show option page when click on a browser action button
browser.browserAction.onClicked.addListener(function () { browser.runtime.openOptionsPage() })