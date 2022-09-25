function getDays(date) {
    const now = Date.now(),
        dateTime = new Date(`${date} 00:00:00`).getTime()
    return Math.floor((now - dateTime) / 1000 / 60 / 60 / 24)
}
function setIcon(date) {
    let days = 0
    if (date) days = getDays(date)
    const text = Math.abs(days).toString(), canvas = new OffscreenCanvas(16, 16), ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 16, 16)
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    switch (text.length) {
        case 1:
            ctx.font = '19px arial'
            ctx.fillText(text, (16 * 0.5), 0)
            break
        case 2:
            ctx.font = '14px arial'
            ctx.fillText(text, (16 * 0.5), 2)
            break
        default:
            ctx.textAlign = 'left'
            ctx.font = '9px arial'
            ctx.fillText(text, 0, 4, 16)
    }
    chrome.browserAction.setIcon({ imageData: ctx.getImageData(0, 0, 16, 16) })
}
function update() {
    chrome.storage.sync.get(['events', 'options'], result => {
        const events = result.events?.constructor.name === 'Array' ? result.events : [], options = result.options?.constructor.name === 'Object' ? result.options : {}, days = []
        let nextIndex = null
        for (var i = 0; i < events.length; i++) {
            if (options.displayNextEvent) {
                events[i].active = false
                const eventDays = getDays(events[i].date)
                days.push(eventDays)
                if (eventDays < 0 && nextIndex === null) nextIndex = i
            } else if (events[i].active === true) break
        }
        if (options.displayNextEvent && nextIndex !== null) {
            for (var i = 0; i < days.length; i++) if (days[i] < 0 && days[i] >= days[nextIndex]) nextIndex = i
            i = nextIndex
        } else if (options.displayNextEvent) i = -1
        if (new Date(events[i]?.date).toDateString() !== 'Invalid Date') setIcon(events[i].date)
        else setIcon()
    })
}

addEventListener('load', update)
chrome.runtime.onMessage.addListener(msg => {
    if (msg === 'update') update()
})