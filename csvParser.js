const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const getBandcampId = require('./bandcamp');
const getSoundCloudId = require('./soundcloud');

const findArtistAsset = (assets, artist) => assets.find(a => a.artistName === artist.artistName);

async function data() {
  const input = fs.readFileSync('./data.csv', { encoding: 'utf8' });
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true
  });
  const bandcampIds = await records.reduce(async(promises, artist) => {
    const match = artist.bandcamp.match(/https:\/\/(?<username>[\w|-]*)\.bandcamp.com/);
    const artistName = match && match.groups.username;
    return [
      ...await promises,
      {
        artistName: artist.artistName,
        bandcampId: await getBandcampId(artistName).catch((e) => { })
      }
    ];
  }, await []);

  const soundcloudIds = await Promise.all(records.map(async(artist) => {
    let soundcloudId = '';
    if(artist.soundcloud) {
      soundcloudId = await getSoundCloudId(artist.soundcloud).catch(() => { });
    }

    return {
      artistName: artist.artistName,
      soundcloudId
    };
  }));

  return records.map(artist => ({
    ...artist,
    soundcloudId: findArtistAsset(soundcloudIds, artist),
    bandcampId: findArtistAsset(bandcampIds, artist)
  }));
}

data()
  .then(console.log);
