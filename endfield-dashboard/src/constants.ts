export const ENTITY = {
  MAIN_LIGHT: import.meta.env.VITE_ENTITY_MAIN_LIGHT || "light.chandelure",
  SHELF_SWITCH: import.meta.env.VITE_ENTITY_SHELF_SWITCH || "switch.shelf",
  SHELF_POWER: import.meta.env.VITE_ENTITY_SHELF_POWER || "sensor.shelf_power",
  PLUG_SWITCH: import.meta.env.VITE_ENTITY_PLUG_SWITCH || "switch.aux_plug",
  PLUG_POWER: import.meta.env.VITE_ENTITY_PLUG_POWER || "sensor.aux_plug_power",
  PURIFIER: import.meta.env.VITE_ENTITY_PURIFIER || "fan.core_300s",
  PM25: import.meta.env.VITE_ENTITY_PM25 || "sensor.core_300s_pm2_5",
  FILTER: import.meta.env.VITE_ENTITY_FILTER || "sensor.filter",
  WEATHER: import.meta.env.VITE_ENTITY_WEATHER || "weather.home",
  CALENDARS: import.meta.env.VITE_ENTITY_CALENDARS
    ? import.meta.env.VITE_ENTITY_CALENDARS.split(",")
    : [
        "calendar.local_de_trabalho",
        "calendar.lealmariop_gmail_com",
        "calendar.lealmario47_gmail_com",
        "calendar.feriados_em_portugal",
        "calendar.aniversarios",
      ],
  SPOTIFY: import.meta.env.VITE_ENTITY_SPOTIFY || "media_player.spotify",
};
