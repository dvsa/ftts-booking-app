function LoadingSpinner(options) {
  window.onpageshow = function (event) {
    if (event.persisted) {
      hideLoading(event);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableLoadingTrigger);
  } else {
    enableLoadingTrigger();
  }

  function enableLoadingTrigger() {
    const triggerElements = options.triggerElements;

    if (triggerElements) {
      for (let i = 0; i < triggerElements.length; i++){
        const triggerElement = document.getElementById(triggerElements[i]);
        if (triggerElement) {
          triggerElement.addEventListener(options.triggerEvent, function (e) {
            const href = options.triggerEvent === 'click' ? triggerElement.href : undefined;
            showLoading(e, href);
          });
        }
      }
    }
  }

  function showLoading(e, href) {
    // Skip the loading screen
    let loadingScreen = document.getElementById('loadingScreen');
    if (options.skipIfChecked) {
      for (let i = 0; i < options.skipIfChecked.length; i++) {
        const radioButton = document.getElementById(options.skipIfChecked[i]);
        const needToSkipLoading = radioButton.checked;
        if (needToSkipLoading) {
          loadingScreen = null;
          break;
        }
      }
    }

    if (loadingScreen === null) {
      return;
    }
    
    e.preventDefault();

    // Hide page content
    if (options.elementsToHide) {
      for (let i = 0; i < options.elementsToHide.length; i++) {
        const elementToHide = document.getElementById(options.elementsToHide[i]);
        if (elementToHide) {
          elementToHide.classList.add('hidden')
        }
      }
    }

    // Disable buttons
    if (options.elementsToDisable) {
      for (let i = 0; i < options.elementsToDisable.length; i++) {
        const elementToDisable = document.getElementById(options.elementsToDisable[i]);
        if (elementToDisable) {
          elementToDisable.disabled = true;
        }
      }
    }
    
    loadingScreen.classList.remove('hidden');
    loadingScreen.focus();
    loadingScreen.scrollIntoView();

    // Submit form if provided
    if (options.formId) {
      const form = document.getElementById(options.formId);
      if (form) {
        form.submit();
      }
    }

    // Redirect to location if provided
    if (href) {
      window.location.href = href;
    }
  }

  function hideLoading(e) {
    e.preventDefault();

    // Show page content
    if (options.elementsToHide) {
      for (let i = 0; i < options.elementsToHide.length; i++) {
        const elementToHide = document.getElementById(options.elementsToHide[i]);
        if (elementToHide) {
          elementToHide.classList.remove('hidden')
        }
      }
    }

    // Enable buttons
    if (options.elementsToDisable) {
      for (let i = 0; i < options.elementsToDisable.length; i++) {
        const elementToDisable = document.getElementById(options.elementsToDisable[i]);
        if (elementToDisable) {
          elementToDisable.disabled = false;
        }
      }
    }

    // Hide Loading Screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }
}
