const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

function init() {}

function buildPrefsWidget() {
  log("-> buildPrefsWidget");
  let widget = new MyPrefsWidget();
  widget.show_all();
  return widget;
}

const MyPrefsWidget = new GObject.Class({
  Name: "My.Prefs.Widget",
  GTypeName: "MyPrefsWidget",
  Extends: Gtk.ScrolledWindow,

  _init: function (params) {
    this.parent(params);

    let builder = new Gtk.Builder();
    builder.set_translation_domain("corona-extension");
    builder.add_from_file(Me.path + "/prefs.ui");

    let SignalHandler = {
      on_my_spinbutton_value_changed(w) {
        log(w.get_value_as_int());
      },

      on_my_switch_state_set(w) {
        log(w.get_active());
      },

      on_my_combobox_changed(w) {
        log(w.get_active());
      },
    };

    builder.connect_signals_full((builder, object, signal, handler) => {
      object.connect(signal, SignalHandler[handler].bind(this));
    });

    this.add(builder.get_object("main_prefs"));
  },
});
