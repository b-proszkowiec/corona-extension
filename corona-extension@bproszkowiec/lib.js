const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();

var NOT_APPLICABLE = "n/a";
var SKULL = "\u2620";

class CoronaInfo {
  constructor() {
    "use strict";
    CoronaInfo.settings = getSettings();
    CoronaInfo._instance = this;
  }

  static getInstance() {
    return CoronaInfo._instance || new CoronaInfo();
  }

  formatResponse(body) {
    var country = CoronaInfo.settings.get_string("country");
    var data = collectData(body, country, this.getCountryCode(country));
    return data;
  }

  getCountryCode(country) {
    var countryCode;
    switch (country) {
      case "Czechia":
        countryCode = "CZ";
        break;
      case "South Korea":
        countryCode = "KR";
        break;
      case "Saudi Arabia":
        countryCode = "SA";
        break;
      case "South Africa":
        countryCode = "ZA";
        break;
      case "United Arab Emirates":
        countryCode = "AE";
        break;
      case "United Kingdom":
        countryCode = "UK";
        break;
      case "United States":
        countryCode = "US";
        break;
      default:
        countryCode = country;
        break;
    }
    return countryCode;
  }
}

removeColorFormatting = (text) => text.replace(/\u001b\[.*?m/g, "");

removeNotNumber = (text) => text.replace(/[^0-9]+/g, "");

function collectData(httmlData, selectedCountry, selectedCountryCode) {
  if (httmlData == null) return null;
  var countryRow = httmlData.match(`│.*${selectedCountryCode}.*║`);
  if (countryRow == null) return null;

  countryRow = countryRow.toString().replace(/║|,|\s/gi, "");
  var countryDataArray = String(countryRow).split(/\│/);
  countryDataArray.shift();
  var data = {
    country: selectedCountry,
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
