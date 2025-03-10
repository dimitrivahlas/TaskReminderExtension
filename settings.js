document.getElementById('saveFrequencyBtn').addEventListener('click', () => {
    const frequency = parseInt(document.getElementById('frequencyInput').value, 10);
    if (frequency && frequency > 0) {
      chrome.runtime.sendMessage({ action: "updateFrequency", frequency: frequency }, (response) => {
        if (response.success) {
          const confirmationEl = document.getElementById("settingsConfirmation");
          confirmationEl.style.display = "block";
          setTimeout(() => { confirmationEl.style.display = "none"; }, 2000);
        }
      });
    }
  });
  