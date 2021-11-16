# Covid-19 extension

GNOME shell extension to gets covid-19 daily statistic information for selected country.
It based on https://corona-stats.online and shows information about:

- today's new coronavirus cases and deaths
- total cases
- total deaths
- recovered
- current active cases
- current critical cases
- cases per 1M population

## Requirements

Gnome shell in version 3.36.0 or above.

## Installing

- Make sure gnome shell is installed and supported by your linux distribution

- Clone a repository to your computer

```sh
git clone https://github.com/b-proszkowiec/corona-extension.git
```

- Make file install.sh exacutable

```sh
cd corona-extension
chmod +x install.sh
```

- Run install.sh script

```sh
./install.sh
```

- Restart gnome shell and enable extension in gnome-tweaks
