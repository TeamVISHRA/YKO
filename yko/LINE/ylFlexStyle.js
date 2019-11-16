'use strict'; 
//
// (C) 2019 MilkyVishra <lushe@live.jp>
//
const my  = 'ylFlexStyle.js';
const ver = `yko/${my} v191113`;
//
const baseBgColor = "#BBBBFF",
    titleTxtColor = "#3355AA",
      bodyBgColor = "#DFDFFF",
     bodyTxtColor = "#000000",
   footerTxtColor = "#7777AA",
 DiscordInviteURL = 'https://discord.gg/VBQVU3j',
     titleIconURL = "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTdTYIXX7GbVZo46fvO31a958Q4O6TVJpHlEhN6PUibybOAhJv7";
//
module.exports.create = function (U, A) {
  if (! A || ! A.userName || ! A.text)
      U.throw(`[LINE:FlexStyle] Incomplete argument`);
  const flex = $template_(A.style || 'Discord');
  const Alt = U.tool.Zcut(A.text, 25, '...'),
       Body = flex.body.contents,
       Main = Body[0],
      Links = [],
     Images = [];
  let count = 0;
  return new Promise ( async resolve => {
    A.text = A.text.replace(/(https?\:\/\/[^\s\n]+)/g, x=> {
      if (/\.(?:jpe?g|gif|png)$/i.test(x)) {
        Images.push($imageType_(x));
        return '';
      }
      Links.push([++count, x]);
      return `{ ${$label_(count)} }`;
    });
    if (/^\s*\[[^\]+]\]\s*$/g.test(A.text)) A.text = '';
    Main.text = U.tool.cut(A.text, 700, '...');
    if (Links.length > 0) {
      for (let [label, url] of Links) {
        let image;
        await $requestCheck_(url).then(o=> image = o);
        if (image) {
          Images.push($imageType_(image, url));
          Main.text = Main.text.replace( new RegExp
          (`\s*\\{\\s+LINK\\(${label}\\)\\s+\\}\\s*`, 'g'), '')
          .trim();
        } else {
          Body.push($linkType_($label_(label), url));
        }
      }
    }
    if (! Main.text) Body.shift();
    if (Images.length> 0) Body.splice(Body.length, 0, ...Images);
    return resolve([Alt, flex]);
  });
  function $label_ (label) {
    return `LINK(${label})`;
  }
  async function $requestCheck_ (url) {
    let image;
    await U.root.web.head(url).then(r=> {
      if (r) { let type;
        if (type = r.headers['content-type']) {
          if (/image\/(?:jpeg|gif|png)/i.type) image = url;
      } }
    });
    if (! image) {
      await U.root.web
          .cash(url).then(r=> image = r.pageImage());
    }
    return image;
  }
  function $imageType_ (image, link) {
    return {
         type: "image",
          url: image,
         size: "full",
  aspectRatio: "2:1",
   aspectMode: "cover",
       action: { type: "uri", uri: (link || image) }
    };
  }
  function $linkType_ (label, url) {
    return {
      type: "button",
     style: "link",
    height: "sm",
    action: { type: "uri",
    uri: url,
  label: label // U.tool.cut(url, 35, '...')
      }
    };
  }
  function $template_ (style) {
    switch (style.toLowerCase()) {
      case 'discord':
        return $DiscordStyle();
        break;
      default:
        U.throw(`[LINE:FlexStyle] There is no '${style}'.`);
    }
  }
  function $DiscordStyle () {
    return {
  "type": "bubble",
  "header": {
    "type": "box",
    "layout": "baseline",
    "paddingAll": "2px",
    "paddingStart": "xl",
    "backgroundColor": baseBgColor,
    "spacing": "md",
    "action": {
      "type": "uri",
      "uri": DiscordInviteURL
    },
    "contents": [
      {
        "type": "icon",
        "size": "sm",
        "url": titleIconURL
      },
      {
        "type": "text",
        "color": titleTxtColor,
        "text": A.userName,
        "weight": "bold",
        "size": "sm",
        "flex": 5
      }
    ],
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "paddingAll": "10px",
    "backgroundColor": bodyBgColor,
    "contents": [
      {
        "type": "text",
        "text": "",
        "color": bodyTxtColor,
        "size": "sm",
        "wrap": true
      }
    ],
  },
  "footer": {
    "backgroundColor": baseBgColor,
    "type": "box",
    "layout": "vertical",
    "paddingAll": "0px",
    "paddingEnd": "xxl",
    "contents": [
      {
        "type": "text",
        "text": "by Discord",
        "color": footerTxtColor,
        "size": "xxs",
        "align": "end"
      }
    ]
  }
};
  }
}
