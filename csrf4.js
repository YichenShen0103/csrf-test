fetch(`api.php?action=confirm`, {
  method: "GET",
}).then((response) => {
  fetch(`api.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `id=1&action=delete`,
  });
});
