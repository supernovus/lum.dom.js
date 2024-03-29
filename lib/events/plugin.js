const core = require('@lumjs/core');
const {S,def} = core.types;

/**
 * A simple abstract base class for event handler plugins.
 * 
 * Supported *static* properties in classes extending this:
 * 
 * @prop {Array} knownEvents - A flat list of event types this plugin handles.
 * 
 * This is recommended for a plugin to be useful. Without it, you'd have to
 * manually call `MyPluginClass.registerEvents(listOfEvents);` to register
 * the event types handled by this plugin.
 * 
 * @prop {function} eventClass - The constructor for an `Event` sub-class.
 * 
 * The sub-class specified here will be used by `events#build()` to create
 * the `Event` instance (usually to dispatch via `events#trigger()`) for the
 * specified event type.
 * 
 * This is an only needed if you have a custom event class, or want to force
 * the use of a certain event class. In most cases you won't need this.
 * 
 * @alias module:@lumjs/dom/events.Plugin
 */
class EventsPlugin
{
  /**
   * Create an event plugin instance.
   * 
   * This is generally not called by outside code.
   * It will be called when an event handler instance is created if the
   * specified event type has a plugin class associated with it.
   * 
   * @param {module:@lumjs/dom/events.Handler} handler
   */
  constructor(handler)
  {
    /**
     * The handler instance using this plugin.
     * @type {module:@lumjs/dom/events.Handler}
     */
    this.handler = handler;
  }

  /**
   * Register the plugin and all its known events at once.
   *
   * This is a shortcut for:
   * 
   * ```js
   * MyPluginClass.register();
   * MyPluginClass.registerEvents(MyPluginClass.knownEvents, false);
   * ```
   * 
   * So it's generally *most useful* if your class has a
   * `knownEvents` static property/getter defined.
   * 
   */
  static register()
  {
    this.registerPlugin();
    this.registerEvents(this.knownEvents, false);
    return this;
  }

  /**
   * Register the plugin in the global plugins registry.
   * 
   * This adds the plugin to `Events.PLUGINS` so that events
   * can be associated with the plugin rather than an Event sub-class.
   * 
   * The name of the plugin sub-class when it was created is used,
   * so you should always define your sub-classes with a proper name:
   * 
   * ```js
   * // This is the proper way to define a plugin class.
   * // This plugin will be registered as 'MyPluginClass'.
   * class MyPluginClass extends Plugin {}
   * module.exports = MyPluginClass;
   * 
   * // This is a broken bad way... DO NOT DO THIS!
   * // The module will be registered as '', which is obviously
   * // not a valid plugin name and will explode.
   * module.exports = class extends Plugin {}
   * ```
   * 
   */
  static registerPlugin()
  {
    Events.PLUGINS[this.name] = this;
    return this;
  }

  /**
   * Register event types to use this plugin.
   * 
   * This adds the specified event types to the global `Events.CLASSES`
   * registry object with this plugin's name as its associated class.
   * 
   * @param {(Array|string)} events - Events to register to this class.
   * 
   * If this is an `Array`, every item **MUST** be a `string` representing an
   * event type name.
   * 
   * If this is a `string` it will be converted into an `Array` by splitting
   * the string on any whitespace.
   * 
   * @param {bool} [fatal=true] Is the absense of events an error?
   * 
   * The default value of `true` is most useful if you are calling this
   * method manually, as in that case you're specifying the `events` value
   * and probably don't want it to be missing or invalid.
   * 
   * @throws {TypeError} If `fatal` is `true` and no valid events specified.
   */
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

    return this;
  }

  /**
   * A custom handler for `event.on()` calls for events using this plugin.
   * @function module:@lumjs/dom/events.Plugin#on
   * 
   * This is an optional instance method that can be implemented
   * in an event plugin class to handle `events~EventHandler.on()`,
   * which is called whenever `events.on()` is used to assign events.
   * 
   * If not defined, the default `addEventListener(...)` will be used.
   */

  /**
   * A custom handler for `event.off()` calls for events using this plugin.
   * @function module:@lumjs/dom/events.Plugin#off
   * 
   * This is an optional instance method that can be implemented
   * in an event plugin class to handle `events~EventHandler.off()`,
   * which is called whenever `events.off()` is used to assign events.
   * 
   * If not defined, the default `removeEventListener(...)` will be used.
   */
}

module.exports = EventsPlugin;

const Events = require('./index');
def(EventsPlugin, 'Events', Events);
