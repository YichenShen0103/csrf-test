const firstScript = document.querySelector("body script");
const scriptContent = firstScript.innerHTML;
const match = scriptContent.match(/csrf_token=([a-zA-Z0-9]+)/);
const csrfToken = match[1];
alert(csrfToken);
