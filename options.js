// TODO fix TypeError: can't access dead object
// TODO default values of time fields?

const KEY_IN_STORAGE = "timePeriods" // A key to identify the item to be retrieved from storage

function restoreOptions() {
    browser.storage.local.get([KEY_IN_STORAGE]).then(onGot, onError)

    function onGot(result) {
        if (result.timePeriods === undefined) return
        showList(result.timePeriods)
    }
}

function saveOptions(e) {
    e.preventDefault()
    browser.storage.local.get([KEY_IN_STORAGE]).then(onGot, onError)

    function onGot(result) {
        var array = result.timePeriods === undefined ? new Array() : result.timePeriods
        var startTime = document.querySelector("#start-time").value
        var endTime = document.querySelector("#end-time").value
        array.push(`${startTime}-${endTime}`)
        browser.storage.local.set({ timePeriods: array })
        showList(array)
        notifyBackground()
    }
}

// TODO rename array 
function showList(array) {
    // var table = document.querySelector('#table')
    var tbody = document.querySelector('#tbody')
    // var list = document.querySelector('#list')

    // var t = ""

    // table.innerHTML = ''
    tbody.innerHTML = ''

    for (var i = 0; i < array.length; i++) {
        var parts = array[i].split('-')


        var button = document.createElement('button')

        button.textContent = '⨯'
        // button.setAttribute('class', 'delete-button')
        button.id = 'delete-button'
        button.index = i
        button.addEventListener('click', sf, false)
        // TODO rename
        function sf(element) {
            // console.log(element.target.index)
            // console.log(element.target)
            // TODO refactor index
            // var nodes = Array.from(element.target.closest('tbody').children)
            // var index = nodes.indexOf(element.target)
            console.log(element.target.index)
            array.splice(element.target.index, 1)
            browser.storage.local.set({
                timePeriods: array
            })
            this.parentElement.parentElement.remove()
            notifyBackground()
            restoreOptions()

        }

        var tr = document.createElement('tr');

        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td')

        var text1 = document.createTextNode(parts[0])
        var text2 = document.createTextNode(parts[1])

        td1.appendChild(text1);
        td2.appendChild(text2);
        td3.appendChild(button)
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3)

        // table.appendChild(tr);
        tbody.appendChild(tr)
    }



    /* // clear ul
    list.innerHTML = ""
    // fill ul by dates and buttons
    for (var i = 0; i < array.length; i++) {
        list.innerHTML += '<li name=' + i + '>' + array[i]
            + '\t<button class="delete-button">⨯</button></li>'
    }

    // some magic for add to every button click handler
    var lis = document.getElementsByTagName('li')
    for (var i = 0; i < lis.length; i++) {
        lis[i].firstElementChild.onclick = function () {
            var nodes = Array.from(this.closest('ul').children)
            var index = nodes.indexOf(this.parentElement)
            array.splice(index, 1)
            browser.storage.local.set({
                timePeriods: array
            })
            this.parentElement.remove()
            notifyBackground()
        }
    } */
}

function notifyBackground() { browser.runtime.sendMessage({}) }
function onError(e) { console.log(e) }

document.addEventListener("DOMContentLoaded", restoreOptions)
// document.querySelector("form").addEventListener("submit", saveOptions)
// document.querySelector("#add-button").addEventListener('click', saveOptions, false)
document.getElementById('add-button').addEventListener('click', saveOptions, false)

// set the time in the second field when changing the first
document.getElementById("start-time").onchange = function () {
    var input = document.getElementById("end-time")
    input.setAttribute("min", this.value)
    input.value = this.value
    input.stepUp(1)
}