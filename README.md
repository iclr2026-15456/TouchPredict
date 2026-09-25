# Video Generators Can Predict Touch

A static project website ready for a GitHub repository. The hero includes stitched EgoTouch, OpenTouch, and out-of-distribution videos. The results gallery has ten OpenTouch interactions with synchronized RGB, generated tactile, and ground-truth tactile videos (30 clips total). A separate 2×2 joint-prediction section displays four supplied stitched videos. The Two Hands Generation section displays four supplied EgoTouch stitched clips. The method section displays the supplied PowerPoint pipeline screenshot.

## Preview locally

Run from this directory:

```sh
python3 serve.py
```

Open http://127.0.0.1:8000. The preview server supports byte ranges so all videos can seek together. GitHub Pages serves the same static files without this script.

## Publish with GitHub Pages

1. Put this directory's contents in the root of your GitHub repository, including `assets/` and `.nojekyll`.
2. Push to `main`.
3. Under **Settings → Pages**, select **Deploy from a branch**, then **main / (root)**.

The site's asset paths are relative, so a repository subpath works. There is no build step.

## Edit the page

- `data.js`: title, author label, default sequence, sequence IDs, and optional paper/code URLs. Add final publication URLs to `paperUrl` and `codeUrl` to show their buttons.
- `index.html`: abstract, captions, and sections.
- `styles.css`: layout and typography.
- `app.js`: synchronized tactile comparison playback and sequence selection.
- `assets/tactile-videos/`: 30 supplied MP4 streams, losslessly remuxed for fast loading.
- `assets/tactile-posters/`: JPEG preview frames for those streams.
- `assets/images/pipeline-powerpoint.png`: the user's exact supplied pipeline screenshot, shown in the method section.
- `assets/stitched/`: the three supplied stitched examples as browser-compatible H.264 MP4s, plus JPG posters.
- `assets/joint/`: four supplied stitched joint-prediction examples as browser-compatible H.264 MP4s, plus JPG posters.
- `assets/bimanual/`: four supplied stitched two-hand EgoTouch examples as browser-compatible H.264 MP4s, plus JPG posters.

For another tactile interaction, add three files with a shared numeric ID to `assets/tactile-videos/`:

```text
0123_gt_video.mp4
0123_gen_tactile.mp4
0123_gt_tactile.mp4
```

Add matching JPGs to `assets/tactile-posters/`, then append `"0123"` to `samples` in `data.js`. Matching timing is necessary for synchronized playback.

