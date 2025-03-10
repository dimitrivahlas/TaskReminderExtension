const STORAGE_KEY = "tasks";
const NOTIFICATION_FREQUENCY_KEY = "notificationFrequency"; // in minutes
const DEFAULT_NOTIFICATION_FREQUENCY = 180; // default to 180 minutes

chrome.runtime.onInstalled.addListener(() => {
    console.log("Task Reminder Extension Installed");
    // Set default frequency if not set
    chrome.storage.local.get(NOTIFICATION_FREQUENCY_KEY, (data) => {
        if (!data[NOTIFICATION_FREQUENCY_KEY]) {
            chrome.storage.local.set({ [NOTIFICATION_FREQUENCY_KEY]: DEFAULT_NOTIFICATION_FREQUENCY }, () => {
                scheduleNotifications(DEFAULT_NOTIFICATION_FREQUENCY);
            });
        } else {
            scheduleNotifications(data[NOTIFICATION_FREQUENCY_KEY]);
        }
    });
});

// Schedule notifications based on provided frequency (in minutes)
function scheduleNotifications(frequencyInMinutes) {
    chrome.alarms.clear("taskReminder", () => {
        chrome.alarms.create("taskReminder", { periodInMinutes: 300});
        //chrome.alarms.create("taskReminder", { periodInMinutes: frequencyInMinutes });
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "taskReminder") {
        sendNotification();
    }
});

function sendNotification() {
    console.log("Sending notification triggered");
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const tasks = data[STORAGE_KEY] || {};
      const today = new Date().toISOString().split("T")[0];
      const todayTasks = tasks[today] || [];
      
      if (todayTasks.length > 0) {
        const items = todayTasks.map(task => ({
          title: task.completed ? '✅' : '❌',
          message: task.text
        }));
        
        chrome.notifications.create({
          type: "list",
          iconUrl: "icon.png",
          title: "Task Reminder",
          message: `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} today`,
          items: items
        }, (id) => {
          console.log("Notification created with id:", id);
        });
      } else {
        console.log("No tasks for today, no notification created.");
      }
    });
  }
  

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
        const tasks = data[STORAGE_KEY] || {};
        const today = new Date().toISOString().split("T")[0];
        
        if (request.action === "saveTask") {
            if (!tasks[today]) tasks[today] = [];
            tasks[today].push({ text: request.text, completed: false });
            chrome.storage.local.set({ [STORAGE_KEY]: tasks }, () => sendResponse({ success: true }));
        } else if (request.action === "toggleTask" && tasks[today] && tasks[today][request.index] !== undefined) {
            tasks[today][request.index].completed = !tasks[today][request.index].completed;
            chrome.storage.local.set({ [STORAGE_KEY]: tasks }, () => sendResponse({ success: true }));
        } else if (request.action === "updateFrequency") {
            // Update frequency and reschedule alarms
            const frequency = request.frequency;
            chrome.storage.local.set({ [NOTIFICATION_FREQUENCY_KEY]: frequency }, () => {
                scheduleNotifications(frequency);
                sendResponse({ success: true });
            });
        } else if (request.action === "triggerNotification") {
            sendNotification();
            sendResponse({ success: true });
        }
    });
    return true;
});
