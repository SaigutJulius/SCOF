const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const projectRoot = path.resolve(__dirname, '..');
const audioRoot = path.join(projectRoot, 'assets', 'stories', 'audio');
const sourcePath = path.join(audioRoot, 'st-firm-tunajenga-full.mp3');
const releasePath = path.join(audioRoot, 'st-firm-tunajenga-release.mp3');
const coverPath = path.join(audioRoot, 'artwork', 'tunajenga-cover-embedded.jpg');
const metadataPath = path.join(audioRoot, 'st-firm-tunajenga-release-metadata.json');
const lyricsPath = path.join(audioRoot, 'st-firm-tunajenga-release-lyrics.txt');

for (const required of [sourcePath, coverPath, metadataPath, lyricsPath]) {
  if (!fs.existsSync(required)) throw new Error(`Missing release input: ${required}`);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const lyrics = fs.readFileSync(lyricsPath, 'utf8').trim();
const source = fs.readFileSync(sourcePath);
const cover = fs.readFileSync(coverPath);

function syncSafe(value) {
  return Buffer.from([
    (value >> 21) & 0x7f,
    (value >> 14) & 0x7f,
    (value >> 7) & 0x7f,
    value & 0x7f,
  ]);
}

function existingTagLength(buffer) {
  if (buffer.subarray(0, 3).toString('ascii') !== 'ID3') return 0;
  const size = ((buffer[6] & 0x7f) << 21)
    | ((buffer[7] & 0x7f) << 14)
    | ((buffer[8] & 0x7f) << 7)
    | (buffer[9] & 0x7f);
  const footer = buffer[3] === 4 && (buffer[5] & 0x10) ? 10 : 0;
  return 10 + size + footer;
}

function utf16(value) {
  return Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(String(value), 'utf16le')]);
}

function frame(id, payload) {
  const header = Buffer.alloc(10);
  header.write(id, 0, 4, 'ascii');
  header.writeUInt32BE(payload.length, 4);
  return Buffer.concat([header, payload]);
}

function textFrame(id, value) {
  return frame(id, Buffer.concat([Buffer.from([1]), utf16(value)]));
}

function userTextFrame(description, value) {
  return frame('TXXX', Buffer.concat([
    Buffer.from([1]),
    utf16(description),
    Buffer.from([0, 0]),
    utf16(value),
  ]));
}

function commentFrame(value) {
  return frame('COMM', Buffer.concat([
    Buffer.from([1]),
    Buffer.from('eng', 'ascii'),
    utf16('Description'),
    Buffer.from([0, 0]),
    utf16(value),
  ]));
}

function lyricsFrame(value) {
  return frame('USLT', Buffer.concat([
    Buffer.from([1]),
    Buffer.from('eng', 'ascii'),
    utf16('Lyrics'),
    Buffer.from([0, 0]),
    utf16(value),
  ]));
}

function artworkFrame(image) {
  return frame('APIC', Buffer.concat([
    Buffer.from([0]),
    Buffer.from('image/jpeg\0', 'ascii'),
    Buffer.from([3]),
    Buffer.from([0]),
    image,
  ]));
}

const frames = [
  textFrame('TIT2', metadata.title),
  textFrame('TPE1', metadata.artist),
  textFrame('TPE2', metadata.album_artist),
  textFrame('TALB', metadata.album),
  textFrame('TCON', metadata.genre),
  textFrame('TYER', metadata.year),
  textFrame('TPUB', metadata.publisher),
  textFrame('TRCK', metadata.track),
  userTextFrame('Creative direction', metadata.creative_direction),
  commentFrame(metadata.description),
  lyricsFrame(lyrics),
  frame('WOAS', Buffer.from(metadata.source_url, 'latin1')),
  artworkFrame(cover),
];

const padding = Buffer.alloc(2048);
const payload = Buffer.concat([...frames, padding]);
const header = Buffer.concat([
  Buffer.from('ID3', 'ascii'),
  Buffer.from([3, 0, 0]),
  syncSafe(payload.length),
]);

const sourceAudio = source.subarray(existingTagLength(source));
const release = Buffer.concat([header, payload, sourceAudio]);
fs.writeFileSync(releasePath, release);

const releaseAudio = release.subarray(existingTagLength(release));
const sourceAudioHash = crypto.createHash('sha256').update(sourceAudio).digest('hex').toUpperCase();
const releaseAudioHash = crypto.createHash('sha256').update(releaseAudio).digest('hex').toUpperCase();
if (sourceAudioHash !== releaseAudioHash) throw new Error('Release audio payload differs from the Suno source');

console.log(JSON.stringify({
  release: path.relative(projectRoot, releasePath).replaceAll('\\', '/'),
  bytes: release.length,
  embeddedCoverBytes: cover.length,
  id3Version: '2.3',
  frameCount: frames.length,
  audioPayloadPreserved: true,
  audioPayloadSha256: sourceAudioHash,
}, null, 2));
