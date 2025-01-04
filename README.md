# peaks-player

A Web Component for [peaks.js](https://github.com/bbc/peaks.js).

## Peaks data

The peaks need to be generated in advance using the [audiowaveform](https://github.com/bbc/audiowaveform) tool:

```bash
audiowaveform -i file.mp3 -o file.dat -b 8
```

## Install Web Component

peaks-player provide two new elements:

- `<peaks-player>`: a single player, like the `<audio>` element.
- `<peaks-playlist>`: a playlist player, to play multiple files.

To create the element, the `peaks-player.js` script needs to be loaded. For example, add the following to the page's headers:

```html
<script type="module" src="https://unpkg.com/peaks-player@1.0.0/dist/peaks-player.js"></script>
```

## Player

![image](https://github.com/user-attachments/assets/dd463cd8-b928-4a33-8364-1329f3087c31)


```html
<peaks-player url="./my-sound"></peaks-player>
```

Available properties:

- url: The base path for the `.mp3` and `.dat` file locations.
- width: A canvas fixed width, it default to 1000px, 600px or the window.width for small device.

## Playlist

![image](https://github.com/user-attachments/assets/da21aa40-6f8f-4e41-8b12-2bedb3653b3c)



The playlist is created using a list of track defined as:

- path: *url*, the base path for the `.mp3` and `.dat`.
- title: *text*, the title of the sound.
- len: *natural*, the file length in milli seconds.
- date: *YYYY-MM-DD*, an optional release date.

Here is an example playlist data:

```
[ {"path": "album/first", "title": "la première", "len": 34200}
, {"path": "album/second", "title": "la deuxième", "len": 60000}
]
```

Add a playlist player with:

```html
<peaks-playlist url="playlist.json"></peaks-playlist>
```

Available properties:

- url: The playlist data location. The track paths are relative to the dirname of the playlist.
- pos: The starting file, defaults to 1.
- width: The player width.
