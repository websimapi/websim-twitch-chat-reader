// Configuration settings for the Twitch Chat Reader

export const defaultChannel = 'twitchdev'; // Change this to your desired default channel
`````` index.html
<!DOCTYPE html>
<html>
<head>
  <title>Twitch Chat Reader</title>
  <link rel="stylesheet" href="style.css">
  <script type="importmap">
    {
      "imports": {
        "tmi.js": "/tmi.js"
      }
    }
  </script>
</head>
<body>
  <div id="controls">
    <label for="channel">Twitch Channel:</label>
    <input type="text" id="channel" placeholder="Enter channel name">
    <button id="connect-btn">Connect</button>
    <button id="disconnect-btn" disabled>Disconnect</button>
  </div>
  <div id="chat-container">
    <ul id="chat-messages"></ul>
  </div>
  <script type="module" src="main.js"></script>
</body>
</html>

// Configuration settings for the Twitch Chat Reader

// You can change this to your favorite Twitch channel
// or leave it empty if you prefer to always type it in.
export const defaultChannel = 'twitchdev';

