const form = document.querySelector("#studyForm");
const subject = document.querySelector("#subject");
const topic = document.querySelector("#topic");
const studentAnswer = document.querySelector("#studentAnswer");
const result = document.querySelector("#result");
const statusBadge = document.querySelector("#statusBadge");
const submitButton = document.querySelector("#submitButton");
const copyButton = document.querySelector("#copyButton");
const clearHistory = document.querySelector("#clearHistory");
const historyList = document.querySelector("#historyList");

const historyKey = "ai-study-assistant-history";

function getMode() {
  return document.querySelector("input[name='mode']:checked").value;
}

function setStatus(text) {
  statusBadge.textContent = text;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(historyKey)) || [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(historyKey, JSON.stringify(items.slice(0, 8)));
  renderHistory();
}

function renderHistory() {
  const items = loadHistory();
  historyList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.textContent = "No recent topics yet.";
    historyList.append(empty);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    const main = document.createElement("strong");
    const meta = document.createElement("span");
    main.textContent = item.topic;
    meta.textContent = item.mode;
    li.append(main, meta);
    historyList.append(li);
  }
}

async function requestStudyHelp(payload) {
  const response = await fetch("/api/study", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const lines = [
      data.error || "Something went wrong.",
      data.details ? `Details: ${data.details}` : "",
      data.hint ? `Hint: ${data.hint}` : "",
      data.status ? `Status: ${data.status}` : "",
      data.code ? `Code: ${data.code}` : "",
      data.model ? `Model: ${data.model}` : ""
    ].filter(Boolean);

    throw new Error(lines.join("\n"));
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    subject: subject.value,
    topic: topic.value.trim(),
    mode: getMode(),
    studentAnswer: studentAnswer.value.trim()
  };

  submitButton.disabled = true;
  submitButton.textContent = "Generating...";
  setStatus("Thinking");
  result.textContent = "Working on your study help...";

  try {
    const data = await requestStudyHelp(payload);
    result.textContent = data.content;
    setStatus(data.mode === "live" ? "Live AI" : "Demo mode");
    saveHistory([{ topic: payload.topic, mode: payload.mode }, ...loadHistory()]);
  } catch (error) {
    result.textContent = error.message;
    setStatus("Error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Generate study help";
  }
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(result.textContent);
  copyButton.textContent = "Copied";
  setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1200);
});

clearHistory.addEventListener("click", () => {
  saveHistory([]);
});

renderHistory();
