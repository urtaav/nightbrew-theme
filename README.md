# Nightbrew

A late-night theme for devs who run on coffee and prompts.

Nightbrew is a dark theme for JetBrains IDEs (IntelliJ IDEA, WebStorm, PyCharm, Rider, GoLand, …).
Soft blue-black surfaces, iOS-bright accents and calm contrast that stays easy on the eyes through long sessions.

<!-- TODO: add screenshots -->

## Variants

| Variant | Mood | Availability |
|---|---|---|
| **Nightbrew Cove** | Blue-black night, pink / sky / mint accents | Free (this plugin) |
| **Nightbrew Kiln** | Warm graphite, ivory text, terracotta accent | [Nightbrew Pro](https://plugins.jetbrains.com/) <!-- TODO: Pro listing URL --> |
| **Nightbrew Roast** | Roasted coffee, caramel, cream and matcha | [Nightbrew Pro](https://plugins.jetbrains.com/) <!-- TODO: Pro listing URL --> |

Every variant uses the same color roles (keywords, functions, strings, types…),
so switching variants changes the mood, not how you read code.

## Install

1. `Settings | Plugins | Marketplace`, search **Nightbrew**, install.
2. `Settings | Appearance & Behavior | Appearance`, pick **Nightbrew Cove**.

## Support

If Nightbrew makes your nights better, you can keep it brewing:

[![Buy me a coffee on Ko-fi](https://img.shields.io/badge/Ko--fi-buy%20me%20a%20coffee-FF7AB6?logo=kofi&logoColor=white)](https://ko-fi.com/<ko-fi-username>)
<!-- TODO: replace <ko-fi-username> -->

Getting **Nightbrew Pro** also supports development and unlocks the extra variants.

## Development

Colors live in `palettes/*.json`. Theme files in `src/main/resources` are generated from them:

```sh
node scripts/generate.mjs        # regenerate theme json + editor scheme
node --test scripts/test/*.test.mjs   # contrast checks + generator tests
./gradlew runIde                 # try it in a sandbox IDE
```

Each palette is validated before generation: text ≥ 12:1 contrast, syntax colors ≥ 4.5:1, comments ≥ 3.5:1.

## License

MIT © urtaav
