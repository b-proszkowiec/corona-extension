const ByteArray = imports.byteArray;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const URL = "curl https://corona-stats.online/";
const NOT_APPLICABLE = "n/a";

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
    let data = collectData(ByteArray.toString(out), country);
    return data;
  }
}

removeColorFormatting = (text) => text.replace(/\u001b\[.*?m/g, "");

removeNotNumber = (text) => text.replace(/[^0-9]+/g, "");

function collectData(httmlData, selectedCountry) {
  var regex = `${selectedCountry}.*║`;
  var countryRow = httmlData
    .match(regex)
    .toString()
    .replace(/║|,|\s/gi, "");
  var countryDataArray = String(countryRow).split(/\│/);

  var data = {
    country: removeColorFormatting(countryDataArray[0].replace(/\(.*\)/gi, "")),
    totalCases: removeColorFormatting(countryDataArray[1]),
    newCases: removeColorFormatting(countryDataArray[2]),
    totalDeaths: removeColorFormatting(countryDataArray[3]),
    newDeaths: removeColorFormatting(countryDataArray[4]),
    recovered: removeColorFormatting(countryDataArray[5]),
    active: removeColorFormatting(countryDataArray[6]),
    critical: removeColorFormatting(countryDataArray[7]),
    casesPerMilion: removeColorFormatting(countryDataArray[8]),
  };

  data.newCases =
    data.newCases == "" ? NOT_APPLICABLE : removeNotNumber(data.newCases);
  data.newDeaths =
    data.newDeaths == "" ? NOT_APPLICABLE : removeNotNumber(data.newDeaths);

  return data;
}

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
