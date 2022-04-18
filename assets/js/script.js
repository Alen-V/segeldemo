const html = document.querySelector('html')
const body = document.querySelector('body')
const mainContainer = document.getElementById('main')
const membersContainer = document.getElementById('membersContainer')
const loader = document.getElementById('loading')
const loadMore = document.getElementById('loadMore')
const filters = document.querySelectorAll('.filter-item')
const brgBtn = document.getElementById('burgerBtn')
const burgerBtn = document.querySelector('.burger-button')
const nav = document.getElementById('nav')
const newsItems = document.querySelectorAll('.news-headline-item')
const newsArticleModal = document.getElementById('newsArticleModal')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const slides = document.querySelector('.slides')
const slideItem = document.querySelector('.slider-item')
const closeButton = document.getElementById('closeButton')
const navItems = document.querySelectorAll('.navbar-item')

const memory = {
    data: {},
    pagination: {},
    proportions: '',
    url: 'https://challenge-api.view.agentur-loop.com/api.php',
    params: {
        limit: 5,
        page: 1
    },
    menuOpen: false,
    slideNum: slides.querySelectorAll('.slider-item').length,
    currentSlide: 1,
    slideValue: 100,
    loadedMembers: [],
    printLines: 1,
    memberPerLine: 1
}

function calculatePageProportions() {
    let divide = 1;
    const width = this.screen.availWidth || this.innerWidth
    const clientWidth = width > 1400 ? mainContainer.clientWidth : width
    if (width >= 1024) {
        burgerBtn.classList.add('d-none')
    } else {
        if (width < 375) memory.slideValue = 77
        else if (width <= 425) memory.slideValue = 76
        else if (width <= 768) memory.slideValue = 74
        burgerBtn.classList.remove('d-none')
    }
    if (width >= 992) divide = 5
    else if (width >= 560) divide = 3
    else if (width > 375) {
        memory.printLines = 2
        divide = 2
    } else {
        memory.printLines = 4
        divide = 1
    }
    memory.params.limit = divide >= 3 ? divide : 4
    memory.memberPerLine = divide
    memory.proportions = `${clientWidth / divide}px`
}

const checkParams = () => {
    const { limit, page, duty } = memory.params
    let url = `${memory.url}?`
    if (limit) url += `limit=${limit}`
    if (page) url += `&page=${page}`
    if (duty) url += `&duty=${duty}`
    return url
}

calculatePageProportions()
const url = `${memory.url}${memory.params.limit ? `?limit=${memory.params.limit}` : ''}`

const setCardProportions = (card, proportions) => {
    card.style.height = proportions
    card.style.width = proportions
}

const fetchData = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    memory.data = data.data.data;
    memory.pagination = data.data.meta.pagination
}

const printMembers = (data) => {
    const membersLine = document.createElement('div')
    membersLine.classList.add(...['d-flex', 'members-line-container'])
    data.forEach(member => {
        membersLine.append(printMember(member))
    });
    return membersLine
}

const loadMembers = async (url) => {
    await fetchData(url);
    const { data, pagination } = memory
    memory.loadedMembers.push(...data)
    if (memory.printLines > 1) {
        let start = 0
        for (let i = 0; i < memory.printLines; i++) {
            const end = start + memory.memberPerLine
            const members = [...data.slice(start, end)]
            membersContainer.append(printMembers(members))
            start = end
        }
    } else {
        membersContainer.append(printMembers(data))
    }
    const { current_page, total_pages } = pagination
    if (current_page < total_pages) {
        loadMore.classList.remove('d-none')
    } else {
        loadMore.classList.add('d-none')
    }
    loader.classList.add('d-none')
}

const printMember = (member) => {
    const { name, image } = member
    const card = document.createElement('div')
    card.classList.add('member-card')
    setCardProportions(card, memory.proportions)
    const img = document.createElement('div')
    img.classList.add('member-image')
    img.style.backgroundImage = `url(${image})`
    const details = document.createElement('div')
    details.classList.add(...['member-details', 'd-flex'])
        const nameEl = document.createElement('span')
            nameEl.classList.add('member-details-name')
            nameEl.innerHTML = name
        const description = document.createElement('span')
            description.innerHTML = 'Random quotes of the day'
    details.append(...[nameEl, description])
    card.append(...[img, details])
    return card  
}

loadMembers(url);

const loadMoreMembers = () => {
    const { current_page, total_pages } = memory.pagination
    membersContainer.style.height = `unset`
    if (current_page < total_pages) {
        memory.params.page = current_page+1
        const url = checkParams()
        loadMembers(url)
    }
}

function handleFilterClickEvent() {
    document.querySelector('.filter-item.selected').classList.remove('selected')
    this.classList.add('selected')
    membersContainer.style.height = `${(memory.printLines * memory.proportions.split('p')[0]) + 15}px`
    membersContainer.innerHTML = ''
    membersContainer.append(loader)
    loader.classList.remove('d-none')
    const filter = this.id;
    delete memory.params.page
    memory.params.duty = filter === 'all' ? '' : filter
    const url = checkParams()
    loadMembers(url)
}

const openMobMenu = () => {
    brgBtn.classList.add('open')
    mainContainer.classList.add('menu-open')
}

const closeMobMenu = () => {
    brgBtn.classList.remove('open')
    mainContainer.classList.remove('menu-open')
    setPageToDefault()
}

const setPageToDefault = () => {
    body.style.overflow = ''
    memory.menuOpen = false
}

const handleBurgerBtnEvent = () => {
    if (memory.menuOpen) closeMobMenu()
    else openMobMenu()
    if (mainContainer.classList.contains('menu-open')) {
        body.style.overflow = 'hidden'
        memory.menuOpen = true
    } else {
        setPageToDefault()
    }
}

const handleClickOutsideMobMenu = (e) => {
    if (window.innerWidth >= 1024 || !memory.menuOpen) return
    if (!nav.contains(e.target) && !burgerBtn.contains(e.target)) {
        closeMobMenu()
    }
}

const handleSliderBtn = (btn) => {
    if (btn === 'prev') {
        memory.currentSlide -= 1
        if (memory.currentSlide === 1) {
            prevBtn.classList.add('d-none')
        }
        nextBtn.classList.remove('d-none')
    } else if (btn === 'next') {
        memory.currentSlide += 1
        if (memory.currentSlide === memory.slideNum) {
            nextBtn.classList.add('d-none')
        }
        prevBtn.classList.remove('d-none')
    }
    slides.style.transform = `translateX(-${(memory.currentSlide - 1) * memory.slideValue}%)`
}

const handleNewsArticleEvent = (event) => {
    if (event === 'open') {
        mainContainer.classList.add('news-article-open')
        newsArticleModal.classList.add('open')
    } else if (event === 'close') {
        mainContainer.classList.remove('news-article-open')
        newsArticleModal.classList.remove('open')
        newsArticleModal.scrollTop = 0
    }
}

function resetMembers() {
    memory.params.page = 1
    calculatePageProportions()
    membersContainer.innerHTML = ''
    const url = checkParams()
    loadMembers(url)
}

loadMore.addEventListener('click', loadMoreMembers)

mainContainer.addEventListener('click', handleClickOutsideMobMenu)

filters.forEach(filterEl => {
    filterEl.addEventListener('click', handleFilterClickEvent)
})

burgerBtn.addEventListener('click', handleBurgerBtnEvent)

newsItems.forEach(newsItem => {
    newsItem.addEventListener('click', () => handleNewsArticleEvent('open'))
})

prevBtn.addEventListener('click', () => handleSliderBtn('prev'));
nextBtn.addEventListener('click', () => handleSliderBtn('next'))
closeButton.addEventListener('click', () => handleNewsArticleEvent('close'))

window.addEventListener('orientationchange', function() {
    resetMembers()
})

navItems.forEach(navItem => {
    navItem.addEventListener('click', () => memory.menuOpen && closeMobMenu())
})

let xDown = null;                                                        
let yDown = null;
function getTouches(evt) {
    return evt.touches || evt.originalEvent.touches;
}                                                     
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) return
    const xUp = evt.touches[0].clientX;                                    
    const yUp = evt.touches[0].clientY;
    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            closeMobMenu()
        }    
    } 
    /* reset values */
    xDown = null;
    yDown = null;                                             
};
document.addEventListener('touchstart',  (e) => {
    if (window.innerWidth >= 1024 || !memory.menuOpen) return
    handleTouchStart(e)
}, false);        
document.addEventListener('touchmove', (e) => {
    if (window.innerWidth >= 1024 || !memory.menuOpen) return
    handleTouchMove(e)
}, false);