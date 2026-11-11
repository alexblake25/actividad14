"""Genera los iconos PNG de la PWA sin dependencias externas (solo stdlib)."""
import math, struct, sys, zlib

def png(path, size, maskable=False):
    azul = (30, 91, 216)
    azul2 = (21, 70, 168)
    blanco = (255, 255, 255)
    # Zona segura: en el icono maskable el dibujo ocupa ~60% centrado
    escala = 0.6 if maskable else 0.8
    s = size
    rows = []
    # Check: dos segmentos
    def seg(px, py, ax, ay, bx, by):
        dx, dy = bx - ax, by - ay
        t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        cx, cy = ax + t * dx, ay + t * dy
        return math.hypot(px - cx, py - cy)
    c = s / 2
    r = s * escala / 2
    p1 = (c - r * 0.55, c + r * 0.02)
    p2 = (c - r * 0.12, c + r * 0.45)
    p3 = (c + r * 0.62, c - r * 0.40)
    grosor = s * 0.065
    radio_esq = s * 0.22
    for y in range(s):
        row = bytearray([0])
        for x in range(s):
            if maskable:
                dentro = True
            else:
                # cuadrado redondeado
                dx = max(abs(x - c) - (c - radio_esq), 0)
                dy = max(abs(y - c) - (c - radio_esq), 0)
                dentro = math.hypot(dx, dy) <= radio_esq
            if not dentro:
                row += bytes([0, 0, 0, 0]); continue
            t = (x + y) / (2 * s)
            col = tuple(int(azul[i] * (1 - t) + azul2[i] * t) for i in range(3))
            # círculo blanco de fondo del check
            if math.hypot(x - c, y - c) <= r:
                col = blanco
                d = min(seg(x, y, *p1, *p2), seg(x, y, *p2, *p3))
                if d <= grosor:
                    col = azul
            row += bytes([col[0], col[1], col[2], 255])
        rows.append(bytes(row))
    raw = b''.join(rows)
    def chunk(tag, data):
        body = tag + data
        return struct.pack('>I', len(data)) + body + struct.pack('>I', zlib.crc32(body) & 0xffffffff)
    datos = (b'\x89PNG\r\n\x1a\n'
             + chunk(b'IHDR', struct.pack('>IIBBBBB', s, s, 8, 6, 0, 0, 0))
             + chunk(b'IDAT', zlib.compress(raw, 9))
             + chunk(b'IEND', b''))
    with open(path, 'wb') as f:
        f.write(datos)

if __name__ == '__main__':
    destino = sys.argv[1]
    png(f'{destino}/icon-192.png', 192)
    png(f'{destino}/icon-512.png', 512)
    png(f'{destino}/maskable-512.png', 512, maskable=True)
    print('Iconos generados en', destino)
