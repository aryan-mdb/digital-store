<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

/**
 * Shrinks uploaded images before they are stored in the database.
 *
 * Admins upload phone/camera photos of several MB; served as-is they make
 * the storefront crawl on mobile. Images are downscaled to fit $maxSide
 * and re-encoded as WebP (keeps transparency, ~10x smaller than PNG).
 * Falls back to the original bytes when GD/WebP is unavailable or the
 * file isn't a decodable image.
 */
class ImageOptimizer
{
    /**
     * Optimise an uploaded image for database storage.
     *
     * @return array{0: string, 1: string} [base64 data, mime]
     */
    public static function fromUpload(UploadedFile $file, int $maxSide = 1000): array
    {
        $result = self::optimize(file_get_contents($file->getRealPath()), $file->getMimeType(), $maxSide);

        return [base64_encode($result['data']), $result['mime']];
    }

    /**
     * @return array{data: string, mime: string} raw (not base64) bytes + mime
     */
    public static function optimize(string $bytes, ?string $mime, int $maxSide = 1000, int $quality = 80): array
    {
        $original = ['data' => $bytes, 'mime' => $mime ?: 'application/octet-stream'];

        if (! function_exists('imagecreatefromstring') || ! function_exists('imagewebp')) {
            return $original;
        }

        $src = @imagecreatefromstring($bytes);
        if ($src === false) {
            return $original;
        }

        $w = imagesx($src);
        $h = imagesy($src);
        $scale = min(1, $maxSide / max($w, $h));
        $nw = max(1, (int) round($w * $scale));
        $nh = max(1, (int) round($h * $scale));

        $dst = imagecreatetruecolor($nw, $nh);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 0, 0, 0, 127));
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

        ob_start();
        $ok = imagewebp($dst, null, $quality);
        $webp = ob_get_clean();

        // Only keep the re-encode if it actually helped.
        if (! $ok || $webp === '' || strlen($webp) >= strlen($bytes)) {
            return $original;
        }

        return ['data' => $webp, 'mime' => 'image/webp'];
    }
}
