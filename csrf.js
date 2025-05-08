// const firstScript = document.querySelector("body script");
// const scriptContent = firstScript.innerHTML;
// const match = scriptContent.match(/csrf_token=([a-zA-Z0-9]+)/);
// const csrfToken = match[1];
const input = document.getElementById("csrf_token");
alert(input.value);
fetch(`api.php`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: `id=1&action=delete&csrf_token=${input.value}`,
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("删除失败");
    }
    return response.json();
  })
  .then((data) => {
    alert("删除成功");
    location.reload(); // 刷新页面
  })
  .catch((error) => {
    console.error("删除出错:", error);
    alert("删除失败: " + error.message);
  });
