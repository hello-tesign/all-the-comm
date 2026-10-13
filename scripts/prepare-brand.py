"""Extract supplied Illustrator/PDF paths through Poppler + Cairo; never redraw logos."""
from __future__ import annotations
import argparse
import ctypes as C
import hashlib
import json
import os
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'brand'
NATIVE = Path(r'C:\Users\home\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin')
SOURCE = Path(r'C:\Users\home\Downloads\올더로고-0523-fin-수정.ai')
EXPECTED_SHA256 = '3c504ae4f9194e500d4d9c83864ed452a0ffd3b1568825bdb16fcc48fd63bfb0'
SVG = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')


def api(lib, name, restype, argtypes):
    f = getattr(lib, name)
    f.restype, f.argtypes = restype, argtypes
    return f


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE)
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    if args.source.read_bytes()[:8] != b'%PDF-1.5':
        raise RuntimeError('Expected the supplied PDF-compatible Illustrator original.')
    if hashlib.sha256(args.source.read_bytes()).hexdigest() != EXPECTED_SHA256:
        raise RuntimeError('Source differs from the reviewed logo original; recheck crop coordinates before exporting.')
    dll_dir = os.add_dll_directory(str(NATIVE))
    poppler = C.CDLL(str(NATIVE / 'poppler-glib.dll'))
    cairo = C.CDLL(str(NATIVE / 'cairo.dll'))
    gobject = C.CDLL(str(NATIVE / 'gobject-2.0-0.dll'))
    new_doc = api(poppler, 'poppler_document_new_from_file', C.c_void_p, [C.c_char_p, C.c_char_p, C.POINTER(C.c_void_p)])
    get_page = api(poppler, 'poppler_document_get_page', C.c_void_p, [C.c_void_p, C.c_int])
    render = api(poppler, 'poppler_page_render', None, [C.c_void_p, C.c_void_p])
    svg_surface = api(cairo, 'cairo_svg_surface_create', C.c_void_p, [C.c_char_p, C.c_double, C.c_double])
    image_surface = api(cairo, 'cairo_image_surface_create', C.c_void_p, [C.c_int, C.c_int, C.c_int])
    create = api(cairo, 'cairo_create', C.c_void_p, [C.c_void_p])
    translate = api(cairo, 'cairo_translate', None, [C.c_void_p, C.c_double, C.c_double])
    scale = api(cairo, 'cairo_scale', None, [C.c_void_p, C.c_double, C.c_double])
    rectangle = api(cairo, 'cairo_rectangle', None, [C.c_void_p, C.c_double, C.c_double, C.c_double, C.c_double])
    clip = api(cairo, 'cairo_clip', None, [C.c_void_p])
    destroy = api(cairo, 'cairo_destroy', None, [C.c_void_p])
    finish = api(cairo, 'cairo_surface_finish', None, [C.c_void_p])
    surface_destroy = api(cairo, 'cairo_surface_destroy', None, [C.c_void_p])
    write_png = api(cairo, 'cairo_surface_write_to_png', C.c_int, [C.c_void_p, C.c_char_p])
    unref = api(gobject, 'g_object_unref', None, [C.c_void_p])
    err = C.c_void_p()
    document = new_doc(args.source.resolve().as_uri().encode('utf-8'), None, C.byref(err))
    if not document:
        raise RuntimeError('Poppler could not open the supplied Illustrator PDF representation.')

    # Coordinates measured from the original PDF artboards, in points from top-left.
    # Includes only existing official compositions; no letters or logo geometry are redrawn.
    variants = {
        'logo-horizontal': {'page': 2, 'crop': [462.5, 843.0, 417.0, 91.0], 'description': 'Original mint Korean horizontal signature; symbol at right, English subline.'},
        'logo-symbol': {'page': 1, 'crop': [451.0, 215.5, 286.0, 285.0], 'description': 'Original mint-to-teal-to-blue symbol, isolated from page 1.'},
        'logo-stacked': {'page': 1, 'crop': [186.5, 215.5, 817.0, 622.0], 'description': 'Original mint stacked English/Korean signature from page 1.'},
    }
    manifest = {
        'source': args.source.name,
        'sourceSha256': hashlib.sha256(args.source.read_bytes()).hexdigest(),
        'method': 'Read-only PDF-compatible AI vector rendering via Poppler GLib and Cairo SVG surfaces; fixed crop boxes preserve original outlines.',
        'colorNote': 'Original PDF color-managed display conversion, not a newly assigned brand palette. White and on-dark variants are derived application proposals, not pre-existing supplied variants.',
        'variants': {},
    }
    try:
        for name, info in variants.items():
            page = get_page(document, info['page'] - 1)
            x, y, w, h = info['crop']
            target = OUT / (name + '.svg')
            surface = svg_surface(str(target).encode('utf-8'), w, h)
            ctx = create(surface)
            rectangle(ctx, 0, 0, w, h)
            clip(ctx)
            translate(ctx, -x, -y)
            render(page, ctx)
            destroy(ctx)
            finish(surface)
            surface_destroy(surface)
            tree = ET.parse(target)
            root = tree.getroot()
            root.set('width', str(w))
            root.set('height', str(h))
            root.set('viewBox', f'0 0 {w} {h}')
            root.set('role', 'img')
            title = ET.Element(f'{{{SVG}}}title')
            title.text = '올더커뮤니케이션' if name != 'logo-symbol' else '올더커뮤니케이션 심볼'
            root.insert(0, title)
            tree.write(target, encoding='utf-8', xml_declaration=True)
            # Dark application keeps the original mint fills/gradient; only dark gray
            # lettering changes to white. Clip geometry and symbol colors are untouched.
            for el in root.iter():
                fill = el.get('fill', '')
                values = re.findall(r'([\d.]+)%', fill)
                if el.tag.rsplit('}', 1)[-1] == 'path' and fill.startswith('rgb(') and len(values) == 3:
                    channels = list(map(float, values))
                    if max(channels) - min(channels) < 12:
                        el.set('fill', '#ffffff')
            dark = OUT / (name + '-on-dark.svg')
            tree.write(dark, encoding='utf-8', xml_declaration=True)
            # All-white derivative keeps every original outline and transparent opening.
            tree = ET.parse(target)
            root = tree.getroot()
            for el in root.iter():
                if el.tag.rsplit('}', 1)[-1] == 'path' and el.get('fill') not in [None, 'none']:
                    el.set('fill', '#ffffff')
            for defs in root.findall(f'{{{SVG}}}defs'):
                for item in list(defs):
                    if item.tag.rsplit('}',1)[-1] in ['linearGradient', 'radialGradient']:
                        defs.remove(item)
            white = OUT / (name + '-white.svg')
            tree.write(white, encoding='utf-8', xml_declaration=True)
            # Transparent PNG fallback rendered directly from the original PDF at 3x.
            density = 3
            raster = image_surface(0, round(w * density), round(h * density))
            ctx = create(raster)
            scale(ctx, density, density)
            rectangle(ctx, 0, 0, w, h)
            clip(ctx)
            translate(ctx, -x, -y)
            render(page, ctx)
            destroy(ctx)
            png = OUT / (name + '.png')
            if write_png(raster, str(png).encode('utf-8')):
                raise RuntimeError(f'PNG export failed: {name}')
            surface_destroy(raster)
            unref(page)
            manifest['variants'][name] = {**info, 'width': w, 'height': h, 'svgBytes': target.stat().st_size, 'whiteSvgBytes': white.stat().st_size, 'onDarkSvgBytes': dark.stat().st_size, 'pngPixels': [round(w*density), round(h*density)], 'embeddedRasterImages': len(ET.parse(target).findall(f'.//{{{SVG}}}image'))}
    finally:
        unref(document)
        dll_dir.close()
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
