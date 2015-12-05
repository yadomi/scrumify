//     Rugby Chrome Extension v1.0
//     http://github.com/yadomi/rugby

var REGEX_CONSUMED =  /\((\d*)\)/
var REGEX_ESTIMATED = /\[(\d*)\]/

var updateCardsPoints = _.throttle(function() {

  Array.prototype.slice.call(document.querySelectorAll('.list-cards')).forEach(function(list){

    var cardsTitle = Array.prototype.slice.call(list.querySelectorAll('.list-card-title'));

    var cardPoints = cardsTitle.map(function(element){
      var rawTitle = cacheCardTitle(element);
      updateCardBadge(element);
      return getCardsPoints(rawTitle);
    });

    var totalPoints = cardPoints.reduce(function(sum, points) {
      sum.estimated += points.estimated;
      sum.consumed  += points.consumed;
      return sum;
    }, {
      estimated: 0,
      consumed: 0
    });

    var listHeader = list.parentElement.querySelector('.list-header');
    updateListHeader(listHeader, totalPoints);

  });

}, 500);

var parseTitle = function(str) {
  str = str.replace(REGEX_ESTIMATED, '')
  str = str.replace(REGEX_CONSUMED, '');
  return str.trim();
}

var cacheCardTitle = function(e) {
  if (parseTitle(e.dataset.rawTitle || e.innerText) === e.innerText) return e.dataset.rawTitle;
  e.dataset.rawTitle = e.innerText;
  e.innerText = parseTitle(e.innerText);
  return e.dataset.rawTitle;
}

var updateCardBadge = function(title) {
  // var badges = title.parentElement.querySelector('.badges');
  // add badge to cards
}

var updateListHeader = function(header, points) {
  var counter = header.querySelector('.cards-counter')
  if (!counter) counter = appendCounterToHeader(header);
  counter.innerText = points.consumed + ' / ' + points.estimated;
}

var appendCounterToHeader = function(header) {
  var counter = document.createElement('div');
  counter.classList.add('cards-counter');
  header.insertBefore(counter, header.querySelector('list-header-name'));
  return counter;
}

var getCardsPoints = function(str) {
  return {
    estimated: getEstimatedPoints(str),
    consumed: getConsumedPoints(str),
  };
}

var getEstimatedPoints = function(str) {
  var re = str.match(REGEX_ESTIMATED);
  if(!re) return 0;
  return Number(re[1]);
}

var getConsumedPoints = function(str) {
  var re = str.match(REGEX_CONSUMED);
  if(!re) return getEstimatedPoints(str);
  return Number(re[1]);
}

var GlobalObserver = function(mutations) {
  if (!mutations) return;

  var triggerClass = ['list-cards', 'badges', 'window-module'];

  mutations.forEach(function(mutation){
    if(mutation.target && mutation.target.classList) {
      var trigger = !!triggerClass.filter(function(c){
        return mutation.target.classList.contains(c);
      }).length;
      if(trigger) updateCardsPoints();
    }
  });

};

var observer = new MutationObserver(GlobalObserver);
var config = { childList: true, characterData: true, attributes: false, subtree: true };

observer.observe(document.body, config);
updateCardsPoints();