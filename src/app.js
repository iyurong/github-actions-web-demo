const counterElement = document.querySelector("#counter");
const button = document.querySelector("#counter-button");
let counter = 0;

button.addEventListener("click", () => {
  counter += 1;
  counterElement.textContent = String(counter);
});

async function loadBuildInfo() {
  try {
    const response = await fetch("./build-info.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const info = await response.json();

    document.querySelector("#commit").textContent =
      info.commit === "local" ? "本地构建" : info.commit.slice(0, 7);
    document.querySelector("#built-at").textContent =
      new Date(info.builtAt).toLocaleString("zh-CN", { hour12: false });
    document.querySelector("#run-id").textContent = info.runId;
  } catch (error) {
    document.querySelector("#commit").textContent = "未读取到构建信息";
    document.querySelector("#built-at").textContent = "-";
    document.querySelector("#run-id").textContent = "-";
    console.error(error);
  }
}

loadBuildInfo();