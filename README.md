# peaks-player

A Web Component for [peaks.js](https://github.com/bbc/peaks.js).

## player

Add the player to your site/blog that way:

```html
<script type="module" src="peaks-player.js"></script>
<peaks-player url="./my-sound"></peaks-player>
```

The url must be a base path for the `.mp3` and `.dat` file locations.
Generate the `.dat` with the [audiowaveform](https://github.com/bbc/audiowaveform):

```bash
audiowaveform -i file.mp3 -o file.dat -b 8
```

## playlist

Add the playlist player that way:

```html
<peaks-playlist pos=1 url="playlist.json"></peaks-playlist>
```

The url must be the location of the following data:

```json
[ {"path": "album/first", "title": "la première"}
, {"path": "album/second", "title": "la deuxième"}
]
```

Checkout the demo: https://midirus.com/project/pastagang
