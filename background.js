var ActionIcon = {
    ON: "icons/ic_alarm_on_green_48px.png",
    OFF: "icons/ic_alarm_off_red_48px.png",
    DISABLE: "icons/ic_alarm_grey_48px.png",
    update(blockingSchedule) {
        var icon = new Object()
        if (blockingSchedule.isEnable) {
            icon.path = blockingSchedule.isBlockingActive ? this.OFF : this.ON
        }
        else {
            icon.path = this.DISABLE
        }
        browser.browserAction.setIcon(icon)
    }
}

var Notification = {
    show(timeRangeString) {
        var times = timeRangeString.split('-')
        browser.notifications.create({
            'type': 'basic',
            'title': 'WorkedTIME',
            'message': `Offline from ${times[0]} to ${times[1]}`
        })
    }
}

var Time = {
    // ex. 12:30
    parse(string) {
        var parts = string.split(':')
        var date = new Date()
        date.setHours(parts[0])
        date.setMinutes(parts[1])
        return date
    }
}

var TimePeriod = {
    getByNow(timePeriods) {
        var range
        if (timePeriods === undefined) return range
        timePeriods.forEach(function (item) {
            if (TimePeriod.isNow(item) === true) {
                range = item
            }
        })
        return range
    },

    isNow(timePeriod) {
        var timesStrings = timePeriod.split('-')
        var startTime = Time.parse(timesStrings[0])
        var endTime = Time.parse(timesStrings[1])
        var nowTime = new Date()
        return (startTime < nowTime && nowTime < endTime)
    }
}

var BlockingSchedule = {
    isEnable: true,
    timePeriod: undefined,
    get isBlockingActive() {
        var inTimePeriod = this.timePeriod === undefined ? false : true
        return inTimePeriod && this.isEnable
    },
    update() {
        browser.storage.local.get().then(
            function (result) {
                BlockingSchedule.isEnable = result.isEnable === undefined ? true : result.isEnable
                BlockingSchedule.timePeriod = TimePeriod.getByNow(result.timePeriods)
                ActionIcon.update(BlockingSchedule)
            },
            function (e) {
                console.log(e)
            }
        )
    }
}

function requestListener() {
    BlockingSchedule.update()
    return { cancel: BlockingSchedule.isBlockingActive }
}

function showNotification() {
    BlockingSchedule.update()
    if (BlockingSchedule.isBlockingActive) {
        Notification.show(BlockingSchedule.timePeriod)
    }
}

function showOptionPage() {
    browser.runtime.openOptionsPage()
}

BlockingSchedule.update()

browser.webRequest.onBeforeRequest.addListener(
    requestListener,
    { urls: ["*://*/*"] },  // Match all HTTP, HTTPS and WebSocket URLs
    ['blocking']            // make the request synchronous, so you can cancel the request
)

browser.webNavigation.onBeforeNavigate.addListener(showNotification)

// fired when options changed
browser.runtime.onMessage.addListener(BlockingSchedule.update)

// show option page when click on a browser action button
browser.browserAction.onClicked.addListener(showOptionPage)