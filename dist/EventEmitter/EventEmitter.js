class EventEmitter {
  constructor() {

  }
  on(eventName, callback) {
    const eventDescriptor = {
      eventName: eventName,
      callback: callback
    };
    this.__listenings.push(eventDescriptor);
    return eventDescriptor;
  }
  once(eventName, callback) {
    const eventDescriptor = {
      eventName: eventName,
      callback: callback
    };
    this.__listeningsOnce.push(eventDescriptor);
    return eventDescriptor;
  }
  emit(eventName, data) {
    for (let listener of this.__listenings) {
      if (listener.eventName === eventName) {
        listener.callback(data);
      }
    }

    for (var i = 0; i < this.__listeningsOnce.length; i++) {
      let listener = this.__listeningsOnce[i];

      if (listener && listener.eventName === eventName) {
        listener.callback(data);
        delete this.__listeningsOnce[i];
      }
    }
  }
}
EventEmitter.prototype.__listenings = [];
EventEmitter.prototype.__listeningsOnce = [];

export default EventEmitter;
