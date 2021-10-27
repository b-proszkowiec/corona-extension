const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const settings = Me.imports.lib.getSettings();

function init() {}

function buildPrefsWidget() {
  let widget = new CoronaPrefsWidget();
  widget.show_all();
  return widget;
}

const CoronaPrefsWidget = new GObject.Class({
  Name: "Corona.Prefs.Widget",
  GTypeName: "CoronaPrefsWidget",
  Extends: Gtk.ScrolledWindow,

  _init: function (params) {
    this.parent(params);

    let builder = new Gtk.Builder();
    builder.set_translation_domain("corona-extension");
    builder.add_from_file(Me.path + "/prefs.ui");
    this.updateInterval = builder.get_object("interval_spinbutton");
    this.updateInterval.set_value(settings.get_int("update-interval"));
    this.countryLabel = builder.get_object("country_combobox");
    this.countryLabel.set_active(settings.get_int("country-id"));

    let SignalHandler = {
      on_interval_value_changed(w) {
        const interval = w.get_value_as_int();
        settings.set_int("update-interval", interval);
      },

      on_country_changed(w) {
        const country = w.get_active_text();
        const country_id = w.get_active();
        settings.set_int("country-id", country_id);
        settings.set_string("country", country);
      }
    };

    builder.connect_signals_full((builder, object, signal, handler) => {
      object.connect(signal, SignalHandler[handler].bind(this));
    });

    this.add(builder.get_object("main_prefs"));
  },
});
