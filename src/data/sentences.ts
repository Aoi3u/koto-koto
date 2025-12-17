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
    // Aozora Bunko - Natsume Soseki
    {
        id: "aozora_soseki_kokoro_01",
        display: "私はその人を常に先生と呼んでいた。",
        reading: "わたしはそのひとをつねにせんせいとよんでいた。",
        meta: { author: "夏目漱石", title: "こころ" },
    },
    {
        id: "aozora_soseki_botchan_01",
        display: "親譲りの無鉄砲で小供の時から損ばかりしている。",
        reading: "おやゆずりのむてっぽうでこどものときからそんばかりしている。",
        meta: { author: "夏目漱石", title: "坊っちゃん" },
    },
    {
        id: "aozora_soseki_kusamakura_01",
        display: "山路を登りながら、こう考えた。",
        reading: "やまみちをのぼりながら、こうかんがえた。",
        meta: { author: "夏目漱石", title: "草枕" },
    },
    {
        id: "aozora_soseki_sorekara_01",
        display: "恋は罪悪ですか。",
        reading: "こいはざいあくですか。",
        meta: { author: "夏目漱石", title: "それから" },
    },
    {
        id: "aozora_soseki_wagahai_01",
        display: "吾輩は猫である。名前はまだ無い。",
        reading: "わがはいはねこである。なまえはまだない。",
        meta: { author: "夏目漱石", title: "吾輩は猫である" },
    },
    {
        id: "aozora_soseki_kokoro_02",
        display: "先生は私に何か言いたそうな顔をして、黙って歩いていた。",
        reading:
            "せんせいはわたしになにかいいたそうなかおをして、だまってあるいていた。",
        meta: { author: "夏目漱石", title: "こころ" },
    },
    // Aozora Bunko - Dazai Osamu
    {
        id: "aozora_dazai_melos_01",
        display: "メロスは激怒した。",
        reading: "めろすはげきどした。",
        meta: { author: "太宰治", title: "走れメロス" },
    },
    {
        id: "aozora_dazai_melos_02",
        display: "必ず、かの邪智暴虐の王を除かなければならぬと決意した。",
        reading:
            "かならず、かのじゃちぼうぎゃくのおうをのぞかなければならぬとけついした。",
        meta: { author: "太宰治", title: "走れメロス" },
    },
    {
        id: "aozora_dazai_shikkaku_01",
        display: "恥の多い生涯を送ってきました。",
        reading: "はじのおおいしょうがいをおくってきました。",
        meta: { author: "太宰治", title: "人間失格" },
    },
    {
        id: "aozora_dazai_shikkaku_02",
        display: "生まれて、すみません。",
        reading: "うまれて、すみません。",
        meta: { author: "太宰治", title: "人間失格" },
    },
    // Aozora Bunko - Miyazawa Kenji
    {
        id: "aozora_miyazawa_ginga_01",
        display: "ジョバンニは、学校の帰りに活版所へ行きました。",
        reading: "じょばんには、がっこうのかえりにかっぱんじょへいきました。",
        meta: { author: "宮沢賢治", title: "銀河鉄道の夜" },
    },
    {
        id: "aozora_miyazawa_cello_01",
        display: "ゴーシュは町の活動写真館でセロを弾く係でした。",
        reading:
            "ごーしゅはまちのかつどうしゃしんかんでせろをひくかかりでした。",
        meta: {
            author: "宮沢賢治",
            title: "セロ弾きのゴーシュ",
        },
    },
    {
        id: "aozora_miyazawa_ame_01",
        display: "雨ニモマケズ、風ニモマケズ、雪ニモ夏ノ暑サニモマケヌ。",
        reading:
            "あめにもまけず、かぜにもまけず、ゆきにもなつのあつさにもまけぬ。",
        meta: { author: "宮沢賢治", title: "雨ニモマケズ" },
    },
    {
        id: "aozora_miyazawa_yodaka_01",
        display:
            "よだかは、もう、どうしても空へ飛び上がらなければならないと思いました。",
        reading:
            "よだかは、もう、どうしても、そらへ、とびあがらなければならないとおもいました。",
        meta: { author: "宮沢賢治", title: "よだかの星" },
    },
    {
        id: "aozora_miyazawa_matasaburo_01",
        display: "どっどど、どどうど、どどうど、どどう。",
        reading: "どっどど、どどうど、どどうど、どどう。",
        meta: { author: "宮沢賢治", title: "風の又三郎" },
    },
    {
        id: "aozora_miyazawa_choki_01",
        display: "実は私達二人は旅人ではなく、狩人なのだ。",
        reading: "じつはわたしたちふたりはたびびとではなく、かりゅうどなのだ。",
        meta: { author: "宮沢賢治", title: "注文の多い料理店" },
    },
    {
        id: "aozora_miyazawa_tsugihagi_01",
        display: "そういう記録が今まで誰によって作られたでしょうか。",
        reading: "そういうきろくがいままでだれによってつくられたでしょうか。",
        meta: { author: "宮沢賢治", title: "よく利く薬と虎ノ巻" },
    },
    // Aozora Bunko - Akutagawa Ryunosuke
    {
        id: "aozora_akutagawa_rashoumon_01",
        display:
            "ある日の暮方の事である。一人の下人が羅生門の下で雨やみを待っていた。",
        reading:
            "あるひのくれがたのことである。ひとりのげにんがらしょうもんのしたであまやみをまっていた。",
        meta: { author: "芥川龍之介", title: "羅生門" },
    },
    {
        id: "aozora_akutagawa_kumo_01",
        display: "蜘蛛の糸は、靴の爪の先ほどの太さに見えた。",
        reading: "くものいとは、くつのつめのさきほどのふとさにみえた。",
        meta: { author: "芥川龍之介", title: "蜘蛛の糸" },
    },
    {
        id: "aozora_akutagawa_toshisyun_01",
        display: "唐の末の世です。",
        reading: "とうのすえのよです。",
        meta: { author: "芥川龍之介", title: "杜子春" },
    },
    // Aozora Bunko - Nakajima Atsushi
    {
        id: "aozora_nakajima_sanyatsuki_01",
        display: "我が輩のこの仕儀となったのは、都て自分のさたりとする所なり。",
        reading:
            "わがはいのこのしぎとなったのは、ことごとくじぶんのさたりとするところなり。",
        meta: { author: "中島敦", title: "山月記" },
    },
    // Aozora Bunko - Shimizaki Toson
    {
        id: "aozora_shimazaki_yoakemai_01",
        display: "木曽路はすべて山のうち。",
        reading: "きそじはすべてやまのうち。",
        meta: { author: "島崎藤村", title: "夜明け前" },
    },
    // Aozora Bunko - Higuchi Ichiyo
    {
        id: "aozora_higuchi_takekurabe_01",
        display: "下谷の玉姫の稲荷の、門前の娘たちが、月の晴れた晩など。",
        reading:
            "したやのたまひめのいなりの、もんぜんのむすめたちが、つきのはれたばんなど。",
        meta: { author: "樋口一葉", title: "たけくらべ" },
    },
    // Additional Aozora entries
    // Natsume Soseki - Yume Juya
    {
        id: "aozora_soseki_yumejuya_01",
        display: "こんな夢を見た。",
        reading: "こんなゆめをみた。",
        meta: { author: "夏目漱石", title: "夢十夜" },
    },
    // Natsume Soseki - Kusamakura famous lines
    {
        id: "aozora_soseki_kusamakura_02",
        display: "智に働けば角が立つ。情に棹させば流される。",
        reading: "ちにはたらけばかどがたつ。じょうにさおさせばながされる。",
        meta: { author: "夏目漱石", title: "草枕" },
    },
    {
        id: "aozora_soseki_kokoro_03",
        display: "私が先生と知り合いになったのは鎌倉であった。",
        reading: "わたしがせんせいとしりあいになったのはかまくらであった。",
        meta: { author: "夏目漱石", title: "こころ" },
    },
    {
        id: "aozora_soseki_wagahai_02",
        display: "どこで生れたかとんと見当がつかぬ。",
        reading: "どこでうまれたかとんとけんとうがつかぬ。",
        meta: { author: "夏目漱石", title: "吾輩は猫である" },
    },
    // Mori Ogai
    {
        id: "aozora_ogai_maihime_01",
        display: "石炭をば早や積み果てつ。",
        reading: "せきたんをばはやつみはてつ。",
        meta: { author: "森鴎外", title: "舞姫" },
    },
    {
        id: "aozora_ogai_takasebune_01",
        display: "この国には高瀬舟というものがある。",
        reading: "このくににはたかせぶねというものがある。",
        meta: { author: "森鴎外", title: "高瀬舟" },
    },
    // Dazai Osamu - more
    {
        id: "aozora_dazai_melos_03",
        display: "メロスは村の牧人であった。",
        reading: "めろすはむらのぼくじんであった。",
        meta: { author: "太宰治", title: "走れメロス" },
    },
    // Miyazawa Kenji - more
    {
        id: "aozora_miyazawa_ginga_02",
        display: "カムパネルラはそっと笑いました。",
        reading: "かむぱねるらはそっとわらいました。",
        meta: { author: "宮沢賢治", title: "銀河鉄道の夜" },
    },
    {
        id: "aozora_miyazawa_chuumon_02",
        display: "二人は山猫の看板を見た。",
        reading: "ふたりはやまねこのかんばんをみた。",
        meta: { author: "宮沢賢治", title: "注文の多い料理店" },
    },
    // Akutagawa Ryunosuke - more
    {
        id: "aozora_akutagawa_rashoumon_02",
        display: "下人の行方は、誰も知らない。",
        reading: "げにんのゆくえは、だれもしらない。",
        meta: { author: "芥川龍之介", title: "羅生門" },
    },
    {
        id: "aozora_akutagawa_kappa_01",
        display: "ある日、私は河童の国へ行った。",
        reading: "あるひ、わたしはかっぱのくにへいった。",
        meta: { author: "芥川龍之介", title: "河童" },
    },
    // Nakajima Atsushi - more
    {
        id: "aozora_nakajima_meijinden_01",
        display: "荘子に、弓の名人の伝がある。",
        reading: "そうしに、ゆみのめいじんのでんがある。",
        meta: { author: "中島敦", title: "名人伝" },
    },
    // Shimizaki Toson - poem
    {
        id: "aozora_shimazaki_hatsukoi_01",
        display: "まだあげ初めし前髪の。",
        reading: "まだあげそめしまえがみの。",
        meta: { author: "島崎藤村", title: "初恋" },
    },
    // Higuchi Ichiyo - more
    {
        id: "aozora_higuchi_nigorie_01",
        display: "去年の暮れのことでございます。",
        reading: "きょねんのくれのことでございます。",
        meta: { author: "樋口一葉", title: "にごりえ" },
    },
    {
        id: "aozora_higuchi_juusanya_01",
        display: "十月の十三夜のことであった。",
        reading: "じゅうがつのじゅうさんやのことであった。",
        meta: { author: "樋口一葉", title: "十三夜" },
    },
    // Fukuzawa Yukichi
    {
        id: "aozora_fukuzawa_gakumon_01",
        display: "天は人の上に人を造らず人の下に人を造らず。",
        reading: "てんはひとのうえにひとをつくらずひとのしたにひとをつくらず。",
        meta: { author: "福澤諭吉", title: "学問のすゝめ" },
    },
    // Kunikida Doppo
    {
        id: "aozora_kunikida_musashino_01",
        display: "武蔵野は広い。",
        reading: "むさしのはひろい。",
        meta: { author: "国木田独歩", title: "武蔵野" },
    },
    // Koda Rohan
    {
        id: "aozora_koda_gojoutou_01",
        display: "ある日、町に大風が吹いた。",
        reading: "あるひ、まちにおおかぜがふいた。",
        meta: { author: "幸田露伴", title: "五重塔" },
    },
    // Matsuo Basho (Haiku)
    {
        id: "aozora_basho_haiku_01",
        display: "古池や蛙飛び込む水の音。",
        reading: "ふるいけや、かわずとびこむ、みずのおと。",
        meta: { author: "松尾芭蕉", title: "俳句" },
    },
    // Masaoka Shiki (Haiku)
    {
        id: "aozora_shiki_haiku_01",
        display: "柿くへば鐘が鳴るなり法隆寺。",
        reading: "かきくえばかねがなるなりほうりゅうじ。",
        meta: { author: "正岡子規", title: "俳句" },
    },
];

export function getRandomSentences(count: number): Sentence[] {
    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, sentences.length));
}
