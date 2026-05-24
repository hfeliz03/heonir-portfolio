# Heonir Feliz — Portfolio

Personal portfolio site for Heonir Feliz — developer, AI enthusiast, and Computer Science & Mathematics student from the Dominican Republic.

Built as a static site with vanilla HTML, CSS, and JavaScript — no build step.

## Sections

- **About** — background and story
- **Education** — academic journey
- **Experience** — work and internships
- **Projects** — selected work
- **Certifications** — credentials carousel
- **Beyond Code** — hobbies and interests
- **Photography** — personal photo collection
- **Contact**

## Run locally

Just open `index.html` in a browser, or serve the directory:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html      Page markup
styles.css      All styling (themes, layout, animations)
script.js       Interactivity (nav, reveals, carousels, parallax)
images/         Photos, logos, and the photography collection
```

The photography section reads from `images/photographyCollection/manifest.json`. To regenerate it after adding or removing photos:

```bash
./update-photo-manifest.sh
```
