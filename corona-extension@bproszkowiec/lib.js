var Gio = imports.gi.Gio;
var GLib = imports.gi.GLib;
var Me = imports.misc.extensionUtils.getCurrentExtension();

var URL = "curl https://corona-stats.online/";
var SKULL = "\u2620";
var NOT_APPLICABLE = "n/a";

class CoronaInfo {
  constructor() {
    "use strict";
    CoronaInfo.settings = getSettings();
    CoronaInfo._instance = this;
  }

  static getInstance() {
    return CoronaInfo._instance || new CoronaInfo();
  }

  updateCoronaInfo() {
    let country = CoronaInfo.settings.get_string("country");
    let [ok, out, err, exit] = GLib.spawn_command_line_sync(URL + country);
    var data = collectData(String(out), country);
    return data;
  };
}

removeColorFormatting = (text) => text.replace(/\u001b\[.*?m/g, "");
  
removeNotNumber =  (text) => text.replace(/[^0-9]+/g, "");

function collectData (httmlData, selectedCountry) {
  var regex = `${selectedCountry}.*║`;
  var countryRow = httmlData
    .match(regex)
    .toString()
    .replace(/║|,|\s/gi, "");
    var countryDataArray = String(countryRow).split(/\│/);

  var country = removeColorFormatting(countryDataArray[0]);
  var totalCases = removeColorFormatting(countryDataArray[1]);
  var newCases = removeColorFormatting(countryDataArray[2]);
  if (newCases == "") newCases = NOT_APPLICABLE;
  var totalDeaths = removeColorFormatting(countryDataArray[3]);
  var newDeaths = removeColorFormatting(countryDataArray[4]);
  if (newDeaths == "") newDeaths = NOT_APPLICABLE;
  var recovered = removeColorFormatting(countryDataArray[5]);
  var active = removeColorFormatting(countryDataArray[6]);
  var critical = removeColorFormatting(countryDataArray[7]);
  var casesPerMilion = removeColorFormatting(countryDataArray[8]);

  var textToShow = `${newCases}  ${SKULL} ${
    newDeaths == NOT_APPLICABLE ? newDeaths : removeNotNumber(newDeaths)
  }`;
  return textToShow;
};

function getSettings() {
  var GioSSS = Gio.SettingsSchemaSource;
  var schemaSource = GioSSS.new_from_directory(
    Me.dir.get_child("schemas").get_path(),
    GioSSS.get_default(),
    false
  );
  var schemaObj = schemaSource.lookup(
    "org.gnome.shell.extensions.corona",
    true
  );
  if (!schemaObj) {
    throw new Error("Cannot find schemas");
  }
  return new Gio.Settings({ settings_schema: schemaObj });
}
