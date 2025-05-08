// const firstScript = document.querySelector("body script");
// const scriptContent = firstScript.innerHTML;
// const match = scriptContent.match(/csrf_token=([a-zA-Z0-9]+)/);
// const csrfToken = match[1];
let token = document.querySelector('input[name="csrf_token"]').value;
alert(token);
