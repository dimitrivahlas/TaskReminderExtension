const STORAGE_KEY = "tasks";

function showConfirmation(message) {
  const confirmationEl = document.getElementById("confirmation");
  confirmationEl.textContent = message;
  confirmationEl.style.display = "block";
  setTimeout(() => { confirmationEl.style.display = "none"; }, 2000);
}

function updateCurrentDate() {
  const today = new Date().toLocaleDateString();
  document.getElementById("currentDate").textContent = `Today: ${today}`;
}

document.getElementById('addTaskBtn').addEventListener('click', () => {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();
  if (taskText) {
    chrome.runtime.sendMessage({ action: "saveTask", text: taskText }, (response) => {
      if (response.success) {
        taskInput.value = "";
        showConfirmation("Task added!");
        loadTodayTasks();
      }
    });
  }
});

document.getElementById('viewTasksBtn').addEventListener('click', () => {
  window.open('tasks.html');
});

document.getElementById('triggerNotificationBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "triggerNotification" }, (response) => {
    if (response.success) {
      showConfirmation("Notification triggered!");
    }
  });
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  window.open('settings.html');
});

function loadTodayTasks() {
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    const tasks = data[STORAGE_KEY] || {};
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = tasks[today] || [];
    const todayTasksEl = document.getElementById("todayTasks");
    todayTasksEl.innerHTML = "";
    
    todayTasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = task.completed ? "completed" : "";
      
      // Create a checkbox for toggling task completion
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", `Mark ${task.text} as ${task.completed ? "incomplete" : "complete"}`);
      checkbox.addEventListener("change", () => {
        chrome.runtime.sendMessage({ action: "toggleTask", index: index }, (response) => {
          if (response.success) {
            loadTodayTasks();
          }
        });
      });
      li.appendChild(checkbox);
      
      // Label for task text
      const label = document.createElement("label");
      label.textContent = task.text;
      li.appendChild(label);
      
      todayTasksEl.appendChild(li);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCurrentDate();
  loadTodayTasks();
});
