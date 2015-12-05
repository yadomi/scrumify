//     Rugby Chrome Extension v1.0
//     http://github.com/yadomi/rugby

const REGEX_CONSUMED =  /\((\d*)\)/;
const REGEX_ESTIMATED = /\[(\d*)\]/;

const updateCardsPoints = _.throttle(() => {

    Array.prototype.slice.call(document.querySelectorAll('.list-cards')).forEach(function(list){

        const cardsTitle = Array.prototype.slice.call(list.querySelectorAll('.list-card-title'));

        const cardPoints = cardsTitle.map( element => {
            const rawTitle = cacheCardTitle(element);
            updateCardBadge(element);
            return getCardsPoints(rawTitle);
        });

        const totalPoints = cardPoints.reduce( (sum, points) => {
            sum.estimated += points.estimated;
            sum.consumed  += points.consumed;
            return sum;
        }, {
            estimated: 0,
            consumed: 0,
        });

        const listHeader = list.parentElement.querySelector('.list-header');
        updateListHeader(listHeader, totalPoints);

    });

}, 500);

const parseTitle = str => {
    str = str.replace(REGEX_ESTIMATED, '');
    str = str.replace(REGEX_CONSUMED, '');
    return str.trim();
};

const cacheCardTitle = e => {
    if (parseTitle(e.dataset.rawTitle || e.innerText) === e.innerText) return e.dataset.rawTitle;
    e.dataset.rawTitle = e.innerText;
    e.innerText = parseTitle(e.innerText);
    return e.dataset.rawTitle;
};

const updateCardBadge = function(title) {
  // const badges = title.parentElement.querySelector('.badges');
  // add badge to cards
};

const updateListHeader = (header, points) => {
    var counter = header.querySelector('.cards-counter');
    if (!counter) counter = appendCounterToHeader(header);
    counter.innerText = points.consumed + ' / ' + points.estimated;
};

const appendCounterToHeader = header => {
    var counter = document.createElement('div');
    counter.classList.add('cards-counter');
    header.insertBefore(counter, header.querySelector('list-header-name'));
    return counter;
};

const getCardsPoints = str => {
    return {
        estimated: getEstimatedPoints(str),
        consumed: getConsumedPoints(str),
    };
};

const getEstimatedPoints = str => {
    var re = str.match(REGEX_ESTIMATED);
    if(!re) return 0;
    return Number(re[1]);
};

const getConsumedPoints = str => {
    var re = str.match(REGEX_CONSUMED);
    if(!re) return getEstimatedPoints(str);
    return Number(re[1]);
};

const GlobalObserver = mutations => {
    if (!mutations) return;

    const triggerClass = ['list-cards', 'badges', 'window-module'];

    mutations.forEach( mutation => {
        if(mutation.target && mutation.target.classList) {
            var trigger = !!triggerClass.filter(function(c){
                return mutation.target.classList.contains(c);
            }).length;
            if(trigger) updateCardsPoints();
        }
    });

};

const observer = new MutationObserver(GlobalObserver);
const config = { childList: true, characterData: true, attributes: false, subtree: true };

observer.observe(document.body, config);
updateCardsPoints();