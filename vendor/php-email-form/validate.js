/**
* PHP Email Form Validation - v3.9 (with added comments)
* Handles asynchronous submission for forms with class '.php-email-form'
* Expects the server endpoint (action URL) to return plain text "OK" on success.
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  // Select all forms with the 'php-email-form' class
  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      // Prevent the default browser submission (page reload)
      event.preventDefault();

      let thisForm = this; // Reference to the form element that was submitted

      let action = thisForm.getAttribute('action'); // Get the URL to send data to
      let recaptchaSiteKey = thisForm.getAttribute('data-recaptcha-site-key'); // Check for reCAPTCHA integration

      // Basic validation: Ensure the action URL is set
      if (!action) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }

      // Get references to the feedback elements within the form
      let loading = thisForm.querySelector('.loading');
      let errorMessage = thisForm.querySelector('.error-message');
      let sentMessage = thisForm.querySelector('.sent-message');

      // Show loading indicator, hide previous messages
      if (loading) loading.classList.add('d-block');
      if (errorMessage) errorMessage.classList.remove('d-block');
      if (sentMessage) sentMessage.classList.remove('d-block');

      // Create a FormData object to gather form data
      let formData = new FormData(thisForm);

      // Handle reCAPTCHA v3 if configured
      if (recaptchaSiteKey) {
        // Check if the reCAPTCHA script is loaded
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              // Execute reCAPTCHA verification
              grecaptcha.execute(recaptchaSiteKey, { action: 'php_email_form_submit' })
                .then(token => {
                  // Add the reCAPTCHA token to the form data
                  formData.set('recaptcha-response', token);
                  // Proceed with form submission
                  php_email_form_submit(thisForm, action, formData);
                })
                .catch(error => {
                   // Handle errors during reCAPTCHA execution
                  displayError(thisForm, 'reCAPTCHA error: ' + error);
                });
            } catch (error) {
              displayError(thisForm, 'reCAPTCHA execute error: ' + error);
            }
          });
        } else {
          // reCAPTCHA script wasn't loaded
          displayError(thisForm, 'Error: The reCAPTCHA javascript API url is not loaded!');
        }
      } else {
        // No reCAPTCHA, submit directly
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  /**
   * Submits the form data asynchronously using fetch.
   * @param {HTMLFormElement} thisForm - The form element being submitted.
   * @param {string} action - The URL to submit the form data to.
   * @param {FormData} formData - The data gathered from the form.
   */
  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      // 'X-Requested-With' header identifies this as an AJAX request (optional for simple PHP)
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => {
      // Check if the HTTP status code indicates success (200-299)
      if (response.ok) {
        // Read the response body as text
        return response.text();
      } else {
        // If response status is an error (e.g., 404, 500), throw an error to be caught later
        // Include status, status text, and URL for better debugging
        throw new Error(`${response.status} ${response.statusText} - ${response.url}`);
      }
    })
    .then(data => {
      // Hide the loading indicator
      let loading = thisForm.querySelector('.loading');
      if (loading) loading.classList.remove('d-block');

      // Check if the server response is exactly "OK" (case-sensitive, trimmed)
      if (data.trim() === 'OK') {
        // Show the success message
        let sentMessage = thisForm.querySelector('.sent-message');
        if (sentMessage) sentMessage.classList.add('d-block');
        // Clear the form fields
        thisForm.reset();
      } else {
        // If the response was successful (status 200) but the text is not "OK",
        // treat the response text as an error message from the PHP script.
        throw new Error(data ? data.trim() : 'Form submission failed: Server returned a success status but no error message.');
      }
    })
    .catch((error) => {
      // Catch any errors from the fetch operation or thrown in the .then blocks
      displayError(thisForm, error.message || 'An unknown error occurred.'); // Display the error message
    });
  }

  /**
   * Displays an error message in the form's designated error area.
   * @param {HTMLFormElement} thisForm - The form element where the error occurred.
   * @param {string} error - The error message string to display.
   */
  function displayError(thisForm, error) {
    let loading = thisForm.querySelector('.loading');
    let errorMessage = thisForm.querySelector('.error-message');

    // Hide loading indicator
    if (loading) loading.classList.remove('d-block');

    // Display the error message
    if (errorMessage) {
      errorMessage.innerHTML = error; // Use innerHTML as error might contain basic formatting or be an Error object's message string
      errorMessage.classList.add('d-block');
    } else {
        // Fallback if the error message div doesn't exist
        console.error("Form Error Element not found in form:", thisForm);
        alert("An error occurred: " + error); // Alert as a last resort
    }
  }

})();