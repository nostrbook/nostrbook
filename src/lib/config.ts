export const defaultUploaderURLs = [
  

  'https://nostrcheck.me',
  'https://relay.shawnyeager.com/',
  'https://nostr.build',
  'https://yabu.me',
  'https://nostpic.com',
  'https://void.cat',
  'https://files.sovbit.host',
  'https://blossom.nogood.studio',

];
export const defaultUploaderBlossom = [
    "https://nosto.re/",
];

export const defaultRelays1 = [
  
  'wss://relay.j35tr.com', 
  'wss://relay.damus.io/',
  'wss://relay.primal.net/',
];

//let hub = "wss://bridge.duozhutuan.com/";
let hub = "";//"ws://localhost:8088/";
export let defaultRelays = defaultRelays1.map(relay => hub + relay );

export let booktag="createbook";
export let blogtag="createblog";
export let chaptertag="bookchapter";
