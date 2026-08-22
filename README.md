# Viraj Portfolio with JSON Data

The portfolio now uses `data.json` as its content/data source.

### Files

- `index.html` - UI/layout
- `style.css` - styling
- `script.js` - reads JSON and renders the UI
- `data.json` - portfolio data
- `assets/` - images/resume

### How it works

The browser loads:

`index.html` → `script.js` → `data.json` → renders content

You can change most portfolio content by editing only `data.json`.

### Important limitation

This is a **JSON file acting as a static data source**, not a real database.

GitHub Pages can serve and read `data.json`, but JavaScript running in the browser cannot safely save changes back to that JSON file on GitHub.

If you eventually want:

- Admin login
- Add/edit/delete projects
- Edit experience from a dashboard
- Contact messages
- Analytics
- Dynamic database records

then we should move the data layer to an API + database.

### Local testing

Do not double-click `index.html` and expect `fetch("./data.json")` to work. Use a local HTTP server:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000/`
