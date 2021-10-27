const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

function getSettings() {
  let GioSSS = Gio.SettingsSchemaSource;
  let schemaSource = GioSSS.new_from_directory(
    Me.dir.get_child("schemas").get_path(),
    GioSSS.get_default(),
    false
  );
  let schemaObj = schemaSource.lookup(
    "org.gnome.shell.extensions.corona",
    true
  );
  if (!schemaObj) {
    throw new Error("Cannot find schemas");
  }
  return new Gio.Settings({ settings_schema: schemaObj });
}
