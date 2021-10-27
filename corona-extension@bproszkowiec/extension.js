const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const settings = Me.imports.lib.getSettings();
let updateInfo = Me.imports.lib.CoronaInfo.getInstance();

let panelButton, panelButtonText, timeout, refreshPeriod = 60.0;

function timerHandler() {
  updateButtonText();
  timeout = Mainloop.timeout_add_seconds(refreshPeriod, timerHandler);
  return false;
}

function countryChangedHandler() {
  updateButtonText();
}

function updateIntervalChangedHandler() {
  refreshPeriod = settings.get_int("update-interval") * 60;
  timeout = Mainloop.timeout_add_seconds(refreshPeriod, timerHandler);
}

function init() {
  panelButton = new St.Bin({
    style_class: "panel-button",
  });
  panelButtonText = new St.Label({
    style_class: "coronaInfoPanelText",
    text: "Starting...",
  });
  panelButton.set_child(panelButtonText);
  refreshPeriod = settings.get_int("update-interval") * 60;

  settings.connect('changed::' + "country", countryChangedHandler);
  settings.connect('changed::' + "update-interval", updateIntervalChangedHandler);
}

function updateButtonText() {
  let data = updateInfo.updateCoronaInfo();
  panelButtonText.set_text(data);
}

function enable() {
  Main.panel._rightBox.insert_child_at_index(panelButton, 1);
  timeout = Mainloop.timeout_add_seconds(refreshPeriod, timerHandler);
  updateButtonText();
}

function disable() {
  Mainloop.source_remove(timeout);
  Main.panel._rightBox.remove_child(panelButton);
}
