# Socket.io Integration

This folder contains modular Socket.io setup for scalable real-time features.

- `index.js`: Initializes Socket.io server and registers event handlers.
- `handlers.js`: Contains event handlers for recipe comments, likes, and typing indicators.

## Usage

In your `server.js`:

```js
const setupSocket = require('./socket');
const server = app.listen(PORT, () => ...);
const io = setupSocket(server);
```

## Events
- `join-recipe`, `leave-recipe`: Manage recipe rooms
- `new-comment`: Broadcast new comments
- `like-recipe`: Broadcast likes
- `user-typing`: Typing indicator

// [commit] docs(socket): Add usage and event documentation for Socket.io integration
