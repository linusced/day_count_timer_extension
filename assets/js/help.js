/**
 * @param {{target: Element|Element[]|null, title: String, text: String}} help_elements
 */
function help(help_elements) {
    if (!document.querySelector('#help-container')) {
        const _newContainer = document.createElement('div')
        document.body.appendChild(_newContainer)
        _newContainer.outerHTML = '<div id="help-container" class="hidden"><div class="progress" id="help-progress"><span></span></div><h2 data-progress=""></h2><p></p><div id="help-buttons"><button id="help-back" class="button-submit button-invert">Back</button> <button id="help-continue" class="button-submit">Continue</button></div><button id="help-close" class="button-reset fas fa-times" title="close"></button><i class="fas fa-location-arrow"></i></div>'
        addEventListener('keydown', e => {
            if (e.code === 'Escape' && !container.classList.contains('hidden')) {
                e.preventDefault()
                close()
            }
        })
    }
    const container = document.querySelector('#help-container'), progress_div = document.querySelector('#help-progress'), h2 = container.querySelector('h2'), p = container.querySelector('p'), i = container.querySelector('i'),
        closeBtn = document.querySelector('#help-close'), prevBtn = document.querySelector('#help-back'), nextBtn = document.querySelector('#help-continue')

    if (!container.classList.contains('hidden')) return

    var currentIndex = 0
    prevBtn.disabled = true
    h2.innerHTML = help_elements[currentIndex].title
    p.innerHTML = help_elements[currentIndex].text
    container.classList.remove('hidden')

    setPosition()
    progress(progress_div, currentIndex + 1, help_elements.length, h2)

    closeBtn.addEventListener('click', close)
    prevBtn.addEventListener('click', prev)
    nextBtn.addEventListener('click', next)

    function close() {
        closeBtn.removeEventListener('click', close)
        prevBtn.removeEventListener('click', prev)
        nextBtn.removeEventListener('click', next)

        container.classList.add('hidden')
        progress_div.querySelector('span').style = ''

        for (let i = 0; i < help_elements.length; i++) if (help_elements[i].target) {
            if (help_elements[i].target.length > 0) help_elements[i].target.forEach(e => e.style.outline = e.style.transform = '')
            else help_elements[i].target.style.outline = help_elements[i].target.style.transform = ''
        }
    }
    function prev() {
        currentIndex--

        prevBtn.disabled = currentIndex === 0
        h2.innerHTML = help_elements[currentIndex].title
        p.innerHTML = help_elements[currentIndex].text

        setPosition()
        progress(progress_div, currentIndex + 1, help_elements.length, h2)
    }
    function next() {
        currentIndex++

        if (currentIndex < help_elements.length) {
            prevBtn.disabled = currentIndex === 0
            h2.innerHTML = help_elements[currentIndex].title
            p.innerHTML = help_elements[currentIndex].text

            setPosition()
            progress(progress_div, currentIndex + 1, help_elements.length, h2)
        } else close()
    }
    function setPosition() {
        if (help_elements[currentIndex].target) {
            i.style = ''
            const target = help_elements[currentIndex].target.length > 0 ? help_elements[currentIndex].target[0] : help_elements[currentIndex].target, targetRect = target.getBoundingClientRect(),
                corner = ((targetRect.top + targetRect.bottom) / 2 < document.body.clientHeight / 2 ? 'top' : 'bottom') + '_' + ((targetRect.left + targetRect.right) / 2 < document.body.clientWidth / 2 ? 'left' : 'right')

            var containerRect = container.getBoundingClientRect(), iRect, offsetX, offsetY, x, y
            switch (corner) {
                case 'top_right':
                    i.className = 'fas fa-location-arrow'
                    iRect = i.getBoundingClientRect()
                    offsetX = iRect.right - containerRect.right
                    offsetY = containerRect.top - iRect.top
                    x = targetRect.left - containerRect.width - offsetX
                    y = targetRect.bottom + offsetY
                    break
                case 'bottom_right':
                    i.className = 'fas fa-location-arrow fa-rotate-90'
                    iRect = i.getBoundingClientRect()
                    offsetX = iRect.right - containerRect.right
                    offsetY = iRect.bottom - containerRect.bottom
                    x = targetRect.left - containerRect.width - offsetX
                    y = targetRect.top - containerRect.height - offsetY
                    break
                case 'bottom_left':
                    i.className = 'fas fa-location-arrow fa-rotate-180'
                    iRect = i.getBoundingClientRect()
                    offsetX = containerRect.left - iRect.left
                    offsetY = iRect.bottom - containerRect.bottom
                    x = targetRect.right + offsetX
                    y = targetRect.top - containerRect.height - offsetY
                    break
                case 'top_left':
                    i.className = 'fas fa-location-arrow fa-rotate-270'
                    iRect = i.getBoundingClientRect()
                    offsetX = containerRect.left - iRect.left
                    offsetY = containerRect.top - iRect.top
                    x = targetRect.right + offsetX
                    y = targetRect.bottom + offsetY
                    break
            }

            container.style = `left:${x}px;top:${y}px;`
            containerRect = container.getBoundingClientRect()

            if (containerRect.left < 0) {
                container.style.left = 0
                iRect = i.getBoundingClientRect()
                if (iRect.right > targetRect.right) i.style.right = `${iRect.right - targetRect.left + parseFloat(getComputedStyle(i).right)}px`
            } else if (containerRect.right > document.body.clientWidth) {
                container.style.left = `${document.body.clientWidth - containerRect.width}px`
                iRect = i.getBoundingClientRect()
                if (iRect.left < targetRect.left) i.style.left = `${targetRect.right - iRect.left + parseFloat(getComputedStyle(i).left)}px`
            }

            if (help_elements[currentIndex].target.length > 0) help_elements[currentIndex].target.forEach(e => e.style.outline = '5px dashed var(--color-3)')
            else target.style.outline = '5px dashed var(--color-3)'

            for (let i = 0; i < help_elements.length; i++) if (i !== currentIndex && help_elements[i].target) {
                if (help_elements[i].target.length > 0) help_elements[i].target.forEach(e => e.style.outline = e.style.transform = '')
                else help_elements[i].target.style.outline = help_elements[i].target.style.transform = ''
            }

        } else {
            container.style = `left:${(document.body.clientWidth - container.getBoundingClientRect().width) / 2}px;top:55px;`
            i.style = 'display:none'
            for (let i = 0; i < help_elements.length; i++) if (help_elements[i].target) {
                if (help_elements[i].target.length > 0) help_elements[i].target.forEach(e => e.style.outline = e.style.transform = '')
                else help_elements[i].target.style.outline = help_elements[i].target.style.transform = ''
            }
        }
    }
    function progress(progress_div, value, max, textElement) {
        if (textElement) textElement.setAttribute('data-progress', `${value}/${max}`)
        setTimeout(() => progress_div.querySelector('span').style = `width:${Math.round(value / max * 100 * 100) / 100}%;`, 1)
    }
}