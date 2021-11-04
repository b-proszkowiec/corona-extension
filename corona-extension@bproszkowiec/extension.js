const { Clutter, Gio, St, GObject } = imports.gi;
const Lang = imports.lang;
const Soup = imports.gi.Soup;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.lib.getSettings();
const NOT_APPLICABLE = Me.imports.lib.NOT_APPLICABLE;
const SKULL = Me.imports.lib.SKULL;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let updateInfo = Me.imports.lib.CoronaInfo.getInstance();
let refreshPeriod = 60.0;
let coronaMenu;
let timeout;

const URL = "https://corona-stats.online/";

let CoronaMenuButton = GObject.registerClass(
  class CoronaMenuButton extends PanelMenu.Button {
    _init() {
      super._init(0);

      this.panelButton = new St.Bin({
        style_class: "corona-panel-action",
      });
      this.panelButtonText = new St.Label({
        style_class: "corona-panel-text",
        text: "Starting...",
      });
      this.panelButton.set_child(this.panelButtonText);
      this.add_child(this.panelButton);

      this._currentCountryInfo = new St.Bin({});
      let _itemCurrent = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
      });
      _itemCurrent.actor.add_actor(this._currentCountryInfo);
      this.menu.addMenuItem(_itemCurrent);

      //* create settings box *//

      let item = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        style_class: "corona-menu-button-container",
      });

      let customButtonBox = new St.BoxLayout({
        style_class: "corona-button-box",
        vertical: false,
        clip_to_allocation: true,
        x_align: Clutter.ActorAlign.START,
        y_align: Clutter.ActorAlign.CENTER,
        reactive: true,
        x_expand: true,
        pack_start: false,
      });

      // custom round preferences button
      let prefsButton = this._createRoundButton(
        "preferences-system-symbolic",
        _("Preferences")
      );

      prefsButton.connect("clicked", (self) => {
        this.menu._getTopMenu().close();

        if (typeof ExtensionUtils.openPrefs === "function") {
          ExtensionUtils.openPrefs();
        } else {
          Util.spawn(["gnome-shell-extension-prefs", Me.metadata.uuid]);
        }
      });
      customButtonBox.add_actor(prefsButton);

      // add the buttons to the top bar
      item.actor.add_actor(customButtonBox);

      // add buttons
      this.menu.addMenuItem(item);

      this.buildCurrentCountryData(null);
    }

    destroy() {
      this.destroyCurrentCountryData();
      super.destroy();
    }

    createButton(iconName, accessibleName) {
      let button = new St.Button({
        reactive: true,
        can_focus: true,
        track_hover: true,
        accessible_name: accessibleName,
        style_class: "message-list-clear-button button corona-button-action",
      });

      button.child = new St.Icon({
        icon_name: iconName,
      });
      return button;
    }

    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    update(coronaData) {
      this.rebuildCurrentCountryData(coronaData);
    }

    destroyCurrentCountryData() {
      if (this._currentCountryInfo.get_child() !== null)
        this._currentCountryInfo.get_child().destroy();
    }

    rebuildCurrentCountryData(coronaData) {
      this.destroyCurrentCountryData();
      this.buildCurrentCountryData(coronaData);
    }

    _createRoundButton(iconName) {
      let button = new St.Button({
        style_class: "message-list-clear-button button vitals-button-action",
      });

      button.child = new St.Icon({
        icon_name: iconName,
      });
      return button;
    }

    buildCurrentCountryData(coronaData) {
      this._newCasesIcon = new St.Icon({
        icon_size: 18,
        gicon: Gio.icon_new_for_string(
          Me.dir.get_path() + "/icons/man-shape.svg"
        ),
        style_class: "new-cases-icon-style",
      });

      this._newDeathsIcon = new St.Icon({
        icon_size: 18,
        gicon: Gio.icon_new_for_string(
          Me.dir.get_path() + "/icons/sick-face.svg"
        ),
        style_class: "new-deaths-icon-style",
      });

      this._currentCountrySummary = new St.Label({
        text:
          coronaData == null
            ? "No data"
            : this.numberWithCommas(coronaData.country),
        style_class: "current-country-summary",
      });
      this._countryLabel = new St.Label({
        text: _("Country:"),
      });

      let bb = new St.BoxLayout({
        vertical: true,
        style_class: "system-menu-action corona-current-summarybox",
      });
      bb.add_actor(this._countryLabel);
      bb.add_actor(this._currentCountrySummary);

      this._newCases = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.newCases),
        style_class: "today-data-info",
      });
      this._newDeaths = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.newDeaths),
        style_class: "today-data-info",
      });

      let ab = new St.BoxLayout({
        style_class: "corona-current-infobox",
      });

      ab.add_actor(this._newCasesIcon);
      ab.add_actor(this._newCases);
      ab.add_actor(this._newDeathsIcon);
      ab.add_actor(this._newDeaths);
      bb.add_actor(ab);

      // Other labels
      this._totalCases = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.totalCases),
        style_class: "statistic-data-info-value",
      });
      this._totalDeaths = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.totalDeaths),
        style_class: "statistic-data-info-value",
      });
      this._recovered = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.recovered),
        style_class: "statistic-data-info-value",
      });
      this._activeSick = new St.Label({
        text:
          coronaData == null ? "---" : this.numberWithCommas(coronaData.active),
        style_class: "statistic-data-info-value",
      });
      this._criticalSick = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.critical),
        style_class: "statistic-data-info-value",
      });
      this._casesPerMilion = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.casesPerMilion),
        style_class: "statistic-data-info-value",
      });
      let rb = new St.BoxLayout({
        style_class: "corona-current-databox",
      });
      let rb_captions = new St.BoxLayout({
        vertical: true,
        style_class:
          "popup-menu-item popup-status-menu-item corona-current-databox-captions",
      });
      let rb_values = new St.BoxLayout({
        vertical: true,
        style_class: "system-menu-action corona-current-databox-values",
      });
      rb.add_actor(rb_captions);
      rb.add_actor(rb_values);

      rb_captions.add_actor(
        new St.Label({
          text: _("Total cases:"),
          style_class: "statistic-data-info-key",
        })
      );
      rb_values.add_actor(this._totalCases);
      rb_captions.add_actor(
        new St.Label({
          text: _("Total deaths:"),
          style_class: "statistic-data-info-key",
        })
      );
      rb_values.add_actor(this._totalDeaths);
      rb_captions.add_actor(
        new St.Label({
          text: _("Recovered:"),
          style_class: "statistic-data-info-key",
        })
      );
      rb_values.add_actor(this._recovered);
      rb_captions.add_actor(
        new St.Label({
          text: _("Active:"),
          style_class: "statistic-data-info-key",
        })
      );
      rb_values.add_actor(this._activeSick);
      rb_captions.add_actor(
        new St.Label({
          text: _("Critical:"),
          style_class: "statistic-data-info-key",
        })
      );
      rb_values.add_actor(this._criticalSick);
      rb_captions.add_actor(
        new St.Label({
          text: _("Cases / 1M:"),
          style_class: "statistic-data-info-key",
        })
      );
      rb_values.add_actor(this._casesPerMilion);

      let xb = new St.BoxLayout();
      xb.add_actor(bb);
      xb.add_actor(rb);

      let box = new St.BoxLayout({
        style_class: "corona-current-iconbox",
      });
      box.add_actor(xb);
      this._currentCountryInfo.set_child(box);
    }
  }
);

function timerHandler() {
  if (coronaMenu !== null) {
    requestCoronaInfo();
    timeout = Mainloop.timeout_add_seconds(refreshPeriod, timerHandler);
  }
  return false;
}

function countryChangedHandler() {
  requestCoronaInfo();
}

function updateIntervalChangedHandler() {
  refreshPeriod = Settings.get_int("update-interval") * 60;
  timeout = Mainloop.timeout_add_seconds(refreshPeriod, timerHandler);
}

function requestCoronaInfo() {
  let country = Settings.get_string("country");
  GET_URL(URL + country, function (status_code, body) {
    let formattedInfo = updateInfo.formatResponse(body);
    updateButtonText(formattedInfo);
  });
}

function GET_URL(url, callback) {
  let request = Soup.Message.new("GET", url);
  let _session = new Soup.SessionAsync();
  _session.queue_message(
    request,
    Lang.bind(this, function (session, message) {
      callback(message.status_code, request.response_body.data);
    })
  );
}

function updateButtonText(formattedInfo) {
  let panelText;
  if (formattedInfo === null) {
    panelText = `${NOT_APPLICABLE} ${SKULL} ${NOT_APPLICABLE}`;
  } else {
    panelText = `${formattedInfo.newCases}  ${SKULL} ${
      formattedInfo.newDeaths == NOT_APPLICABLE
        ? formattedInfo.newDeaths
        : formattedInfo.newDeaths
    }`;
  }
  coronaMenu.panelButtonText.set_text(panelText);
  coronaMenu.update(formattedInfo);
}

function init() {
  refreshPeriod = Settings.get_int("update-interval") * 60;
  Settings.connect("changed::" + "country", countryChangedHandler);
  Settings.connect(
    "changed::" + "update-interval",
    updateIntervalChangedHandler
  );
}

function enable() {
  timeout = Mainloop.timeout_add_seconds(refreshPeriod, timerHandler);
  coronaMenu = new CoronaMenuButton();
  Main.panel.addToStatusArea("coronaMenu", coronaMenu, 1);
  requestCoronaInfo();
}

function disable() {
  Mainloop.source_remove(timeout);
  coronaMenu.destroy();
  coronaMenu = null;
}
