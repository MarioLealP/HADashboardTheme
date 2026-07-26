import { z } from "zod";

export const HAEntityAttributesSchema = z
  .object({
    friendly_name: z.string().optional(),
    unit_of_measurement: z.string().optional(),
    icon: z.string().optional(),
    preset_mode: z.string().optional(),
    preset_modes: z.array(z.string()).optional(),
    pm2_5: z.number().optional(),
    filter_life_remaining: z.number().optional(),
    temperature: z.number().optional(),
    humidity: z.number().optional(),
    forecast: z
      .array(
        z.object({
          datetime: z.string(),
          temperature: z.number(),
          condition: z.string(),
        }),
      )
      .optional(),
    hourly_forecast: z
      .array(
        z.object({
          datetime: z.string(),
          temperature: z.number(),
          condition: z.string(),
        }),
      )
      .optional(),
    media_title: z.string().optional(),
    media_artist: z.string().optional(),
    media_album_name: z.string().optional(),
    entity_picture: z.string().optional(),
    media_duration: z.number().optional(),
    media_position: z.number().optional(),
    media_position_updated_at: z.string().optional(),
    message: z.string().optional(),
    description: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    all_day: z.boolean().optional(),
    rgb_color: z.array(z.number()).optional(),
    brightness: z.number().optional(),
  })
  .passthrough();

export const HAEntityStateSchema = z.object({
  entity_id: z.string(),
  state: z.string(),
  attributes: HAEntityAttributesSchema.optional(),
  last_changed: z.string().optional(),
  last_updated: z.string().optional(),
});

export type HAEntityAttributes = z.infer<typeof HAEntityAttributesSchema>;
export type HAEntityState = z.infer<typeof HAEntityStateSchema>;

export const HAStateChangedEventSchema = z.object({
  entity_id: z.string(),
  new_state: HAEntityStateSchema.nullable().optional(),
  old_state: HAEntityStateSchema.nullable().optional(),
});

export type HAStateChangedEvent = z.infer<typeof HAStateChangedEventSchema>;

export const HAServiceDataSchema = z.record(z.string(), z.unknown());
export type HAServiceData = z.infer<typeof HAServiceDataSchema>;

export const SpotifyStateSchema = HAEntityStateSchema;
export type SpotifyState = z.infer<typeof SpotifyStateSchema>;

export const HAStatesMapSchema = z.record(z.string(), HAEntityStateSchema);
export type HAStatesMap = z.infer<typeof HAStatesMapSchema>;

export const WeatherForecastItemSchema = z.object({
  datetime: z.string(),
  temperature: z.number(),
  condition: z.string(),
});
export type WeatherForecastItem = z.infer<typeof WeatherForecastItemSchema>;
