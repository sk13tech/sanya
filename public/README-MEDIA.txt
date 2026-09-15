╔══════════════════════════════════════════════════════════════╗
║   HAPPY 20th BIRTHDAY SANYA — HOW TO ADD YOUR OWN MEDIA      ║
╚══════════════════════════════════════════════════════════════╝

The photos are optional because artwork fallbacks are included.
Music is file-only: add the audio files below if you want sound.
Nothing breaks if an audio file is missing; that part stays silent.


──────────────────────────────────────────────────────────────
1) BACKGROUND MUSIC  (plays across the whole site, on loop)
──────────────────────────────────────────────────────────────

   Put your song here:

        public/background-music.mp3

   • Add your real song using the exact filename above.
   • Accepted formats: .mp3  .m4a  .ogg  .wav
     (keep the name "background-music", just change the extension)
   • It fades in gently and loops forever.
   • It automatically ducks down to 5% volume when the birthday
     song plays at the cake, then swells back up.
   • If the file is missing/invalid, background music stays silent.


──────────────────────────────────────────────────────────────
2) BIRTHDAY SONG  (plays ONCE when all candles are blown out)
──────────────────────────────────────────────────────────────

   Put your song here:

        public/happy-birthday.mp3

   • Add your real song using the exact filename above.
   • Accepted formats: .mp3  .m4a  .ogg  .wav
   • TIP: record YOURSELF singing it on your phone and drop that
     in. It is by far the most romantic option.
   • If the file is missing/invalid, this moment stays silent.


──────────────────────────────────────────────────────────────
3) THE 5 PHOTOS  (the fading gallery)
──────────────────────────────────────────────────────────────

   Put 5 portrait (vertical) photos here:

        public/photos/photo 1.jpg
        public/photos/photo 2.jpg
        public/photos/photo 3.jpg
        public/photos/photo 4.jpg
        public/photos/photo 5.jpg

   ⚠ IMPORTANT: there is a SPACE after the word "photo",
     and the extension is .jpg

   • Portrait / vertical photos look best (they fill the frame).
   • Each photo gets its own cinematic colour grade and a slow
     zoom, then dissolves into the next as she scrolls.
   • Any photo you don't add simply shows the existing artwork.

   To change the caption under each photo, edit:
        src/data/photos.ts


──────────────────────────────────────────────────────────────
4) NAMES & AGE
──────────────────────────────────────────────────────────────

   Edit:  src/config.ts

        HER_NAME     = "Sanya"
        AUTHOR_NAME  = "Sanjeev Oberoi"
        AUTHOR_NICK  = "Oreo"
        TURNING_AGE  = 20


──────────────────────────────────────────────────────────────
5) THE LETTER IN THE GREETING CARD
──────────────────────────────────────────────────────────────

   Edit the three paragraphs in:
        src/components/GreetingCard.tsx   (the LINES array)

   Make them yours. That page is the heart of the whole site.

                                          — made with love 🍫
