const EventEmitter = {
    events: {},
    on(event, listener) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    },
    emit(event, payload) {
      if (this.events[event]) {
        this.events[event].forEach((listener) => listener(payload));
      }
    },
    off(event, listenerToRemove) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(
        (listener) => listener !== listenerToRemove
      );
    },
  };
  
  export default EventEmitter;
  