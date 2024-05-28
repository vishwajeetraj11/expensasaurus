self.addEventListener("push", (event) => {
  const options = {
    body: event.data.text(),
    // icon: "/path/to/your/icon.png",
  };
  event.waitUntil(self.registration.showNotification("Your App Name", options));
});
