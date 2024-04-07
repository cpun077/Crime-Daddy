import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
  cluster: process.env.REACT_APP_PUSHER_CLUSTER,
  encrypted: true, // Use HTTPS
});

export default pusher;
