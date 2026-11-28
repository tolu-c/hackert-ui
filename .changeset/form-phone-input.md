---
"@hackert-ui/form": minor
---

`PhoneInput`, and danger-coloured labels on invalid fields.

- `field.PhoneInput` is a phone number field with a searchable country picker (flag, name and dialling code; search by name or code). It formats the number as you type, and its field value is E.164 (`"+2348031234567"`), or `""` when empty. Props: `defaultCountry` (default `"US"`), `countries` to limit the list, `locale` for country names, plus `searchPlaceholder`, `searchLabel`, `nothingFoundMessage` and `countryLabel` for translation. A stored number opens in its own country's national format, and a number typed with `+` switches to its country. Backspace over a formatting character deletes the digit before it. It depends on `libphonenumber-js`.
- While a `FormField` shows an error, its `FormField.Label` and `FormField.Description` now turn the theme's `danger` colour, alongside the red border and message.
