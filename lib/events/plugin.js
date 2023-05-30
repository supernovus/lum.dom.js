const core = require('@lumjs/core');
const {S,def} = core.types;

/**
 * A simple base class for event handler plugins.
 * 
 * Supported properties/methods:
 * 
 * @prop {Array} knownEvents - A flat list of event names this plugin handles.
 * @prop {function} on - A method to handle `on()` calls.
 * @prop {function} off - A method to handle `off()` calls.
 * @prop {function} eventClass - The constructor for an `Event` sub-class.
 * 
 */
class EventsPlugin
{
  constructor(handler)
  {
    this.handler = handler;
  }

  static register()
  {
    this.registerPlugin();
    this.registerEvents(this.knownEvents, false);
    return this;
  }

  static registerPlugin()
  {
    Events.PLUGINS[this.name] = this;
  }

  static registerEvents(events, fatal=true)
  {
    if (typeof events === S)
    {
      events = events.trim().split(/\s+/);
    }

    if (Array.isArray(events))
    {
      Events.CLASSES.$add(this.name, ...events);
    }
    else if (fatal)
    {
      throw new TypeError("events was not a string or an array");
    }
  }
}

module.exports = EventsPlugin;

const Events = require('./index');
def(EventsPlugin, 'Events', Events);
