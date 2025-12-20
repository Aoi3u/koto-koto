export type Sentence = {
  id: string;
  display: string; // The visual text (Kanji/Mixed)
  reading: string; // The phonetic reading (Hiragana)
  meta?: {
    author?: string;
    title?: string;
  };
};

export const sentences: Sentence[] = [
  // ---------------------------------------------------------
  //  夏目漱石 (Natsume Soseki)
  // ---------------------------------------------------------
  {
    id: 'soseki_kokoro_01',
    display: '私はその人を常に先生と呼んでいた。',
    reading: 'わたしはそのひとをつねにせんせいとよんでいた。',
    meta: { author: '夏目漱石', title: 'こころ' },
  },
  {
    id: 'soseki_kokoro_02',
    display: '精神的に向上心のないものは、馬鹿だ。',
    reading: 'せいしんてきにこうじょうしんのないものはばかだ。',
    meta: { author: '夏目漱石', title: 'こころ' },
  },
  {
    id: 'soseki_botchan_01',
    display: '親譲りの無鉄砲で小供の時から損ばかりしている。',
    reading: 'おやゆずりのむてっぽうでこどものときからそんばかりしている。',
    meta: { author: '夏目漱石', title: '坊っちゃん' },
  },
  {
    id: 'soseki_kusamakura_01',
    display: '山路を登りながら、こう考えた。',
    reading: 'やまみちをのぼりながら、こうかんがえた。',
    meta: { author: '夏目漱石', title: '草枕' },
  },
  {
    id: 'soseki_kusamakura_02',
    display: '智に働けば角が立つ。',
    reading: 'ちにはたらけばかどがたつ。',
    meta: { author: '夏目漱石', title: '草枕' },
  },
  {
    id: 'soseki_kusamakura_03',
    display: '情に棹させば流される。',
    reading: 'じょうにさおさせばながされる。',
    meta: { author: '夏目漱石', title: '草枕' },
  },
  {
    id: 'soseki_sorekara_01',
    display: '恋は罪悪ですか。',
    reading: 'こいはざいあくですか。',
    meta: { author: '夏目漱石', title: 'それから' },
  },
  {
    id: 'soseki_sorekara_02',
    display: '歩くのは僕の性分でない。',
    reading: 'あるくのはぼくのしょうぶんでない。',
    meta: { author: '夏目漱石', title: 'それから' },
  },
  {
    id: 'soseki_wagahai_01',
    display: '吾輩は猫である。',
    reading: 'わがはいはねこである。',
    meta: { author: '夏目漱石', title: '吾輩は猫である' },
  },
  {
    id: 'soseki_wagahai_02',
    display: '名前はまだ無い。',
    reading: 'なまえはまだない。',
    meta: { author: '夏目漱石', title: '吾輩は猫である' },
  },
  {
    id: 'soseki_tsuki_01',
    display: '月が綺麗ですね。',
    reading: 'つきがきれいですね。',
    meta: { author: '夏目漱石', title: '（逸話）' },
  },

  // ---------------------------------------------------------
  //  太宰治 (Dazai Osamu)
  // ---------------------------------------------------------
  {
    id: 'dazai_melos_01',
    display: 'メロスは激怒した。',
    reading: 'めろすはげきどした。',
    meta: { author: '太宰治', title: '走れメロス' },
  },
  {
    id: 'dazai_melos_02',
    display: 'かの邪智暴虐の王を除かなければならぬ。',
    reading: 'かのじゃちぼうぎゃくのおうをのぞかなければならぬ。',
    meta: { author: '太宰治', title: '走れメロス' },
  },
  {
    id: 'dazai_shikkaku_01',
    display: '恥の多い生涯を送ってきました。',
    reading: 'はじのおおいしょうがいをおくってきました。',
    meta: { author: '太宰治', title: '人間失格' },
  },
  {
    id: 'dazai_kishu_01',
    display: '生まれて、すみません。',
    reading: 'うまれて、すみません。',
    meta: { author: '太宰治', title: '二十世紀旗手' },
  },
  {
    id: 'dazai_fugaku_01',
    display: '富士には月見草がよく似合う。',
    reading: 'ふじにはつきみそうがよくにあう。',
    meta: { author: '太宰治', title: '富嶽百景' },
  },
  {
    id: 'dazai_goodbye_01',
    display: 'さよならだけが人生だ。',
    reading: 'さよならだけがじんせいだ。',
    meta: { author: '太宰治（井伏鱒二訳）', title: '勧酒' },
  },

  // ---------------------------------------------------------
  //  宮沢賢治 (Miyazawa Kenji)
  // ---------------------------------------------------------
  {
    id: 'miyazawa_ginga_01',
    display: 'ジョバンニは、学校の帰りに活版所へ行きました。',
    reading: 'じょばんには、がっこうのかえりにかっぱんじょへいきました。',
    meta: { author: '宮沢賢治', title: '銀河鉄道の夜' },
  },
  {
    id: 'miyazawa_ginga_02',
    display: 'この切符さえあれば、どこまででも行ける。',
    reading: 'このきっぷさえあれば、どこまででもいける。',
    meta: { author: '宮沢賢治', title: '銀河鉄道の夜' },
  },
  {
    id: 'miyazawa_ame_01',
    display: '雨ニモマケズ、風ニモマケズ。',
    reading: 'あめにもまけず、かぜにもまけず。',
    meta: { author: '宮沢賢治', title: '雨ニモマケズ' },
  },
  {
    id: 'miyazawa_yodaka_01',
    display: 'よだかは、実直な顔をしています。',
    reading: 'よだかは、じっちょくなかおをしています。',
    meta: { author: '宮沢賢治', title: 'よだかの星' },
  },
  {
    id: 'miyazawa_matasaburo_01',
    display: 'どっどど、どどうど、どどうど、どどう。',
    reading: 'どっどど、どどうど、どどうど、どどう。',
    meta: { author: '宮沢賢治', title: '風の又三郎' },
  },
  {
    id: 'miyazawa_yamanashi_01',
    display: 'クラムボンはかぷかぷわらったよ。',
    reading: 'くらむぼんはかぷかぷわらったよ。',
    meta: { author: '宮沢賢治', title: 'やまなし' },
  },
  {
    id: 'miyazawa_haru_01',
    display: 'おれはひとりの修羅なのだ。',
    reading: 'おれはひとりのしゅらなのだ。',
    meta: { author: '宮沢賢治', title: '春と修羅' },
  },

  // ---------------------------------------------------------
  //  芥川龍之介 (Akutagawa Ryunosuke)
  // ---------------------------------------------------------
  {
    id: 'akutagawa_rashoumon_01',
    display: 'ある日の暮方の事である。',
    reading: 'あるひのくれがたのことである。',
    meta: { author: '芥川龍之介', title: '羅生門' },
  },
  {
    id: 'akutagawa_kumo_01',
    display: '蜘蛛の糸は、己のものだぞ。',
    reading: 'くものいとは、おれのものだぞ。',
    meta: { author: '芥川龍之介', title: '蜘蛛の糸' },
  },
  {
    id: 'akutagawa_toshisyun_01',
    display: '或春の日暮です。',
    reading: 'あるはるのひぐれです。',
    meta: { author: '芥川龍之介', title: '杜子春' },
  },
  {
    id: 'akutagawa_kappa_01',
    display: '僕はある夏の日、穂高山へ登ろうとした。',
    reading: 'ぼくはあるなつのひ、ほたかやまへのぼろうとした。',
    meta: { author: '芥川龍之介', title: '河童' },
  },
  {
    id: 'akutagawa_haguruma_01',
    display: '人生は地獄よりも地獄的である。',
    reading: 'じんせいはじごくよりもじごくてきである。',
    meta: { author: '芥川龍之介', title: '歯車' },
  },

  // ---------------------------------------------------------
  //  中島敦・梶井基次郎・川端康成
  // ---------------------------------------------------------
  {
    id: 'nakajima_sangetsuki_01',
    display: '臆病な自尊心と、尊大な羞恥心。',
    reading: 'おくびょうなじそんしんと、そんだいなしゅうちしん。',
    meta: { author: '中島敦', title: '山月記' },
  },
  {
    id: 'nakajima_sangetsuki_02',
    display: 'その声は、我が友、李徴子ではないか。',
    reading: 'そのこえは、わがとも、りちょうしではないか。',
    meta: { author: '中島敦', title: '山月記' },
  },
  {
    id: 'kajii_lemon_01',
    display: 'えたいの知れない不吉な塊。',
    reading: 'えたいのしれないふきつなかたまり。',
    meta: { author: '梶井基次郎', title: '檸檬' },
  },
  {
    id: 'kajii_sakura_01',
    display: '桜の樹の下には屍体が埋まっている！',
    reading: 'さくらのきのしたにはしたいがうまっている！',
    meta: { author: '梶井基次郎', title: '桜の樹の下には' },
  },
  {
    id: 'kawabata_yukiguni_01',
    display: '国境の長いトンネルを抜けると雪国であった。',
    reading: 'こっきょうのながいとんねるをぬけるとゆきぐにであった。',
    meta: { author: '川端康成', title: '雪国' },
  },

  // ---------------------------------------------------------
  //  詩歌・俳句 (Poetry - Naturally Short)
  // ---------------------------------------------------------
  {
    id: 'nakahara_yogore_01',
    display: '汚れっちまった悲しみに。',
    reading: 'よごれっちまったかなしみに。',
    meta: { author: '中原中也', title: '山羊の歌' },
  },
  {
    id: 'takuboku_uni_01',
    display: 'はたらけどはたらけど猶わが生活楽にならざり。',
    reading: 'はたらけどはたらけどなおわがくらしらくにならざり。',
    meta: { author: '石川啄木', title: '一握の砂' },
  },
  {
    id: 'shiki_haiku_01',
    display: '柿くへば鐘が鳴るなり法隆寺。',
    reading: 'かきくえばかねがなるなりほうりゅうじ。',
    meta: { author: '正岡子規', title: '俳句' },
  },
  {
    id: 'basho_haiku_01',
    display: '古池や蛙飛び込む水の音。',
    reading: 'ふるいけやかわずとびこむみずのおと。',
    meta: { author: '松尾芭蕉', title: '俳句' },
  },
  {
    id: 'yosano_midare_01',
    display: '柔肌の熱き血潮に触れもみで。',
    reading: 'やわはだのあつきちしおにふれもみで。',
    meta: { author: '与謝野晶子', title: 'みだれ髪' },
  },
  {
    id: 'miyoshi_yuki_01',
    display: '太郎を眠らせ、太郎の屋根に雪ふりつむ。',
    reading: 'たろうをねむらせ、たろうのやねにゆきふりつむ。',
    meta: { author: '三好達治', title: '雪' },
  },

  // ---------------------------------------------------------
  //  その他・古典 (Others / Classics)
  // ---------------------------------------------------------
  {
    id: 'fukuzawa_gakumon_01',
    display: '天は人の上に人を造らず。',
    reading: 'てんはひとのうえにひとをつくらず。',
    meta: { author: '福澤諭吉', title: '学問のすゝめ' },
  },
  {
    id: 'shimazaki_yoake_01',
    display: '木曽路はすべて山の中である。',
    reading: 'きそじはすべてやまのなかである。',
    meta: { author: '島崎藤村', title: '夜明け前' },
  },
  {
    id: 'kunikida_musashino_01',
    display: '武蔵野の面影は今わずかに入間郡に残っている。',
    reading: 'むさしののおもかげはいまわずかにいるまごおりにのこっている。',
    meta: { author: '国木田独歩', title: '武蔵野' },
  },
  {
    id: 'kobayashi_kani_01',
    display: 'おい地獄さ行ぐんだで！',
    reading: 'おいじごくさいぐんだで！',
    meta: { author: '小林多喜二', title: '蟹工船' },
  },
  {
    id: 'ango_daraku_01',
    display: '生きよ、堕ちよ。',
    reading: 'いきよ、おちよ。',
    meta: { author: '坂口安吾', title: '堕落論' },
  },
  {
    id: 'heike_01',
    display: '祇園精舎の鐘の声。',
    reading: 'ぎおんしょうじゃのかねのこえ。',
    meta: { author: '不詳', title: '平家物語' },
  },
  {
    id: 'heike_02',
    display: '諸行無常の響きあり。',
    reading: 'しょぎょうむじょうのひびきあり。',
    meta: { author: '不詳', title: '平家物語' },
  },
  {
    id: 'hojoki_01',
    display: 'ゆく河の流れは絶えずして。',
    reading: 'ゆくかわのながれはたえずして。',
    meta: { author: '鴨長明', title: '方丈記' },
  },
  {
    id: 'makura_01',
    display: '春はあけぼの。',
    reading: 'はるはあけぼの。',
    meta: { author: '清少納言', title: '枕草子' },
  },
];

export function getRandomSentences(count: number): Sentence[] {
  const arr = [...sentences];
  const n = arr.length;
  count = Math.min(count, n);

  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (n - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
