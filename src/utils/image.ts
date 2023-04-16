export function blurBase64(canvasId, base64) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            let canvas = document.getElementById(canvasId);
            if (!canvas) return ''
            let context = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            let pixels = imageData.data;
            let width = canvas.width;
            let height = canvas.height;

            var kernel = [
                [1, 1, 1, 2, 2, 2, 1, 1, 1],
                [1, 2, 2, 3, 3, 3, 2, 2, 1],
                [1, 2, 3, 4, 4, 4, 3, 2, 1],
                [2, 3, 4, 5, 5, 5, 4, 3, 2],
                [2, 3, 4, 5, 6, 5, 4, 3, 2],
                [2, 3, 4, 5, 5, 5, 4, 3, 2],
                [1, 2, 3, 4, 4, 4, 3, 2, 1],
                [1, 2, 2, 3, 3, 3, 2, 2, 1],
                [1, 1, 1, 2, 2, 2, 1, 1, 1]
            ];

            var divisor = 159;

            let offset = kernel.length / 2;
            let r, g, b, a, idx, rTotal, gTotal, bTotal, aTotal, kernelPixel;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    rTotal = gTotal = bTotal = aTotal = 0;

                    for (let ky = 0; ky < kernel.length; ky++) {
                        for (let kx = 0; kx < kernel.length; kx++) {
                            kernelPixel = kernel[ky][kx];
                            idx = ((y + ky - offset) * width + (x + kx - offset)) * 4;
                            if (idx < 0 || idx >= pixels.length) {
                                continue;
                            }

                            rTotal += pixels[idx] * kernelPixel;
                            gTotal += pixels[idx + 1] * kernelPixel;
                            bTotal += pixels[idx + 2] * kernelPixel;
                            aTotal += pixels[idx + 3] * kernelPixel;
                        }
                    }

                    idx = (y * width + x) * 4;
                    pixels[idx] = rTotal / divisor;
                    pixels[idx + 1] = gTotal / divisor;
                    pixels[idx + 2] = bTotal / divisor;
                    pixels[idx + 3] = aTotal / divisor;
                }
            }

            context.putImageData(imageData, 0, 0);

            //     返回base64
            resolve(canvas.toDataURL());
        };
    })
}