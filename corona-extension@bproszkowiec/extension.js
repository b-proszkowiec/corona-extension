const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const settings = Me.imports.lib.getSettings();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let updateInfo = Me.imports.lib.CoronaInfo.getInstance();
let timeout,
  refreshPeriod = 60.0;
var NOT_APPLICABLE = "n/a";
var SKULL = "\u2620";

let coronaMenu;

let CoronaMenuButton = GObject.registerClass(
  class CoronaMenuButton extends PanelMenu.Button {
    _init() {
      super._init(0);

      this.panelButton = new St.Bin({
        style_class: "panel-button",
      });
      this.panelButtonText = new St.Label({
        style_class: "coronaInfoPanelText",
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
      this.buildCurrentCountryData(null);

      //   this._buttonBox2 = new St.BoxLayout({
      //     style_class: "openweather-button-box",
      //   });

      //   this._prefsButton = this.createButton(
      //     "preferences-system-symbolic",
      //     _("Corona Settings")
      //   );
      //   if (this._use_text_on_buttons)
      //     this._prefsButton.set_label(this._prefsButton.get_accessible_name());
      //   // this._prefsButton.connect(
      //   //   "clicked",
      //   //   Lang.bind(this, this._onPreferencesActivate)
      //   // );
      //   this._buttonBox2.add_actor(this._prefsButton);
      //   _itemCurrent.actor.add_actor(this._buttonBox2);
    }

    destroy() {
      this.destroyCurrentCountryData();
      super.destroy();
    }

    createButton(iconName, accessibleName) {
      let button;

      button = new St.Button({
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

    buildCurrentCountryData(coronaData) {
      this._newCasesIcon = new St.Icon({
        icon_size: 15,
        gicon: Gio.icon_new_for_string(
          Me.dir.get_path() + "/icons/man-shape.svg"
        ),
        style_class: "new-cases-icon-style",
      });

      this._newDeathsIcon = new St.Icon({
        icon_size: 15,
        gicon: Gio.icon_new_for_string(
          Me.dir.get_path() + "/icons/sick-face.svg"
        ),
        style_class: "new-deaths-icon-style",
      });

      this._currentCountrySummary = new St.Label({
        text:
          coronaData == null
            ? "---"
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
      });
      this._newDeaths = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.newDeaths),
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
      });
      this._totalDeaths = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.totalDeaths),
      });
      this._recovered = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.recovered),
      });
      this._activeSick = new St.Label({
        text:
          coronaData == null ? "---" : this.numberWithCommas(coronaData.active),
      });
      this._criticalSick = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.critical),
      });
      this._casesPerMilion = new St.Label({
        text:
          coronaData == null
            ? "---"
            : this.numberWithCommas(coronaData.casesPerMilion),
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
        })
      );
      rb_values.add_actor(this._totalCases);
      rb_captions.add_actor(
        new St.Label({
          text: _("Total deaths:"),
        })
      );
      rb_values.add_actor(this._totalDeaths);
      rb_captions.add_actor(
        new St.Label({
          text: _("Recovered:"),
        })
      );
      rb_values.add_actor(this._recovered);
      rb_captions.add_actor(
        new St.Label({
          text: _("Active:"),
        })
      );
      rb_values.add_actor(this._activeSick);
      rb_captions.add_actor(
        new St.Label({
          text: _("Critical:"),
        })
      );
      rb_values.add_actor(this._criticalSick);
      rb_captions.add_actor(
        new St.Label({
          text: _("Cases / 1M:"),
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
  if (coronaMenu === null) {
    updateButtonText();
    timeout = Mainloop.timeout_add_seconds(refreshPeriod, timerHandler);
  }
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
  refreshPeriod = settings.get_int("update-interval") * 60;

  settings.connect("changed::" + "country", countryChangedHandler);
  settings.connect(
    "changed::" + "update-interval",
    updateIntervalChangedHandler
  );
}

function updateButtonText() {
  let data = updateInfo.updateCoronaInfo();

  let panelText = `${data.newCases}  ${SKULL} ${
    data.newDeaths == NOT_APPLICABLE ? data.newDeaths : data.newDeaths
  }`;
  coronaMenu.panelButtonText.set_text(panelText);
  coronaMenu.update(data);
}

function enable() {
  timeout = Mainloop.timeout_add_seconds(refreshPeriod, timerHandler);

  coronaMenu = new CoronaMenuButton();
  Main.panel.addToStatusArea("coronaMenu", coronaMenu, 1);
  updateButtonText();
}

function disable() {
  Mainloop.source_remove(timeout);
  coronaMenu.destroy();
  coronaMenu = null;
}
