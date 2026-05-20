# Logo library

The editor automatically shows a logo library when this folder contains `logos.json`.

Expected format:

```json
[
  {
    "name": "befree",
    "src": "logos/befree.svg"
  },
  {
    "name": "М.Видео",
    "src": "logos/mvideo.svg"
  }
]
```

A Figma sync step should export logo nodes as local SVG/PNG files and write this JSON.
