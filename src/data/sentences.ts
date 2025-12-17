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
    // --- 夏目漱石 ---
    {
        id: "soseki_kokoro_01",
        display: "私はその人を常に先生と呼んでいた。",
        reading: "わたしはそのひとをつねにせんせいとよんでいた。",
        meta: { author: "夏目漱石", title: "こころ" },
    },
    {
        id: "soseki_botchan_01",
        display: "親譲りの無鉄砲で小供の時から損ばかりしている。",
        reading: "おやゆずりのむてっぽうでこどものときからそんばかりしている。",
        meta: { author: "夏目漱石", title: "坊っちゃん" },
    },
    {
        id: "soseki_kusamakura_01",
        display: "山路を登りながら、こう考えた。",
        reading: "やまみちをのぼりながら、こうかんがえた。",
        meta: { author: "夏目漱石", title: "草枕" },
    },
    {
        id: "soseki_sorekara_01",
        display: "恋は罪悪ですか。",
        reading: "こいはざいあくですか。",
        meta: { author: "夏目漱石", title: "それから" },
    },
    {
        id: "soseki_wagahai_01",
        display: "吾輩は猫である。名前はまだ無い。",
        reading: "わがはいはねこである。なまえはまだない。",
        meta: { author: "夏目漱石", title: "吾輩は猫である" },
    },
    {
        id: "soseki_kokoro_02",
        display: "先生は私に何か言いたそうな顔をして、黙って歩いていた。",
        reading: "せんせいはわたしになにかいいたそうなかおをして、だまってあるいていた。",
        meta: { author: "夏目漱石", title: "こころ" },
    },
    {
        id: "soseki_kusamakura_02",
        display: "智に働けば角が立つ。情に棹させば流される。",
        reading: "ちにはたらけばかどがたつ。じょうにさおさせばながされる。",
        meta: { author: "夏目漱石", title: "草枕" },
    },
    {
        id: "soseki_yumejuya_01",
        display: "こんな夢を見た。",
        reading: "こんなゆめをみた。",
        meta: { author: "夏目漱石", title: "夢十夜" },
    },
    {
        id: "soseki_sorekara_01",
        display: "歩くのは僕の性分でない。僕は電車へ乗る。",
        reading: "あるくのはぼくのしょうぶんでない。ぼくはでんしゃへのる。",
        meta: { author: "夏目漱石", title: "それから" },
    },

    // --- 太宰治 ---
    {
        id: "dazai_melos_01",
        display: "メロスは激怒した。",
        reading: "めろすはげきどした。",
        meta: { author: "太宰治", title: "走れメロス" },
    },
    {
        id: "dazai_melos_02",
        display: "必ず、かの邪智暴虐の王を除かなければならぬと決意した。",
        reading: "かならず、かのじゃちぼうぎゃくのおうをのぞかなければならぬとけついした。",
        meta: { author: "太宰治", title: "走れメロス" },
    },
    {
        id: "dazai_shikkaku_01",
        display: "恥の多い生涯を送ってきました。",
        reading: "はじのおおいしょうがいをおくってきました。",
        meta: { author: "太宰治", title: "人間失格" },
    },
    {
        id: "dazai_kishu_01",
        display: "生まれて、すみません。",
        reading: "うまれて、すみません。",
        meta: { author: "太宰治", title: "二十世紀旗手" },
    },
    {
        id: "dazai_melos_03",
        display: "メロスは村の牧人である。",
        reading: "めろすはむらのぼくじんである。",
        meta: { author: "太宰治", title: "走れメロス" },
    },
    {
        id: "dazai_shayou_01",
        display: "人間は、恋と革命のために生れて来たのだ。",
        reading: "にんげんは、こいとかくめいのためにうまれてきたのだ。",
        meta: { author: "太宰治", title: "斜陽" },
    },
    {
        id: "dazai_goodbye_01",
        display: "花に嵐のたとえもあるさ。さよならだけが人生だ。",
        reading: "はなにあらしのたとえもあるさ。さよならだけがじんせいだ。",
        meta: { author: "太宰治（井伏鱒二訳）", title: "勧酒" }, // 漢詩の訳として有名
    },

    // --- 宮沢賢治 ---
    {
        id: "miyazawa_ginga_01",
        display: "ジョバンニは、学校の帰りに活版所へ行きました。",
        reading: "じょばんには、がっこうのかえりにかっぱんじょへいきました。",
        meta: { author: "宮沢賢治", title: "銀河鉄道の夜" },
    },
    {
        id: "miyazawa_ginga_02",
        display: "この切符さえあれば、どこまででも行ける。",
        reading: "このきっぷさえあれば、どこまででもいける。",
        meta: { author: "宮沢賢治", title: "銀河鉄道の夜" },
    },
    {
        id: "miyazawa_cello_01",
        display: "ゴーシュは町の活動写真館でセロを弾く係でした。",
        reading: "ごーしゅはまちのかつどうしゃしんかんでせろをひくかかりでした。",
        meta: { author: "宮沢賢治", title: "セロ弾きのゴーシュ" },
    },
    {
        id: "miyazawa_ame_01",
        display: "雨ニモマケズ、風ニモマケズ。",
        reading: "あめにもまけず、かぜにもまけず。",
        meta: { author: "宮沢賢治", title: "雨ニモマケズ" },
    },
    {
        id: "miyazawa_yodaka_01",
        display: "よだかは、実直な顔をしています。",
        reading: "よだかは、じっちょくなかおをしています。",
        meta: { author: "宮沢賢治", title: "よだかの星" },
    },
    {
        id: "miyazawa_matasaburo_01",
        display: "どっどど、どどうど、どどうど、どどう。",
        reading: "どっどど、どどうど、どどうど、どどう。",
        meta: { author: "宮沢賢治", title: "風の又三郎" },
    },
    {
        id: "miyazawa_chuumon_01",
        display: "当軒は注文の多い料理店ですからどうかそこはご承知ください。",
        reading: "とうけんはちゅうもんのおおいりょうりてんですからどうかそこはごしょうちください。",
        meta: { author: "宮沢賢治", title: "注文の多い料理店" },
    },
    {
        id: "miyazawa_yamanashi_01",
        display: "クラムボンはかぷかぷわらったよ。",
        reading: "くらむぼんはかぷかぷわらったよ。",
        meta: { author: "宮沢賢治", title: "やまなし" },
    },
    {
        id: "miyazawa_harutosyura_01",
        display: "おれはひとりの修羅なのだ。",
        reading: "おれはひとりのしゅらなのだ。",
        meta: { author: "宮沢賢治", title: "春と修羅" },
    },

    // --- 芥川龍之介 ---
    {
        id: "akutagawa_rashoumon_01",
        display: "ある日の暮方の事である。一人の下人が羅生門の下で雨やみを待っていた。",
        reading: "あるひのくれがたのことである。ひとりのげにんがらしょうもんのしたであまやみをまっていた。",
        meta: { author: "芥川龍之介", title: "羅生門" },
    },
    {
        id: "akutagawa_kumo_01",
        display: "蜘蛛の糸は、己のものだぞ。",
        reading: "くものいとは、おれのものだぞ。",
        meta: { author: "芥川龍之介", title: "蜘蛛の糸" },
    },
    {
        id: "akutagawa_toshisyun_01",
        display: "或春の日暮です。",
        reading: "あるはるのひぐれです。",
        meta: { author: "芥川龍之介", title: "杜子春" },
    },
     {
        id: "akutagawa_kappa_01",
        display: "僕はある夏の日、穂高山へ登ろうとした。",
        reading: "ぼくはあるなつのひ、ほたかやまへのぼろうとした。",
        meta: { author: "芥川龍之介", title: "河童" },
    },
    {
        id: "akutagawa_hana_01",
        display: "人の不幸には、どこかそれを見て喜ぶような心持ちがあるものだ。",
        reading: "ひとのふこうには、どこかそれをみてよろこぶようなこころもちがあるものだ。",
        meta: { author: "芥川龍之介", title: "鼻" },
    },

    // --- 中島敦 ---
    {
        id: "nakajima_sangetsuki_01",
        display: "臆病な自尊心と、尊大な羞恥心との所為である。",
        reading: "おくびょうなじそんしんと、そんだいなしゅうちしんとのせいである。",
        meta: { author: "中島敦", title: "山月記" },
    },
    {
        id: "nakajima_sangetsuki_02",
        display: "その声は、我が友、李徴子ではないか。",
        reading: "そのこえは、わがとも、りちょうしではないか。",
        meta: { author: "中島敦", title: "山月記" },
    },
    {
        id: "nakajima_meijinden_01",
        display: "古の列子に、その技を学ばんとして関尹子に就いた話がある。",
        reading: "いにしえのれっしに、そのわざをまなばんとしてかんいんしについたはなしがある。",
        meta: { author: "中島敦", title: "名人伝" },
    },

    // --- 島崎藤村 ---
    {
        id: "shimazaki_yoakemai_01",
        display: "木曽路はすべて山の中である。",
        reading: "きそじはすべてやまのなかである。",
        meta: { author: "島崎藤村", title: "夜明け前" },
    },
    {
        id: "shimazaki_hatsukoi_01",
        display: "まだあげ初めし前髪の。",
        reading: "まだあげそめしまえがみの。",
        meta: { author: "島崎藤村", title: "初恋" },
    },

    // --- 樋口一葉 ---
    {
        id: "higuchi_takekurabe_01",
        display: "廻れば大門の見返り柳いと長けれど、お歯ぐろ溝に燈火うつる三階の騒ぎも手に取る如く。",
        reading: "めぐればおおもんのみかえりやなぎいとながけれど、おはぐろどぶにともしびうつるさんかいのさわぎもてにとるごとく。",
        meta: { author: "樋口一葉", title: "たけくらべ" },
    },

    // --- 福澤諭吉 ---
    {
        id: "fukuzawa_gakumon_01",
        display: "天は人の上に人を造らず人の下に人を造らずと言えり。",
        reading: "てんはひとのうえにひとをつくらずひとのしたにひとをつくらずといえり。",
        meta: { author: "福澤諭吉", title: "学問のすゝめ" },
    },

    // --- 国木田独歩 ---
    {
        id: "kunikida_musashino_01",
        display: "武蔵野の面影は今わずかに入間郡に残っている。",
        reading: "むさしののおもかげはいまわずかにいるまごおりにのこっている。",
        meta: { author: "国木田独歩", title: "武蔵野" },
    },

    // --- 幸田露伴 ---
    {
        id: "koda_gojoutou_01",
        display: "木屑を焚くのにも、大工の棟梁ともあろうものが、十兵衛は顔を背けて、けむたがっていた。",
        reading: "きくずをたくのにも、だいくのとうりょうともあろうものが、じゅうべえはかおをそむけて、けむたがっていた。",
        meta: { author: "幸田露伴", title: "五重塔" },
    },

    // --- 森鴎外 ---
    {
        id: "ogai_maihime_01",
        display: "石炭をば早や積み果てつ。",
        reading: "せきたんをばはやつみはてつ。",
        meta: { author: "森鴎外", title: "舞姫" },
    },
    {
        id: "ogai_takasebune_01",
        display: "高瀬舟は京都の高瀬川を上下する小舟である。",
        reading: "たかせぶねはきょうとのたかせがわをじょうげするこぶねである。",
        meta: { author: "森鴎外", title: "高瀬舟" },
    },

    // ---------------------------------------------------------
    //  古典の冒頭 (Classics) - 教養として必須
    // ---------------------------------------------------------
    {
        id: "classic_heike_01",
        display: "祇園精舎の鐘の声、諸行無常の響きあり。",
        reading: "ぎおんしょうじゃのかねのこえ、しょぎょうむじょうのひびきあり。",
        meta: { author: "不詳", title: "平家物語" },
    },
    {
        id: "classic_hojoki_01",
        display: "ゆく河の流れは絶えずして、しかももとの水にあらず。",
        reading: "ゆくかわのながれはたえずして、しかももとのみずにあらず。",
        meta: { author: "鴨長明", title: "方丈記" },
    },
    {
        id: "classic_tsurezure_01",
        display: "つれづれなるままに、日暮らし、硯にむかひて。",
        reading: "つれづれなるままに、ひぐらし、すずりにむかいて。",
        meta: { author: "吉田兼好", title: "徒然草" },
    },
    {
        id: "classic_genji_01",
        display: "いづれの御時にか、女御、更衣あまたさぶらひたまひける中に。",
        reading: "いずれのおおんときにか、にょうご、こういあまたさぶらいたまいけるなかに。",
        meta: { author: "紫式部", title: "源氏物語" },
    },
];

export function getRandomSentences(count: number): Sentence[] {
    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, sentences.length));
}