function updateContent() {
    browser.storage.local.get().then(onGot, onError)

    function onGot(result) {
        document.getElementById('enable-switch').checked = result.isEnable === undefined ? true : result.isEnable
        if (result.timePeriods === undefined) return
        fillTable(result.timePeriods)
    }
}

function saveOptions(e) {
    e.preventDefault()
    browser.storage.local.set({ isEnable: document.getElementById('enable-switch').checked })
    browser.storage.local.get().then(onGot, onError)

    function onGot(result) {
        var array = result.timePeriods === undefined ? new Array() : result.timePeriods
        var startTime = document.getElementById('start-time').value
        var endTime = document.getElementById('end-time').value
        array.push(`${startTime}-${endTime}`)
        browser.storage.local.set({ timePeriods: array })
        fillTable(array)
        notifyBackground()
    }
}

function fillTable(list) {
    var tbody = document.getElementById('tbody')
    tbody.innerHTML = ''

    for (var i = 0; i < list.length; i++) {
        var parts = list[i].split('-')

        var startTime = document.createTextNode(parts[0])
        var endTime = document.createTextNode(parts[1])
        var deleteButton = createDeleteButton(i)

        var row = makeRow([startTime, endTime, deleteButton])
        tbody.appendChild(row)
    }

    function createDeleteButton(index) {
        var button = document.createElement('button')
        button.textContent = '⨯'
        button.id = 'delete-button'
        button.index = index
        button.addEventListener('click', deleteButtonListener, false)
        return button
    }

    function deleteButtonListener() {
        list.splice(this.index, 1)
        browser.storage.local.set({
            timePeriods: list
        })
        this.parentElement.parentElement.remove()
        notifyBackground()
        updateContent()
    }

    function makeRow(childs) {
        var tr = document.createElement('tr')
        childs.forEach(child => {
            var td = document.createElement('td')
            td.appendChild(child)
            tr.appendChild(td)
        });
        return tr
    }
}

function notifyBackground() { browser.runtime.sendMessage({}) }

function onError(e) { console.log(e) }

document.addEventListener('DOMContentLoaded', updateContent)
document.getElementById('add-button').addEventListener('click', saveOptions, false)

// set the time in the second field when changing the first
document.getElementById('start-time').onchange = function () {
    var input = document.getElementById('end-time')
    input.setAttribute('min', this.value)
    input.value = this.value
}

var checkbox = document.getElementById('enable-switch')
checkbox.addEventListener('change', function () {
    browser.storage.local.set({ isEnable: checkbox.checked })
    notifyBackground()
})