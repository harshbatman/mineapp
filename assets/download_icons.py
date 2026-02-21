import urllib.request
import urllib.parse

def download(prompt, filename):
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?nologo=true"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as response, open(filename, "wb") as out_file:
        out_file.write(response.read())

download("3D icon of an elegant modern bathroom with glass shower and marble bathtub, perfectly isolated on a pure solid white background, high quality, soft lighting", "bathroom.jpg")
download("3D icon of a room floor covered in hardwood planks and ceramic tiles being installed, perfectly isolated on a pure solid white background, clean lines", "flooring.jpg")
download("3D icon showing a beautiful modern house renovation, perfectly isolated on a pure solid white background, architectural style, rendering", "makeover.jpg")
download("3D icon of a colorful paint bucket, roller, and painting brushes, perfectly isolated on a pure solid white background, high quality", "painting.jpg")
