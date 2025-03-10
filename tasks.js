const STORAGE_KEY = "tasks";

function loadTasks() {
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    const tasks = data[STORAGE_KEY] || {};
    const container = document.getElementById("tasksContainer");
    container.innerHTML = "";
    
    Object.keys(tasks).sort().forEach(date => {
      const dateGroup = document.createElement("div");
      dateGroup.className = "date-group";
      
      const header = document.createElement("h4");
      header.textContent = date;
      header.setAttribute("aria-label", "Toggle tasks for " + date);
      header.addEventListener("click", () => {
        const list = dateGroup.querySelector("ul");
        list.style.display = list.style.display === "none" ? "block" : "none";
      });
      dateGroup.appendChild(header);
      
      const ul = document.createElement("ul");
      tasks[date].forEach((task, index) => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => toggleTask(date, index));
        li.appendChild(checkbox);
        
        const label = document.createElement("label");
        label.textContent = task.text;
        li.appendChild(label);
        
        ul.appendChild(li);
      });
      dateGroup.appendChild(ul);
      container.appendChild(dateGroup);
    });
  });
}

function toggleTask(date, index) {
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    const tasks = data[STORAGE_KEY] || {};
    if (tasks[date] && tasks[date][index] !== undefined) {
      tasks[date][index].completed = !tasks[date][index].completed;
      chrome.storage.local.set({ [STORAGE_KEY]: tasks }, loadTasks);
    }
  });
}

document.addEventListener('DOMContentLoaded', loadTasks);
