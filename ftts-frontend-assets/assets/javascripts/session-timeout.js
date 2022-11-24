/* eslint-disable @typescript-eslint/no-unused-vars */
/* Disabled lint rule as linter complained SessionTimeout was not used in this file */
function SessionTimeout(options) {
  var elements;
  var props;
  var state;

  var content = {
    gb: {
      title: 'You’re about to be signed out',
      message: 'For your security, we will sign you out in',
      button: 'Stay signed in',
      second: 'second',
      seconds: 'seconds',
      minute: 'minute',
      minutes: 'minutes',
    },
    cy: {
      title: 'Rydych ar fin cael eich allgofnodi',
      message: 'Er mwyn eich diogelwch, byddwn yn eich allgofnodi',
      button: 'Aros wedi mewngofnodi',
      second: 'eiliad',
      seconds: 'eiliadau',
      minute: 'munud',
      minutes: 'munudau',
    },
  };

  content.ni = content.gb;

  if (!options.timeoutUrl || !options.countdown || !options.language || !options.dialogDelay) {
    return console.warn('SessionTimeout not configured correctly');
  }

  if (options.dialogDelay > options.countdown) {
    return console.warn('SessionTimeout dialog appears at cannot be greater initial session exp time');
  }

  if (!(Object.keys(content).indexOf(options.language) > -1)) {
    return console.warn('SessionTimeout does not currently support language ' + options.language);
  }

  elements = {};
  state = {
    isActive: false,
  };

  props = {
    content: content[options.language],
    keepAliveUrl: options.keepAliveUrl ? options.keepAliveUrl : window.location.href,
    timeoutUrl: options.timeoutUrl,
    countdown: options.countdown,
    activateDialogAt: options.countdown - options.dialogDelay,
  };

  function startInterval() {
    setInterval(function () {
      props.countdown -= 1;

      if (props.countdown === 0) {
        state.isActive = false;
        reset();
        navigateTo(props.timeoutUrl);
      } else if (props.countdown === props.activateDialogAt) {
        state.isActive = true;
        redraw();
        elements.ariaLiveCountdown.innerHTML = props.content.message + ' ' + formatTime(props.countdown);
        render();
        disableScroll();
      } else if (props.countdown < props.activateDialogAt) {
        redraw();
      }
    }, 1000);
  }

  function buildUI() {
    var ariaLiveMessage;
    var countdownSpan;
    var defaultMessage;
    var dialog;
    var heading;
    var overlay;
    var staySignedInButton;

    function createElement(tag, attrs) {
      var e = document.createElement(tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (key) {
          e.setAttribute(key, attrs[key]);
        });
      }
      return e;
    }

    dialog = createElement('div', {
      role: 'dialog',
      class: 'timeout-dialog',
      tabindex: '-1',
      'aria-labelledby': 'dialog-heading dialog-warning',
    });

    ariaLiveMessage = createElement('p', {
      id: 'dialog-warning', 'aria-live': 'assertive', class: 'govuk-visually-hidden',
    });

    staySignedInButton = createElement('button', {
      id: 'dialog-button',
      class: 'govuk-button timeout-dialog-button',
    });

    heading = createElement('h1', { id: 'dialog-heading', class: 'govuk-heading-m' });
    defaultMessage = createElement('p', { class: 'govuk-body', 'aria-hidden': 'true' });
    countdownSpan = createElement('span', { id: 'dialog-span', class: 'govuk-!-font-weight-bold' });
    overlay = createElement('div', { class: 'overlay' });

    heading.innerHTML = props.content.title;
    defaultMessage.innerHTML = props.content.message + ' ';
    staySignedInButton.innerHTML = props.content.button;
    countdownSpan.innerHTML = formatTime(props.countdown);

    defaultMessage.appendChild(countdownSpan);
    dialog.appendChild(heading);
    dialog.appendChild(defaultMessage);
    dialog.appendChild(ariaLiveMessage);
    dialog.appendChild(staySignedInButton);

    elements.countDownSpan = countdownSpan;
    elements.dialog = dialog;
    elements.signOutButton = staySignedInButton;
    elements.ariaLiveCountdown = ariaLiveMessage;
    elements.overlay = overlay;
  }

  function registerEventHandlers() {
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('keydown', handleKeyDown, true);
    elements.signOutButton.addEventListener('click', handleClick);
  }

  function handleFocus(e) {
    if (state.isActive) {
      if (e.target !== elements.dialog && !elements.dialog.contains(e.target)) {
        e.stopPropagation();
        elements.dialog.focus();
      }
    }
  }

  function handleKeyDown(e) {
    if (state.isActive) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        navigateTo(props.keepAliveUrl);
      }
    }
  }

  function handleClick(e) {
    e.preventDefault();
    navigateTo(props.keepAliveUrl);
  }

  function disableScroll() {
    document.getElementsByTagName('html')[0].setAttribute('class', 'no-scroll');
    document.addEventListener('touchmove', disableTouchScroll, true);
  }

  function disableTouchScroll(e) {
    var touches = e.touches || e.changedTouches || [];

    if (touches.length === 1) {
      e.preventDefault();
    }
  }

  function formatTime(time) {
    var minuteCount;
    if (time < 60) {
      return time + ' ' + (time > 1 ? props.content.seconds : props.content.second) + '.';
    }

    minuteCount = Math.ceil(time / 60);
    return minuteCount + ' ' + (minuteCount > 1 ? props.content.minutes : props.content.minute) + '.';
  }

  function navigateTo(location) {
    window.location.href = location;
  }

  function render() {
    document.body.appendChild(elements.overlay);
    document.body.appendChild(elements.dialog);
    elements.dialog.focus();
  }

  function redraw() {
    elements.countDownSpan.innerHTML = formatTime(props.countdown);

    if (props.countdown <= 60 && (props.countdown % 20 === 0 || props.countdown === 10)) {
      elements.ariaLiveCountdown.innerHTML = props.content.message + ' ' + formatTime(props.countdown);
    }
  }

  function reset() {
    document.removeEventListener('focus', handleFocus, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('touchmove', disableScroll, true);
    elements.signOutButton.removeEventListener('click', handleClick);

    document.body.removeChild(elements.dialog);
    document.body.removeChild(elements.overlay);
    document.getElementsByTagName('html')[0].classList.remove('no-scroll');
  }

  buildUI();
  registerEventHandlers();
  startInterval();
}
