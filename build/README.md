# App Icon Assets

Letakkan file icon di folder ini:

- `icon.png` (minimal 512x512, disarankan 1024x1024)
- `icon.ico` (opsional, jika ingin format khusus Windows)

Contoh generate `icon.ico` dari `icon.png` (butuh ImageMagick):

```bash
magick build/icon.png -define icon:auto-resize=16,24,32,48,64,128,256 build/icon.ico
```
