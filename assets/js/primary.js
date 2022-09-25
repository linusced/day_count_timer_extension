var events, options, introduction, newUser, textAnimation_interval

function updateStorage() {
    chrome.storage.sync.set({ events: events, options: options, introduction: introduction }, () => chrome.runtime.sendMessage('update'))
}
function updateEvents(type, index, data) {
    switch (type) {
        case 'active':
            for (var i = 0; i < events.length; i++) events[i].active = i === index
            updateStorage()
            updateMain(events[index])
            break
        case 'edit':
            if (data.active) for (var i = 0; i < events.length; i++) events[i].active = false
            events[index] = data
            break
        case 'delete':
            events.splice(index, 1)
            break
        case 'new':
            if (data.active) for (var i = 0; i < events.length; i++) events[i].active = false
            events.push(data)
            break
    }
    if (type !== 'active') updateAll()
}

function updateAll() {
    let activeExists = false, days = [], nextIndex = null
    for (var i = 0; i < events.length; i++) {
        if (!events[i].date) events[i] = { date: events[i], title: '', active: false }
        else {
            if (typeof events[i].title !== 'string') events[i].title = ''
            if (typeof events[i].active !== 'boolean' || activeExists) events[i].active = false
            else if (events[i].active) activeExists = true
        }
        if (new Date(events[i].date).toDateString() === 'Invalid Date') {
            events.splice(i, 1)
            i--
        } else if (options.displayNextEvent) {
            events[i].active = false
            const eventDays = getDays(events[i].date)
            days.push(eventDays)
            if (eventDays < 0 && nextIndex === null) nextIndex = i
        }
    }
    if (!options.displayNextEvent && !activeExists && events[0]) events[0].active = true
    else if (options.displayNextEvent && nextIndex !== null) {
        for (var i = 0; i < days.length; i++) if (days[i] < 0 && days[i] >= days[nextIndex]) nextIndex = i
        events[nextIndex].active = true
    }
    updateStorage()

    updateMain()
    if (textAnimation_interval) clearInterval(textAnimation_interval)

    if (events.length > 0) {
        document.querySelector('table').classList.remove('hidden')
        document.querySelector('tbody').innerHTML = ''

        events.forEach((e, i) => {
            const tr = document.createElement('tr')
            if (options.displayNextEvent) {
                document.querySelector('#active-event-col').style.display = 'none'
                tr.innerHTML = '<td style="display:none"><input type="radio" class="active-event" name="active-event" disabled></td>'
            }
            else tr.innerHTML = `<td><input type="radio" class="active-event" name="active-event" title="Dislay event" data-event-index="${i}"${e.active ? ' checked' : ''}></td>`
            tr.innerHTML += `<td>${getDays(e.date)}</td><td>${e.title}</td><td>${e.date}</td><td><button class="edit-event fas fa-edit" title="Edit event" data-event-index="${i}"></button><button class="delete-event fas fa-trash" title="Delete event" data-event-index="${i}"></button></td>`
            document.querySelector('tbody').appendChild(tr)
            if (e.active) updateMain(e)
        })

        let textAnimation_array = []
        document.querySelectorAll('td').forEach(td => {
            if (td.scrollWidth > td.offsetWidth) {
                const translate = td.offsetWidth - td.scrollWidth, newElem = document.createElement('span')

                newElem.innerHTML = td.innerHTML
                newElem.setAttribute('data-animation-translate', `translateX(${translate}px)`)
                td.innerHTML = ''
                td.appendChild(newElem)

                textAnimation_array.push(newElem)
                setTimeout(() => newElem.style.transform = newElem.getAttribute('data-animation-translate'), 1)
            }
        })
        if (textAnimation_array.length > 0) textAnimation_interval = setInterval(() => textAnimation_array.forEach(elem => {
            if (elem.style.transform) elem.style.transform = ''
            else elem.style.transform = elem.getAttribute('data-animation-translate')
        }), 3000)

        if (!introduction) {
            help(helpElements().introduction)
            introduction = true
            chrome.storage.sync.set({ introduction: true })
        }
    } else {
        document.querySelector('table').classList.add('hidden')
        formPrompt(document.querySelector('#event-form'), -1, null, null, true).then(result => updateEvents('new', null, { ...result, active: true }))
    }
}
function updateMain(event) {
    if (event) {
        document.querySelector('main').classList.remove('hidden')
        document.querySelector('h3').innerHTML = getDays(event.date)
        document.querySelector('h4').innerHTML = event.title
    } else document.querySelector('main').classList.add('hidden')
}

function getDays(date) {
    const now = Date.now(),
        dateTime = new Date(`${date} 00:00:00`).getTime()
    return Math.floor((now - dateTime) / 1000 / 60 / 60 / 24)
}
function formPrompt(form, index, title, date, noCloseBtn) {
    return new Promise((resolve, reject) => {
        if (index !== false) {
            form.setAttribute('data-event-index', index)
            form.title.value = title || ''
            form.date.value = date || ''
        }

        const resetBtn = form.querySelector('[type="reset"]')
        if (noCloseBtn) resetBtn.classList.add('hidden')
        else resetBtn.classList.remove('hidden')

        form.classList.remove('hidden')
        form.addEventListener('submit', submit)
        form.addEventListener('reset', reset)

        function submit(e) {
            e.preventDefault()
            form.removeEventListener('submit', submit)
            form.classList.add('hidden')

            const inputs = form.querySelectorAll('[name]'), result = {}
            for (let i = 0; i < inputs.length; i++) result[inputs[i].name] = inputs[i].type === 'checkbox' ? inputs[i].checked : inputs[i].value
            resolve(result)
        }
        function reset() {
            form.removeEventListener('reset', reset)
            form.classList.add('hidden')
            reject()
        }
    })
}

function helpElements() {
    return {
        introduction: [
            { title: 'Introduction', text: `${newUser ? 'Welcome to Day-Count Timer Extension!' : 'Welcome to this updated version of Day-Count Timer Extension. Your old events saved in the previous version(s) of this extension are available below!'} You can skip this introduction by pressing the <button class="inactive-button button-reset fas fa-times" style="position: static;" disabled></button> above.` },
            { target: document.querySelector('#new-event'), title: 'Create a new event', text: 'This is the button for creating new events. Press this button at any time to create a new event!' },
            { target: document.querySelector('tbody > tr > td:nth-child(5)'), title: 'Edit or delete event', text: 'You can edit this event by pressing the edit button <button class="inactive-button edit-event fas fa-edit" disabled></button>. You can delete this event by pressing the delete button <button class="inactive-button delete-event fas fa-trash" disabled></button>.' },
            { target: document.querySelector('tbody > tr > td:nth-child(1) > input'), title: 'Display event', text: `These buttons specifies which event is displayed. ${document.querySelector('tbody > tr > td:nth-child(1) input').checked ? 'If this event wasn\'t displayed, then this button would look like this <input type="radio" class="inactive-button active-event" disabled>.' : 'If this event was displayed, then this button would look like this: <input type="radio" class="inactive-button active-event" checked disabled>. '}` }
        ],
        main: [
            { target: document.querySelector('h3'), title: 'Active-event Days', text: 'The amount of days since or until the displayed (active) event.' },
            { target: document.querySelector('h4'), title: 'Active-event title', text: 'The title of the displayed (active) event.' },
            { target: document.querySelector('#new-event'), title: 'Create a new event', text: 'This is the button for creating new events. Press this button at any time to create a new event!' },
            { target: document.querySelector('tbody'), title: 'Your saved events', text: 'The events that you\'ve created are displayed here. Each row represents one event.' },
            { target: document.querySelectorAll('.active-event'), title: 'Display event', text: 'These buttons specifies which event is displayed. The button for the currently active event looks like this: <input type="radio" class="inactive-button active-event" checked disabled>.' },
            { target: document.querySelectorAll('td:nth-child(2)'), title: 'Event days', text: 'This column displays the amount of days since or until the events.' },
            { target: document.querySelectorAll('td:nth-child(3)'), title: 'Event title', text: 'This column displays the title of the events.' },
            { target: document.querySelectorAll('td:nth-child(4)'), title: 'Event date', text: 'This column displays the dates of the events.' },
            { target: document.querySelectorAll('td:nth-child(5)'), title: 'Edit or delete event', text: 'You can edit or delete your events with these buttons.' }
        ]
    }
}