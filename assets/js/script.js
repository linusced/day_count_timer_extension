chrome.storage.sync.get(['events', 'options', 'introduction'], result => {
    if (!result.events) newUser = true
    events = result.events?.constructor.name === 'Array' ? result.events : []
    options = result.options?.constructor.name === 'Object' ? result.options : {}
    introduction = typeof result.introduction === 'boolean' ? result.introduction : false

    updateAll()

    document.querySelector('tbody').addEventListener('click', e => {
        const index = parseInt(e.target.getAttribute('data-event-index'))
        if (isNaN(index)) return

        const classList = e.target.classList
        if (classList.contains('active-event')) updateEvents('active', index)
        else if (classList.contains('delete-event')) updateEvents('delete', index)
        else if (classList.contains('edit-event')) {
            formPrompt(document.querySelector('#event-form'), index, events[index].title, events[index].date).then(result => {
                updateEvents('edit', index, result)
            }).catch(() => null)
        }
    })

    document.querySelector('#new-event').addEventListener('click', () => {
        formPrompt(document.querySelector('#event-form'), -1).then(result => {
            updateEvents('new', null, { ...result, active: true })
        }).catch(() => null)
        document.querySelector('#options-displayNextEvent').checked = options.displayNextEvent ? true : false
        document.querySelector('#options-colorTheme').value = options.colorTheme === 'light' || options.colorTheme === 'dark' ? options.colorTheme : 'auto'
    })

    document.querySelector('#help-btn').addEventListener('click', () => help(helpElements().main))
    document.querySelector('#options-btn').addEventListener('click', () => formPrompt(document.querySelector('#options-form'), false).then(result => {
        options = result
        updateStorage()
        location.reload()
    }).catch(() => null))

    addEventListener('keydown', e => {
        if (e.code === 'Escape' || e.code === 'Enter') {
            document.querySelectorAll('form').forEach(form => {
                if (e.code === 'Escape') {
                    e.preventDefault()
                    if (!form.classList.contains('hidden') && !form.querySelector('[type="reset"]').classList.contains('hidden')) form.querySelector('[type="reset"]').click()
                } else if (e.code === 'Enter' && !form.classList.contains('hidden') && e.target.tagName !== 'INPUT') form.querySelector('[type="submit"]').click()
            })
        }
    })

    if (options.displayNextEvent) document.querySelector('#options-displayNextEvent').checked = true
    if (options.colorTheme === 'light' || options.colorTheme === 'dark') {
        document.documentElement.classList.add(options.colorTheme)
        document.querySelector('#options-colorTheme').value = options.colorTheme
    }
})