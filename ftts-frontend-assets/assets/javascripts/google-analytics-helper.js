function configureEnteredLocationEvent(formId, searchFieldId, noResultsError, organisation, journeyName) {
  var form = document.getElementById(formId);
  var submittedForm = false;

  function submitForm() {
    if (!submittedForm) {
      form.submit();
      submittedForm = true;
    }
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var enteredLocation = document.getElementById(searchFieldId).value;

    // fallback if gtag is taking too long or is not loaded, submit the form
    setTimeout(submitForm, 1000);

    gtag('event', 'enteredLocation', {
      'enteredLocation': enteredLocation ? enteredLocation.toLowerCase() : ' ',
      'noResultsError': noResultsError ? 'true' : 'false',
      'org': organisation,
      'journey': journeyName,
      'event_callback': function () {
        submitForm();
      }
    });
  });
}

function configureSelectTestCentreEvent(formId, organisation, journeyName) {
  var form = document.getElementById(formId);
  var buttons = document.getElementsByClassName('selectTestCentreButton');

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function(e) {
      e.preventDefault();

      if (e.target) {
        var testCentreId = e.target.value;
        var userClickedMap = e.target.classList.contains('map-select-centre');

        var testCentreNameElement = document.getElementById(`testCentreName${testCentreId}`);
        var testCentreDistanceElement = document.getElementById(`testCentreDistance${testCentreId}`);
        var testCentrePositionElement = document.getElementById(`testCentrePosition${testCentreId}`);

        var testCentreName = testCentreNameElement ? testCentreNameElement.value : '';
        var testCentreDistance = testCentreDistanceElement ? testCentreDistanceElement.value : '';
        var testCentrePosition = testCentrePositionElement ? testCentrePositionElement.value : '';

        // Buttons with test centre id is not retrieved via formData in js, so have to add a hidden input element
        var testCentreElement = document.createElement('input');
        testCentreElement.setAttribute('type', 'hidden');
        testCentreElement.setAttribute('name', 'testCentreId');
        testCentreElement.setAttribute('value', testCentreId);
        form.appendChild(testCentreElement);

        var submittedForm = false;
        function submitForm() {
          if (!submittedForm) {
            form.submit();
            submittedForm = true;
          }
        };

        // fallback if gtag is taking too long or is not loaded, submit the form
        setTimeout(submitForm, 1000);

        gtag('event', 'selectTestCentre', {
          'testCentreName': testCentreName,
          'distance': testCentreDistance,
          'positionInLine': userClickedMap ? '' : testCentrePosition,
          'org': organisation,
          'journey': journeyName,
          'event_callback': function () {
            submitForm();
          }
        });
      }
    })
  }
}

function configureEnterADateEvent(formId, organisation, journeyName ) {
  var dateForm = document.getElementById(formId);
  var submittedForm = false;

  function submitForm() {
    if (!submittedForm) {
      dateForm.submit();
      submittedForm = true;
    }
  };

  dateForm.addEventListener('submit', function(event) {
    event.preventDefault();

    var enteredDay = document.getElementById("day").value;
    var enteredMonth = document.getElementById("month").value;
    var enteredYear = document.getElementById("year").value;
    const isValidDate = !(isNaN(Date.parse(enteredYear +"-" + enteredMonth + "-" + enteredDay)));
    const TodayDate = new Date();
    const TomorrowDate = new Date();
    const sixMonthsPlus = new Date();
    TomorrowDate.setDate(TodayDate.getDate() + 1);
    sixMonthsPlus.setMonth(TodayDate.getMonth() + 6);

    try {
      gtag('event', 'enterADate', {
        'enteredDate': enteredDay + "-" + enteredMonth + "-" + enteredYear ,
        'isToday': isValidDate && TodayDate.getDate()==enteredDay && (TodayDate.getMonth() + 1)==enteredMonth && TodayDate.getFullYear()==enteredYear ,
        'isTomorrow':  isValidDate && TomorrowDate.getDate() == enteredDay && (TomorrowDate.getMonth() + 1)==enteredMonth && TomorrowDate.getFullYear()==enteredYear,
        'isInThePast': isValidDate && TodayDate.getTime() > Date.parse(enteredYear +"-" + enteredMonth + "-" + enteredDay),
        'is6MonthsPlus': isValidDate && sixMonthsPlus.getTime() < Date.parse(enteredYear +"-" + enteredMonth + "-" + enteredDay),
        'isValidDate': isValidDate,
        'organisation': organisation,
        'journey': journeyName,
        'event_callback': function() {
          submitForm();
        }
      });

      // fallback if gtag is taking too long or is not loaded, submit the form
      setTimeout(submitForm, 1000);
    } catch (error) {
      console.error(error);
      submitForm();
    }
  });
}
