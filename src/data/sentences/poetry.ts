import type { Sentence } from './types';

// 詩歌・俳句 (Poetry - 四季を詠んだ句)
export const poetrySentences: Sentence[] = [
  {
    id: 'basho_okunohosomichi_01',
    display: '夏草や兵どもが夢の跡。',
    reading: 'なつくさやつわものどもがゆめのあと。',
    meta: { author: '松尾芭蕉', title: 'おくのほそ道' },
  },
  {
    id: 'basho_jisei_01',
    display: '旅に病んで夢は枯野を駆け巡る。',
    reading: 'たびにやんでゆめはかれのをかけめぐる。',
    meta: { author: '松尾芭蕉', title: '辞世の句' },
  },
  {
    id: 'buson_nanohana_01',
    display: '菜の花や月は東に日は西に。',
    reading: 'なのはなやつきはひがしにひはにしに。',
    meta: { author: '与謝蕪村', title: '俳句' },
  },
  {
    id: 'sodo_hatsugatsuo_01',
    display: '目には青葉山ほととぎす初鰹。',
    reading: 'めにはあおばやまほととぎすはつがつお。',
    meta: { author: '山口素堂', title: '俳句' },
  },
  {
    id: 'issa_suzume_01',
    display: '雀の子そこのけそこのけお馬が通る。',
    reading: 'すずめのこそこのけそこのけおうまがとおる。',
    meta: { author: '小林一茶', title: '俳句' },
  },
  {
    id: 'issa_meigetsu_01',
    display: '名月を取ってくれろと泣く子かな。',
    reading: 'めいげつをとってくれろとなくこかな。',
    meta: { author: '小林一茶', title: '俳句' },
  },
];
