const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;

const COUNTRY = "Poland";
const command = "curl https://corona-stats.online/" + COUNTRY;
const SKULL = "\u2620";
const REFRESH_PERIOD = 60 * 60;
const NOT_APPLICABLE = "n/a";

let panelButton, panelButtonText, timeout;

const data = function (countryHttmlData) {
  const regex = `${COUNTRY}.*║`;
  const countryRow = countryHttmlData
    .match(regex)
    .toString()
    .replaceAll(/║|,|\s/gi, "");
  const countryDataArray = String(countryRow).split(/\│/);

  const country = removeColorFormatting(countryDataArray[0]);
  let totalCases = removeColorFormatting(countryDataArray[1]);
  let newCases = removeColorFormatting(countryDataArray[2]);
  if (newCases == "") newCases = NOT_APPLICABLE;
  let totalDeaths = removeColorFormatting(countryDataArray[3]);
  let newDeaths = removeColorFormatting(countryDataArray[4]);
  if (newDeaths == "") newDeaths = NOT_APPLICABLE;
  let recovered = removeColorFormatting(countryDataArray[5]);
  let active = removeColorFormatting(countryDataArray[6]);
  let critical = removeColorFormatting(countryDataArray[7]);
  let casesPerMilion = removeColorFormatting(countryDataArray[8]);

  let textToShow = `${newCases}  ${SKULL} ${removeNotNumber(newDeaths)}`;
  panelButtonText.set_text(textToShow);
};

const removeColorFormatting = (text) => text.replace(/\u001b\[.*?m/g, "");

const removeNotNumber = (text) => text.replace(/[^0-9]+/g, "");

function getCoronaInfo() {
  const [ok, out, err, exit] = GLib.spawn_command_line_sync(command);
  data(out.toString());
}

function setButtonText() {
  return true;
}

function init() {
  panelButton = new St.Bin({
    style_class: "panel-button",
  });
  panelButtonText = new St.Label({
    style_class: "examplePanelText",
    text: "Starting...",
  });
  panelButton.set_child(panelButtonText);
}

function enable() {
  Main.panel._rightBox.insert_child_at_index(panelButton, 1);
  timeout = Mainloop.timeout_add_seconds(REFRESH_PERIOD, getCoronaInfo);
  getCoronaInfo();
}

function disable() {
  Mainloop.source_remove(timeout);
  Main.panel._rightBox.remove_child(panelButton);
}
