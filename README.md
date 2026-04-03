# Klangqualm website

This is the code for the [Klangqualm website](https://klangqualm.debablo.de) that lists various audio projects. The website is built using Vite and React.

# Prepare data

The data has to be inserted into the `data/projects.json` file. The structure of the data is as follows:

```json
[
  {
    "title": "Title of the song",
    "description": "A short description of the song",
    "mp3-path": "path/to/song/relative/to/the/data/folder.mp3",
    "cover-jpg-path": "path/to/cover/relative/to/the/data/folder.jpg",
    "cover-png-path": "path/to/cover/relative/to/the/data/folder.png"
  },
  ...
]
```

The mp3 and jpg files have to be placed in the `data` folder. The recommended structure is as follows:
```
data/
├── projects.json
├── audio
│   ├── song1.mp3
│   └── song2.mp3
└── images
    ├── cover1.jpg
    ├── cover1.png
    ├── cover2.jpg
    └── cover2.png
```

# Build

To build the project, run:

```bash
pnpm run build
```
This will create a `dist` folder with the production build of the website. You can then serve this folder using any static file server, or deploy it to a hosting service of your choice.

# Dev

To start the development server, run:

```bash
pnpm run dev
```



